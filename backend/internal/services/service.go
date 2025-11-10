package services

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"maxbot/internal/dto"
	"maxbot/internal/models"
	"maxbot/internal/repository"
	"time"
	"unicode/utf8"
)

type ServiceInterface interface {
	GetUserInfo(max_id string) dto.UserDto
	GetDuelLogs(user_id int64) ([]dto.LogDto, error)
	CreateDuelLog(ownerID int64, duelID int64, message string, photo []byte) error
	CreateHabit(user_id int64, habit_name string, habit_category string) error
	GetUserHabits(user_id int64) ([]dto.HabitDto, error)
	CreateDuelAndGetHash(user_id int64, habit_id int, days int) (string, error)
	AcceptInvitation(user_id int64, invitationHash string) error
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

func (s *Service) CreateDuelLog(ownerID int64, duelID int64, message string, photo []byte) error {

	if len([]rune(message)) > 500 {
		return errors.New("message too long (max 500 characters)")
	}

	var photoPtr *[]byte
	if len(photo) > 0 {
		photoPtr = &photo
	}

	log := &models.LogDB{
		OwnerID: ownerID,
		DuelID:  duelID,
		Message: message,  // guaranteed non-empty
		Photo:   photoPtr, // nil if no photo
	}

	return s.Repository.CreateDuelLog(log)
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

func (s *Service) CreateDuelAndGetHash(user_id int64, habit_id int, days int) (string, error) {
	if days < 1 || days > 30 {
		return "", errors.New("days value should be from 1 to 30")
	}
	randomBytes := make([]byte, 32)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return "", err
	}
	hasher := sha256.New()
	hasher.Write(randomBytes)
	hashBytes := hasher.Sum(nil)
	randomHash := hex.EncodeToString(hashBytes)

	end_date := time.Now().AddDate(0, 0, days).Format("2006-01-02")

	err = s.Repository.CreateDuel(user_id, habit_id, end_date, randomHash)
	if err != nil {
		return "", err
	}

	invitationLink := fmt.Sprintf("https://max.ru/t272_hakaton_bot?startapp=%s", randomHash)
	return invitationLink, nil
}

func (s *Service) AcceptInvitation(user_id int64, invitationHash string) error {
	return s.Repository.ActivateDuelFromInvitationHash(user_id, invitationHash)
}
