package dto

import "maxbot/internal/models"

type UserDto struct {
	Streak              int             `json:"streak"`  // Стрик из привычек
	Wins                int             `json:"wins"`    // Победы
	Winrate             float32         `json:"winrate"` // Винрейт сразу в процентах
	FirstName           string          `json:"first_name"`
	PhotoUrl            string          `json:"photo_url"`
	LastTimeContributed string          `json:"last_time_contributed"`
	DuelsInfo           []models.DuelDb `json:"duels_info"` // Дуэльки в которых участвует юзер
}
