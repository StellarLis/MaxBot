package dto

type CreateNewDuelDto struct {
	UserId int `json:"user_id"`
	HabitId int `json:"habit_id"`
	Days int `json:"days"`
	
}