package models

import "database/sql"

type DuelDb struct {
	Id              int            `json:"id"`
	Duration        int            `json:"duration_in_days"`
	HabitId         int            `json:"habit_id"`
	HabitName       string         `json:"habit_name"`
	HabitCategory   string         `json:"habit_category"`
	User1_id        int64          `json:"user1_id"`
	User2_id        sql.NullInt64  `json:"user2_id"`
	User1_completed int64          `json:"user1_completed"`
	User2_completed int64          `json:"user2_completed"`
	User1_firstName string         `json:"user1_first_name"`
	User2_firstName sql.NullString `json:"user2_first_name"`
	User1_photoUrl  sql.NullString `json:"user1_photo_url"`
	User2_photoUrl  sql.NullString `json:"user2_photo_url"`
	StartDate       string         `json:"start_date"`
	EndDate         sql.NullString `json:"end_date"`
	WinnerId        sql.NullInt64  `json:"winner_id"`
	Status          string         `json:"status"`
}
