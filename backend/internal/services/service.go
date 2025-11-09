package services

import (
	"errors"
	"maxbot/internal/dto"
	"maxbot/internal/repository"
	"unicode/utf8"
)

type ServiceInterface interface {
	GetUserInfo(max_id string) dto.UserDto
	GetDuelLogs(user_id int64) ([]dto.LogDto, error)
	CreateHabit(user_id int64, habit_name string, habit_category string) error
	GetUserHabits(user_id int64) ([]dto.HabitDto, error)
}

type Service struct {
	Repository *repository.Repository
}

var _ ServiceInterface = &Service{}

func (s *Service) GetUserInfo(max_id string) dto.UserDto {
	// TODO
	return dto.UserDto{}
}

func (s *Service) GetDuelLogs(user_id int64) ([]dto.LogDto, error) {
	logs, err := s.Repository.FindDuelLogsByUser(user_id)
	if err != nil {
		return nil, err
	}

	return logs, nil
}

func (s *Service) CreateHabit(user_id int64, habit_name string, habit_category string) error {
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

func (s *Service) GetUserHabits(user_id int64) ([]dto.HabitDto, error) {
	return s.Repository.FindHabitsByUserId(user_id)
}
