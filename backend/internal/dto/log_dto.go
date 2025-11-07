package dto

type LogDto struct {
	OwnedByUser bool `json:"owned_by_user"` // true, если это лог юзера
	Message string `json:"message"`
	Photo []byte `json:"photo"`
}