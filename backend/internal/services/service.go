package services

import (
	"maxbot/internal/dto"
	"maxbot/internal/repository"
)

type ServiceInterface interface {
	GetUserInfo(max_id string) dto.UserDto
	GetDuelLogs(duel_id int) []dto.LogDto
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