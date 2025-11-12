package models

import "database/sql"

type UserDb struct {
	ID                  int64          `db:"id" json:"id"`
	MaxID               string         `db:"max_id" json:"max_id"`
	FirstName           string         `db:"first_name" json:"first_name"`
	PhotoUrl            string         `db:"photo_url" json:"photo_url"`
	Streak              int            `db:"streak" json:"streak"`
	Wins                int            `db:"wins" json:"wins"`
	LastTimeContributed sql.NullString `db:"last_time_contributed" json:"last_time_contributed"`
}

type UserResponse struct {
	Message string `json:"message"`
	ID      int64  `json:"id"`
	MaxID   string `json:"max_id"`
	Streak  int64  `json:"streak"`
	Wins    int64  `json:"wins"`
	Losses  int64  `json:"loses"`
}
