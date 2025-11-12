package models

type LogDB struct {
	ID        int64   `db:"id" json:"id"`
	OwnerID   int64   `db:"owner_id" json:"owner_id"`
	DuelID    int64   `db:"duel_id" json:"duel_id"`
	CreatedAt string  `db:"created_at" json:"created_at"`
	Message   string  `db:"message" json:"message"`
	Photo     *[]byte `db:"photo" json:"photo"`
}
