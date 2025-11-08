package dto

type CreateNewHabitDto struct {
	UserId int `json:"user_id"`
	HabitName string `json:"habit_name"`
	HabitCategory string `json:"habit_category"`
}