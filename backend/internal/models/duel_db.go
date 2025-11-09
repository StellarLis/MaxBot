package models

import "database/sql"

type DuelDb struct {
	Id            int
	HabitId       int
	HabitName     string
	HabitCategory string
	User1_id      int64
	User2_id      sql.NullInt64
	StartDate     string
	EndDate       string
	WinnerId      sql.NullInt64
	Status        string
}
