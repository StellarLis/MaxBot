package dto

type CreateLogDto struct {
	DuelID  int64  `json:"duel_id" binding:"required"`
	Message string `json:"message" binding:"required,min=1"` // required, non-empty
	Photo   string `json:"photo,omitempty"`                  // base64, optional
}
