package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"math/rand"
	"maxbot/internal/dto"
	"maxbot/internal/models"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
)

const schema = `
CREATE TABLE IF NOT EXISTS users(
	id SERIAL PRIMARY KEY,
	max_id VARCHAR(255) UNIQUE NOT NULL,
	first_name VARCHAR(255) NOT NULL,
	photo_url VARCHAR(255),
	streak INTEGER DEFAULT 0,
	wins INTEGER DEFAULT 0,
	last_time_contributed DATE
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
	duration INTEGER NOT NULL,
	habit_id INTEGER NOT NULL,
	user1_id INTEGER NOT NULL,
	user2_id INTEGER,
	FOREIGN KEY (habit_id) REFERENCES habits(id),
	FOREIGN KEY (user1_id) REFERENCES users(id),
	FOREIGN KEY (user2_id) REFERENCES users(id),
	user1_completed INTEGER DEFAULT 0,
	user2_completed INTEGER DEFAULT 0,
	start_date DATE NOT NULL DEFAULT CURRENT_DATE,
	end_date DATE,
	winner_id INTEGER DEFAULT NULL,
	FOREIGN KEY (winner_id) REFERENCES users(id),
	status_id INTEGER NOT NULL,
	FOREIGN KEY (status_id) REFERENCES duel_status(id)
);
CREATE TABLE IF NOT EXISTS logs(
	id SERIAL PRIMARY KEY,
	owner_id INTEGER NOT NULL,
	duel_id INTEGER NOT NULL,
	created_at DATE NOT NULL DEFAULT CURRENT_DATE,
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

INSERT INTO duel_status (value) SELECT 'invited' WHERE NOT EXISTS (SELECT 1 FROM duel_status WHERE value = 'invited');
INSERT INTO duel_status (value) SELECT 'active' WHERE NOT EXISTS (SELECT 1 FROM duel_status WHERE value = 'active');
INSERT INTO duel_status (value) SELECT 'ended' WHERE NOT EXISTS (SELECT 1 FROM duel_status WHERE value = 'ended');
`

type RepositoryInterface interface {
	CreateUser(maxID string, firstName string, photoUrl string) (*models.UserDb, error)
	FindUserByMaxId(maxID string) (*models.UserDb, error)
	FindUserById(id int64) (*models.UserDb, error)
	CreateHabit(user_id int64, habit_name string, habit_category string) error
	FindHabitsByUserId(user_id int64) ([]dto.HabitDto, error)
	CreateDuel(user_id int64, habit_id int, random_hash string, days int) error
	ActivateDuelFromInvitationHash(user_id int64, invitationHash string) error
	GetDuelById(duel_id int64) (*models.DuelDb, error)
	FindDuelLogsByUser(user_id int64) ([]dto.LogDto, error)
	FindDuelLogsByDuelId(duel_id int64) ([]dto.LogDto, error)
	CreateDuelLog(log *models.LogDB) error
	FindDuelsByUserId(user_id int64) ([]models.DuelDb, error)
	IncrementDuelCounter(duel *models.DuelDb, user_id int64) (bool, error)
	IncrementUserStreakAndUpdateLastTimeContributed(user *models.UserDb) error
	ResetUserStreakToOneAndUpdateLastTimeContributed(user *models.UserDb) error
	IncrementWinCounter(user *models.UserDb) error
	HasUserContributedToDuelToday(userID int64, duelID int64, date string) (bool, error)
	CreateTestData() error
	Stop()
}

type Repository struct {
	Db *sqlx.DB
}

func New() *Repository {
	connectionString := fmt.Sprintf(
		"user=%v password=%v dbname=%v port=%v host=%v sslmode=disable",
		os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"), os.Getenv("DB_PORT"), os.Getenv("DB_HOST"),
	)
	db, err := sqlx.Connect("postgres", connectionString)
	if err != nil {
		slog.Error("error while connecting to db: ", err.Error())
	}
	db.MustExec(schema)

	return &Repository{Db: db}
}

var _ RepositoryInterface = &Repository{}

func (r *Repository) CreateUser(maxID string, firstName string, photoUrl string) (*models.UserDb, error) {
	var user models.UserDb
	query := `
		INSERT INTO users (max_id, first_name, photo_url, streak, wins) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id, max_id, streak, wins, last_time_contributed
	`
	err := r.Db.QueryRow(query, maxID, firstName, photoUrl, 0, 0).Scan(
		&user.ID, &user.MaxID, &user.Streak, &user.Wins, &user.LastTimeContributed,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) FindUserByMaxId(maxID string) (*models.UserDb, error) {
	var user models.UserDb
	err := r.Db.QueryRow(`
		SELECT id, max_id, first_name, photo_url, streak, 
		wins, TO_CHAR(last_time_contributed, 'YYYY-MM-DD') 
		FROM users 
		WHERE max_id = $1
	`, maxID).Scan(&user.ID, &user.MaxID, &user.FirstName, &user.PhotoUrl, &user.Streak,
		&user.Wins, &user.LastTimeContributed)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *Repository) FindUserById(id int64) (*models.UserDb, error) {
	var user models.UserDb
	err := r.Db.QueryRow(`
		SELECT id, max_id, first_name, photo_url, streak,
		wins, TO_CHAR(last_time_contributed, 'YYYY-MM-DD') 
		FROM users 
		WHERE id = $1
	`, id).Scan(&user.ID, &user.MaxID, &user.FirstName, &user.PhotoUrl, &user.Streak,
		&user.Wins, &user.LastTimeContributed)

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
		`SELECT h.id, h.name AS habit_name, hc.name AS category_name FROM habits h
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
		rows.Scan(&habit.Id, &habit.Name, &habit.Category)
		habits = append(habits, habit)
	}
	return habits, nil
}

func (r *Repository) FindDuelLogsByUser(user_id int64) ([]dto.LogDto, error) {

	rows, err := r.Db.Query(
		`SELECT id, owner_id, message, photo, duel_id,
		TO_CHAR(created_at, 'YYYY-MM-DD') FROM logs WHERE owner_id = $1`, user_id,
	)

	if err != nil {
		return nil, err
	}

	var logs []dto.LogDto = []dto.LogDto{}
	for rows.Next() {
		log := dto.LogDto{}
		rows.Scan(&log.LogID, &log.OwnerID, &log.Message, &log.Photo, &log.DuelID, &log.CreatedAt)
		logs = append(logs, log)
	}

	return logs, nil
}

func (r *Repository) FindDuelLogsByDuelId(duel_id int64) ([]dto.LogDto, error) {
	rows, err := r.Db.Query(
		`SELECT id, owner_id, message, photo, duel_id,
		TO_CHAR(created_at, 'YYYY-MM-DD') FROM logs WHERE duel_id = $1`, duel_id,
	)
	if err != nil {
		return nil, err
	}

	var logs []dto.LogDto = []dto.LogDto{}
	for rows.Next() {
		log := dto.LogDto{}
		rows.Scan(&log.LogID, &log.OwnerID, &log.Message, &log.Photo, &log.DuelID, &log.CreatedAt)
		logs = append(logs, log)
	}

	return logs, nil
}

func (r *Repository) CreateDuelLog(log *models.LogDB) error {
	query := `
		INSERT INTO logs (owner_id, duel_id, message, photo)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.Db.Exec(
		query,
		log.OwnerID,
		log.DuelID,
		log.Message,
		log.Photo,
	)
	return err
}

func (r *Repository) CreateDuel(user_id int64, habit_id int, random_hash string, days int) error {
	var invitedStatusId int
	err := r.Db.QueryRow(`SELECT id FROM duel_status WHERE value = 'invited'`).Scan(&invitedStatusId)
	if err != nil {
		return err
	}
	var duelId int
	err = r.Db.QueryRow(
		`INSERT INTO duels (duration, habit_id, user1_id, status_id) VALUES ($1, $2, $3, $4) RETURNING id`,
		days, habit_id, user_id, invitedStatusId,
	).Scan(&duelId)
	if err != nil {
		return err
	}
	_, err = r.Db.Exec(
		`INSERT INTO invitations (generatedHash, duel_id) VALUES ($1, $2)`,
		random_hash, duelId,
	)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) ActivateDuelFromInvitationHash(user_id int64, invitationHash string) error {
	var duelId int64
	var invitationId int
	err := r.Db.QueryRow(`SELECT duel_id, id FROM invitations WHERE generatedHash = $1`,
		invitationHash).Scan(&duelId, &invitationId)
	if err != nil {
		return errors.New("invitation link has been expired or does not exist")
	}

	duelDb, err := r.GetDuelById(duelId)
	if err != nil {
		return err
	}

	if duelDb.Status != "invited" {
		return errors.New("duel is not for invitation")
	}
	if duelDb.User1_id == user_id {
		return errors.New("you cannot start a duel with yourself")
	}

	_, err = r.Db.Exec(`UPDATE duels SET user2_id = $1, status_id = 2 WHERE id = $2`, user_id, duelId)
	if err != nil {
		return err
	}

	_, err = r.Db.Exec(`DELETE FROM invitations WHERE id = $1`, invitationId)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetDuelById(duel_id int64) (*models.DuelDb, error) {
	var duelDb models.DuelDb
	err := r.Db.QueryRow(
		`SELECT duels.id, duels.duration, duels.habit_id, habits.name,
		habit_categories.name, duels.user1_id, duels.user2_id,
		duels.user1_completed, duels.user2_completed, u1.first_name,
		u2.first_name, u1.photo_url, u2.photo_url, TO_CHAR(duels.start_date, 'YYYY-MM-DD'),
		TO_CHAR(duels.end_date, 'YYYY-MM-DD'), duels.winner_id, duel_status.value
		FROM duels
		JOIN habits ON duels.habit_id = habits.id
		JOIN habit_categories ON habits.habit_category_id = habit_categories.id
		JOIN duel_status ON duels.status_id = duel_status.id
		LEFT JOIN users u1 ON duels.user1_id = u1.id
		LEFT JOIN users u2 ON duels.user2_id = u2.id
		WHERE duels.id = $1`, duel_id,
	).Scan(&duelDb.Id, &duelDb.Duration, &duelDb.HabitId, &duelDb.HabitName, &duelDb.HabitCategory,
		&duelDb.User1_id, &duelDb.User2_id,
		&duelDb.User1_completed, &duelDb.User2_completed,
		&duelDb.User1_firstName, &duelDb.User2_firstName,
		&duelDb.User1_photoUrl, &duelDb.User2_photoUrl, &duelDb.StartDate,
		&duelDb.EndDate, &duelDb.WinnerId, &duelDb.Status)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("custom error: no rows in duels result set")
		}
		return nil, err
	}
	return &duelDb, nil
}

func (r *Repository) FindDuelsByUserId(user_id int64) ([]models.DuelDb, error) {
	var duels []models.DuelDb = []models.DuelDb{}
	rows, err := r.Db.Query(
		`SELECT duels.id, duels.duration, duels.habit_id, habits.name,
		habit_categories.name, duels.user1_id, duels.user2_id,
		duels.user1_completed, duels.user2_completed, u1.first_name,
		u2.first_name, u1.photo_url, u2.photo_url, TO_CHAR(duels.start_date, 'YYYY-MM-DD'),
		TO_CHAR(duels.end_date, 'YYYY-MM-DD'), duels.winner_id, duel_status.value
		FROM duels JOIN habits ON duels.habit_id = habits.id
		JOIN habit_categories ON habits.habit_category_id = habit_categories.id
		JOIN duel_status ON duels.status_id = duel_status.id
		LEFT JOIN users u1 ON duels.user1_id = u1.id
		LEFT JOIN users u2 ON duels.user2_id = u2.id
		WHERE duels.user1_id = $1 OR duels.user2_id = $1`, user_id,
	)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		duelDb := models.DuelDb{}
		err = rows.Scan(&duelDb.Id, &duelDb.Duration, &duelDb.HabitId, &duelDb.HabitName, &duelDb.HabitCategory,
			&duelDb.User1_id, &duelDb.User2_id,
			&duelDb.User1_completed, &duelDb.User2_completed,
			&duelDb.User1_firstName, &duelDb.User2_firstName,
			&duelDb.User1_photoUrl, &duelDb.User2_photoUrl, &duelDb.StartDate,
			&duelDb.EndDate, &duelDb.WinnerId, &duelDb.Status)
		if err != nil {
			return nil, err
		}
		duels = append(duels, duelDb)
	}
	return duels, nil
}

func (r *Repository) IncrementDuelCounter(duel *models.DuelDb, userID int64) (bool, error) {

	var counter int

	switch {
	case duel.User1_id == userID:
		if err := r.Db.QueryRow(
			`UPDATE duels
             SET user1_completed = user1_completed + 1
             WHERE id = $1
             RETURNING user1_completed`,
			duel.Id,
		).Scan(&counter); err != nil {
			return false, err
		}

	case duel.User2_id.Valid && duel.User2_id.Int64 == userID:
		if err := r.Db.QueryRow(
			`UPDATE duels
             SET user2_completed = user2_completed + 1
             WHERE id = $1
             RETURNING user2_completed`,
			duel.Id,
		).Scan(&counter); err != nil {
			return false, err
		}

	default:
		return false, errors.New("user is not a participant of this duel")
	}

	won := false
	if counter >= duel.Duration {
		won = true
		if _, err := r.Db.Exec(
			`UPDATE duels
             SET winner_id = $1,
                 end_date  = $2,
                 status_id = 3
             WHERE id = $3`,
			userID,
			time.Now().Format("2006-01-02"),
			duel.Id,
		); err != nil {
			return false, err
		}
	}

	return won, nil
}

func (r *Repository) IncrementUserStreakAndUpdateLastTimeContributed(user *models.UserDb) error {
	_, err := r.Db.Exec(`UPDATE users SET streak = streak + 1, last_time_contributed = CURRENT_DATE WHERE id = $1`, user.ID)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) ResetUserStreakToOneAndUpdateLastTimeContributed(user *models.UserDb) error {
	_, err := r.Db.Exec(`UPDATE users SET streak = 1, last_time_contributed = CURRENT_DATE WHERE id = $1`, user.ID)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) IncrementWinCounter(user *models.UserDb) error {
	_, err := r.Db.Exec(`UPDATE users SET wins = wins + 1 WHERE id = $1`, user.ID)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) HasUserContributedToDuelToday(userID int64, duelID int64, date string) (bool, error) {
	var exists bool
	err := r.Db.QueryRow(`
        SELECT EXISTS (
            SELECT 1 
            FROM logs 
            WHERE owner_id = $1 
              AND duel_id = $2
              AND created_at = $3
        )
    `, userID, duelID, date).Scan(&exists)

	return exists, err
}

// -- For dev testing -- //
func (r *Repository) CreateTestData() error {
	// ---------- AVATARS ----------
	photos := []string{
		"https://static.wikia.nocookie.net/9ce54273-1acd-4741-a95e-2c901171c601",
		"https://i.ytimg.com/vi/2USReOiv4Jo/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AG-B4AC0AWKAgwIABABGF0gZShRMA8=&rs=AOn4CLCNndY8PifvrzmgB8Oq0hztsb_gyw",
		"https://avatars.mds.yandex.net/i?id=9b5e61534a673320d4b1e4630a9fd02fff6759b0-13934628-images-thumbs&n=13",
		"https://avatars.mds.yandex.net/i?id=d8b749ef8f2c051edbec63ac66459fe576e5750f-9895871-images-thumbs&n=13",
	}

	rand.Seed(time.Now().UnixNano())

	// ---------- USERS ----------
	users := []struct {
		MaxID string
		Name  string
	}{
		{"MAXID_1", "User 1"},
		{"MAXID_2", "User 2"},
		{"MAXID_3", "User 3"},
		{"MAXID_4", "User 4"},
	}

	userIDs := make(map[string]int64, len(users))

	for _, u := range users {
		var id int64

		photo := photos[rand.Intn(len(photos))]

		// ⚠️ если колонка у тебя называется не photo_url — поменяй тут и в SET
		if err := r.Db.QueryRow(`
			INSERT INTO users (max_id, first_name, streak, wins, photo_url)
			VALUES ($1, $2, 0, 0, $3)
			ON CONFLICT (max_id) DO UPDATE
				SET first_name = EXCLUDED.first_name,
				    photo_url  = EXCLUDED.photo_url
			RETURNING id
		`, u.MaxID, u.Name, photo).Scan(&id); err != nil {
			return err
		}
		userIDs[u.MaxID] = id
	}

	// ---------- HABIT CATEGORY ----------
	var habitCategoryID int64
	if err := r.Db.QueryRow(`
		INSERT INTO habit_categories (user_id, name)
		VALUES ($1, $2)
		RETURNING id
	`, userIDs["MAXID_1"], "General").Scan(&habitCategoryID); err != nil {
		return err
	}

	// ---------- HABITS ----------
	habits := []string{
		"Soccer",
		"Drinking water",
		"Not smoking",
		"Reading books",
	}

	habitIDs := make([]int64, 0, len(habits))

	for _, hName := range habits {
		var id int64
		if err := r.Db.QueryRow(`
			INSERT INTO habits (user_id, habit_category_id, name)
			VALUES ($1, $2, $3)
			RETURNING id
		`, userIDs["MAXID_1"], habitCategoryID, hName).Scan(&id); err != nil {
			return err
		}
		habitIDs = append(habitIDs, id)
	}

	// ---------- DUEL STATUS (active) ----------
	var activeStatusID int
	if err := r.Db.QueryRow(`
		SELECT id FROM duel_status WHERE value = 'active'
	`).Scan(&activeStatusID); err != nil {
		return err
	}

	// ---------- DUELS ----------

	// Duel 1: User1 vs User2
	var duel1ID int64
	if err := r.Db.QueryRow(`
		INSERT INTO duels (duration, habit_id, user1_id, user2_id, status_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, 5, habitIDs[0], userIDs["MAXID_1"], userIDs["MAXID_2"], activeStatusID).Scan(&duel1ID); err != nil {
		return err
	}

	// Duel 2: User3 vs User4
	var duel2ID int64
	if err := r.Db.QueryRow(`
		INSERT INTO duels (duration, habit_id, user1_id, user2_id, status_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, 7, habitIDs[1], userIDs["MAXID_3"], userIDs["MAXID_4"], activeStatusID).Scan(&duel2ID); err != nil {
		return err
	}

	return nil
}
