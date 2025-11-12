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
	GetDuelLogs(user_id int64) ([]dto.LogDto, error)
	CreateDuelLog(user *models.UserDb, ownerID int64, duelID int64, message string, photo []byte) error
	CreateHabit(user_id int64, habit_name string, habit_category string) error
	GetUserHabits(user_id int64) ([]dto.HabitDto, error)
	CreateDuelAndGetHash(user_id int64, habit_id int, days int) (string, error)
	AcceptInvitation(user_id int64, invitationHash string) error
}

type Service struct {
	Repository *repository.Repository
}

var _ ServiceInterface = &Service{}

func (s *Service) GetDuelLogs(user_id int64) ([]dto.LogDto, error) {
	logs, err := s.Repository.FindDuelLogsByUser(user_id)
	if err != nil {
		return nil, err
	}

	return logs, nil
}

func (s *Service) CreateDuelLog(user *models.UserDb, ownerID int64, duelID int64, message string, photo []byte) error {

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
		Message: message,
		Photo:   photoPtr,
	}

	duel, err := s.Repository.GetDuelById(duelID)
	if err != nil {
		return err
	}
	if duel.Status != "active" {
		return errors.New("duel is not active")
	}

	// Проверка, что user – участник дуэли
	if duel.User1_id != ownerID && (!duel.User2_id.Valid || duel.User2_id.Int64 != ownerID) {
		return errors.New("user is not a participant of this duel")
	}

	today := time.Now().Format("2006-01-02")

	alreadyLogged, err := s.Repository.HasUserContributedToDuelToday(ownerID, duelID, today)
	if err != nil {
		return err
	}

	if alreadyLogged {
		return errors.New("you have already contributed to this duel today")
	}

	if err := s.Repository.CreateDuelLog(log); err != nil {
		return err
	}

	// Проверяем прогресс по дуэли
	won, err := s.Repository.IncrementDuelCounter(duel, ownerID)
	if err != nil {
		return err
	}

	// Обновляем СТРИК ТОЛЬКО если это первая "учтённая" запись за день
	switch {
	case user.LastTimeContributed.String == today:
		// Уже был лог сегодня - стрик уже обновлён, ничего не делаем.

	case user.LastTimeContributed.String == "":
		// Первая запись
		if err := s.Repository.ResetUserStreakToOneAndUpdateLastTimeContributed(user); err != nil {
			return err
		}

	default:
		lastDate, err := time.Parse("2006-01-02", user.LastTimeContributed.String)
		if err != nil {
			return err
		}

		// Вчера был лог => продолжаем стрик
		if lastDate.Add(24*time.Hour).Format("2006-01-02") == today {
			if err := s.Repository.IncrementUserStreakAndUpdateLastTimeContributed(user); err != nil {
				return err
			}
		} else {
			// Стрик закончился => сбрасываем и начинаем новый
			if err := s.Repository.ResetUserStreakToOneAndUpdateLastTimeContributed(user); err != nil {
				return err
			}
		}
	}

	if won {
		if err := s.Repository.IncrementWinCounter(user); err != nil {
			return err
		}
	}

	return nil
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

	err = s.Repository.CreateDuel(user_id, habit_id, randomHash, days)
	if err != nil {
		return "", err
	}

	invitationLink := fmt.Sprintf("https://max.ru/t272_hakaton_bot?startapp=%s", randomHash)
	return invitationLink, nil
}

func (s *Service) AcceptInvitation(user_id int64, invitationHash string) error {
	return s.Repository.ActivateDuelFromInvitationHash(user_id, invitationHash)
}
