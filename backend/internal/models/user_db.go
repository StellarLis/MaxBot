package models

type UserDb struct {
	ID     int64  `db:"id" json:"id"`
	MaxID  string `db:"max_id" json:"max_id"`
	Streak int64  `db:"streak" json:"streak"`
	Wins   int64  `db:"wins" json:"wins"`
	Losses int64  `db:"loses" json:"loses"`
}

type UserResponse struct {
	Message string `json:"message"`
	ID      int64  `json:"id"`
	MaxID   string `json:"max_id"`
	Streak  int64  `json:"streak"`
	Wins    int64  `json:"wins"`
	Losses  int64  `json:"loses"`
}
