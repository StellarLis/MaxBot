package dto

type CreateNewHabitDto struct {
	HabitName     string `json:"habit_name"`
	HabitCategory string `json:"habit_category"`
}
