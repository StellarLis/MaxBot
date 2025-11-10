package dto

type DuelInfoDto struct {
	Habit_name string `json:"habit_name"` // Название привычки (и дуэли в данном случае)
	Habit_category string `json:"habit_category"` // Категория привычки
	Duel_length_days int `json:"duel_length_days"` // Длина дуэли в днях
	Competitor_name string `json:"competitor_name"` // Имя соперника
	User_completed_days int `json:"user_completed_days"` // Выполненные дни юзером
	Competitor_completed_days int `json:"competitor_completed_days"` // Выполненные дни соперником
	Contributed_today bool `json:"contibuted_today"` // Делал ли сегодня привычку или нет
}