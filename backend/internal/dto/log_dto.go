package dto

type LogDto struct {
	LogID   int64  `json:"log_id"`
	OwnerID int64  `json:"owner_id"`
	MaxID string `json:"max_id"`
	DuelID  int64  `json:"duel_id"`
	CreatedAt string `json:"created_at"`
	Message string `json:"message"`
	Photo   []byte `json:"photo,omitempty"`
}
