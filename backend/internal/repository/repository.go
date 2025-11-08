package repository

import (
	"database/sql"
	"fmt"
	"log/slog"
	"maxbot/internal/dto"
	"maxbot/internal/models"
	"os"

	"github.com/jmoiron/sqlx"
)

const schema = `
CREATE TABLE IF NOT EXISTS users(
	id SERIAL PRIMARY KEY,
	max_id VARCHAR(255) UNIQUE NOT NULL,
	streak INTEGER DEFAULT 0,
	wins INTEGER DEFAULT 0,
	loses INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS habit_categories(
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id),
	name VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS habits(
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	habit_category_id INTEGER NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (habit_category_id) REFERENCES habit_categories(id),
	name VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS duel_status(
	id SERIAL PRIMARY KEY,
	value VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS duels(
	id SERIAL PRIMARY KEY,
	habit_id INTEGER NOT NULL,
	user1_id INTEGER NOT NULL,
	user2_id INTEGER,
	FOREIGN KEY (habit_id) REFERENCES habits(id),
	FOREIGN KEY (user1_id) REFERENCES users(id),
	FOREIGN KEY (user2_id) REFERENCES users(id),
	start_date DATE NOT NULL DEFAULT CURRENT_DATE,
	end_date DATE NOT NULL,
	winner_id INTEGER,
	FOREIGN KEY (winner_id) REFERENCES users(id),
	status_id INTEGER NOT NULL,
	FOREIGN KEY (status_id) REFERENCES duel_status(id)
);
CREATE TABLE IF NOT EXISTS logs(
	id SERIAL PRIMARY KEY,
	owner_id INTEGER NOT NULL,
	duel_id INTEGER NOT NULL,
	FOREIGN KEY (owner_id) REFERENCES users(id),
	FOREIGN KEY (duel_id) REFERENCES duels(id),
	message TEXT,
	photo BYTEA
);
CREATE TABLE IF NOT EXISTS invitations(
	id SERIAL PRIMARY KEY,
	generatedHash TEXT,
	duel_id INTEGER NOT NULL,
	FOREIGN KEY (duel_id) REFERENCES duels(id)
);

INSERT INTO duel_status (value) VALUES ('invited');
INSERT INTO duel_status (value) VALUES ('active');
INSERT INTO duel_status (value) VALUES ('ended');
`

type RepositoryInterface interface {
	CreateUser(maxID string) (*models.UserDb, error)
	FindUserByMaxId(maxID string) (*models.UserDb, error)
	CreateHabit(user_id int64, habit_name string, habit_category string) error
	FindHabitsByUserId(user_id int64) ([]dto.HabitDto, error)
	Stop()
}

type Repository struct {
	Db *sqlx.DB
}

func New() *Repository {
	connectionString := fmt.Sprintf(
		"user=%v password=%v dbname=%v port=%v host=host.docker.internal sslmode=disable",
		os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"), os.Getenv("DB_PORT"),
	)
	db, err := sqlx.Connect("postgres", connectionString)
	if err != nil {
		slog.Error("error while connecting to db: ", err.Error())
	}
	db.MustExec(schema)

	return &Repository{Db: db}
}

var _ RepositoryInterface = &Repository{}

func (r *Repository) CreateUser(maxID string) (*models.UserDb, error) {
	var user models.UserDb
	query := `
		INSERT INTO users (max_id, streak, wins, loses) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id, max_id, streak, wins, loses
	`
	err := r.Db.QueryRow(query, maxID, 0, 0, 0).Scan(
		&user.ID, &user.MaxID, &user.Streak, &user.Wins, &user.Losses,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) FindUserByMaxId(maxID string) (*models.UserDb, error) {
	var user models.UserDb
	err := r.Db.QueryRow(`
		SELECT id, max_id, streak, wins, loses 
		FROM users 
		WHERE max_id = $1
	`, maxID).Scan(&user.ID, &user.MaxID, &user.Streak, &user.Wins, &user.Losses)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *Repository) Stop() {
	slog.Info("closing db")
	r.Db.Close()
}

func (r *Repository) CreateHabit(user_id int64, habit_name string, habit_category string) error {
	res := r.Db.QueryRow(`SELECT id FROM habit_categories WHERE user_id = $1 AND name = $2`, user_id, habit_category)
	var categoryId int64
	err := res.Scan(&categoryId)
	if err == sql.ErrNoRows {
		err = r.Db.QueryRow(`
			INSERT INTO habit_categories (user_id, name) VALUES ($1, $2) RETURNING id
		`, user_id, habit_category).Scan(&categoryId)
		if err != nil {
			return err
		}
	} else if err != nil {
		return res.Err()
	}
	_, err = r.Db.Exec(`
		INSERT INTO habits (user_id, habit_category_id, name) VALUES ($1, $2, $3)
	`, user_id, categoryId, habit_name)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) FindHabitsByUserId(user_id int64) ([]dto.HabitDto, error) {
	rows, err := r.Db.Query(
		`SELECT h.name AS habit_name, hc.name AS category_name FROM habits h
		JOIN habit_categories hc ON h.habit_category_id = hc.id
		WHERE h.user_id = $1`,
		user_id,
	)
	if err != nil {
		return nil, err
	}
	var habits []dto.HabitDto = []dto.HabitDto{}
	for rows.Next() {
		habit := dto.HabitDto{}
		rows.Scan(&habit.Name, &habit.Category)
		habits = append(habits, habit)
	}
	return habits, nil
}