package dto

type LogDto struct {
	LogID   int64  `json:"log_id"`
	OwnerID int64  `json:"owner_id"`
	DuelID  int64  `json:"duel_id"`
	Message string `json:"message,"`
	Photo   []byte `json:"photo,omitempty"`
}
