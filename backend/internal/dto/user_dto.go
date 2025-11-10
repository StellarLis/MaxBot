package dto

type UserDto struct {
	Streak int `json:"streak"` // Стрик из привычек
	Wins int `json:"wins"` // Победы
	Winrate_percent int `json:"winrate_percent"` // Винрейт сразу в процентах
	DuelsInfo []DuelInfoDto `json:"duels_info"` // Дуэльки в которых участвует юзер
}