package repository

import (
	"database/sql"
	"fmt"
	"log/slog"
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
)
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
	FOREIGN key (owner_id) REFERENCES users(id),
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
	CreateUser(max_id string)
	FindUserByMaxId(max_id string) *models.UserDb
	CreateHabit(user_id int, habit_name string, habit_category string) error
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

func (r *Repository) CreateUser(max_id string) {
	// TODO
}

func (r *Repository) FindUserByMaxId(max_id string) *models.UserDb {
	// TODO
	return &models.UserDb{}
}

func (r *Repository) Stop() {
	slog.Info("closing db")
	r.Db.Close()
}

func (r *Repository) CreateHabit(user_id int, habit_name string, habit_category string) error {
	res := r.Db.QueryRow(`SELECT id FROM habit_categories WHERE user_id = $1 AND name = $2`, user_id, habit_category)
	var categoryId int64
	if res.Err() == sql.ErrNoRows {
		res, err := r.Db.Exec(`
			INSERT INTO habit_categories (user_id, name) VALUES ($1, $2) RETURNING id
		`, user_id, habit_category)
		if err != nil {
			return err
		}
		categoryId, err = res.LastInsertId()
		if err != nil {
			return err
		}
	} else if res.Err() != nil {
		return res.Err()
	} else {
		res.Scan(&categoryId)
	}
	_, err := r.Db.Exec(`
		INSERT INTO habits (user_id, habit_category_id, name) VALUES ($1, $2, $3)
	`, user_id, categoryId, habit_name)
	if err != nil {
		return err
	}
	return nil
}