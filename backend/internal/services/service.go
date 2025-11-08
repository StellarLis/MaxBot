package services

import (
	"errors"
	"maxbot/internal/dto"
	"maxbot/internal/repository"
	"unicode/utf8"
)

type ServiceInterface interface {
	GetUserInfo(max_id string) dto.UserDto
	GetDuelLogs(duel_id int) []dto.LogDto
	CreateHabit(user_id int, habit_name string, habit_category string) error
}

type Service struct {
	Repository *repository.Repository
}

var _ ServiceInterface = &Service{}

func (s *Service) GetUserInfo(max_id string) dto.UserDto {
	// TODO
	return dto.UserDto{}
}

func (s *Service) GetDuelLogs(duel_id int) []dto.LogDto {
	// TODO
	return []dto.LogDto{}
}

func (s *Service) CreateHabit(user_id int, habit_name string, habit_category string) error {
	nameLength := utf8.RuneCountInString(habit_name)
	categoryLength := utf8.RuneCountInString(habit_category)
	if nameLength < 2 || nameLength > 30 {
		return errors.New("habit name should be from 2 to 30 symbols")
	}
	if categoryLength < 2 || categoryLength > 30 {
		return errors.New("habit category should be from 2 to 30 symbols")
	}
	err := s.Repository.CreateHabit(user_id, habit_name, habit_category)
	if err != nil {
		return err
	}
	return nil
}