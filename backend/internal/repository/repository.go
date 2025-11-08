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
CREATE TABLE IF NOT EXISTS habits(
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id),
	name VARCHAR(255) NOT NULL,
	active BOOLEAN NOT NULL
);
CREATE TABLE IF NOT EXISTS duels(
	id SERIAL PRIMARY KEY,
	habit_id INTEGER NOT NULL,
	user1_id INTEGER NOT NULL,
	user2_id INTEGER NOT NULL,
	FOREIGN KEY (habit_id) REFERENCES habits(id),
	FOREIGN KEY (user1_id) REFERENCES users(id),
	FOREIGN KEY (user2_id) REFERENCES users(id),
	start_date DATE NOT NULL DEFAULT CURRENT_DATE,
	winner_id INTEGER NOT NULL,
	FOREIGN KEY (winner_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS logs(
	id SERIAL PRIMARY KEY,
	owner_id INTEGER NOT NULL,
	FOREIGN key (owner_id) REFERENCES users(id),
	message TEXT,
	photo BYTEA
);
`

type RepositoryInterface interface {
	CreateUser(max_id string) (*models.UserDb, error)
	FindUserByMaxId(max_id string) (*models.UserDb, error)
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
