package handlers

import (
	"encoding/base64"
	"maxbot/internal/dto"
	middleware "maxbot/internal/middlewares"
	"maxbot/internal/models"
	"maxbot/internal/services"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type HandlerInterface interface {
	New() http.Handler
	Healthy(c *gin.Context)
	GetUserInfo(c *gin.Context)
	GetDuelLogs(c *gin.Context)
	ContributeToDuel(c *gin.Context)
	CreateNewDuel(c *gin.Context)
	AcceptInvitation(c *gin.Context)
	CreateNewHabit(c *gin.Context)
	GetUserHabits(c *gin.Context)
}

type HttpHandler struct {
	Service *services.Service
}

var _ HandlerInterface = &HttpHandler{}

func (h *HttpHandler) New() http.Handler {
	router := gin.Default()

	router.GET("/healthy", h.Healthy)

	router.GET("/user/getUserInfo", middleware.UserExistsOrNot(*h.Service.Repository), h.GetUserInfo)
	router.GET("/duel/getDuelLogs", h.GetDuelLogs)
	router.POST("/duel/contribute", middleware.UserExistsOrNot(*h.Service.Repository), h.ContributeToDuel)
	router.POST("/duel/createNew", middleware.UserExistsOrNot(*h.Service.Repository), h.CreateNewDuel)
	router.POST("/duel/acceptInvitation", middleware.UserExistsOrNot(*h.Service.Repository), h.AcceptInvitation)
	router.POST("/habit/createNew", middleware.UserExistsOrNot(*h.Service.Repository), h.CreateNewHabit)
	router.GET("/habit/getUserHabits", middleware.UserExistsOrNot(*h.Service.Repository), h.GetUserHabits)

	return router.Handler()
}

func (h *HttpHandler) Healthy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"healthy": true,
	})
}

func (h *HttpHandler) GetUserInfo(c *gin.Context) {
	user := c.MustGet("currentUser").(*models.UserDb)
	duels, err := h.Service.Repository.FindDuelsByUserId(user.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"details": err.Error(),
		})
		return
	}

	var endedDuelsCounter = 0
	for _, duel := range duels {
		if duel.Status == "ended" {
			endedDuelsCounter++
		}
	}
	var winrate float32 = 0
	if endedDuelsCounter != 0 {
		winrate = float32(user.Wins) / float32(endedDuelsCounter)
	}

	resp := dto.UserDto{
		Streak: user.Streak,
		Wins: user.Wins,
		Winrate: winrate,
		FirstName: user.FirstName,
		PhotoUrl: user.PhotoUrl,
		LastTimeContributed: user.LastTimeContributed.String,
		DuelsInfo: duels,
	}

	c.JSON(http.StatusOK, resp)
}

func (h *HttpHandler) GetDuelLogs(c *gin.Context) {
	userIDStr := c.Query("id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'id' is required"})
		return
	}

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'id': must be an integer"})
		return
	}

	logs, err := h.Service.GetDuelLogs(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve logs"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

func (h *HttpHandler) ContributeToDuel(c *gin.Context) {
	user := c.MustGet("currentUser").(*models.UserDb)

	var req dto.CreateLogDto
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"details": err.Error(),
		})
		return
	}

	msg := strings.TrimSpace(req.Message)
	if msg == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "message cannot be empty or whitespace only"})
		return
	}

	var photoBytes []byte
	if req.Photo != "" {
		var err error
		photoBytes, err = base64.StdEncoding.DecodeString(req.Photo)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid base64 in 'photo'"})
			return
		}
		if len(photoBytes) > 5*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "photo too large (max 5MB)"})
			return
		}
	}

	err := h.Service.CreateDuelLog(user, user.ID, req.DuelID, msg, photoBytes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save log", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "log added successfully"})
}

func (h *HttpHandler) CreateNewDuel(c *gin.Context) {
	userId := c.MustGet("currentUser").(*models.UserDb).ID
	var createNewDuelDto dto.CreateNewDuelDto
	if err := c.BindJSON(&createNewDuelDto); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error":   "failed to parse data",
			"details": err.Error(),
		})
		return
	}
	invitationLink, err := h.Service.CreateDuelAndGetHash(
		userId, createNewDuelDto.HabitId, createNewDuelDto.Days,
	)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error":   "error while creating duel",
			"details": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"invitationLink": invitationLink,
	})
}

func (h *HttpHandler) CreateNewHabit(c *gin.Context) {
	userId := c.MustGet("currentUser").(*models.UserDb).ID
	var createNewHabitDto dto.CreateNewHabitDto
	if err := c.BindJSON(&createNewHabitDto); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error":   "failed to parse data",
			"details": err.Error(),
		})
		return
	}
	err := h.Service.CreateHabit(
		userId,
		createNewHabitDto.HabitName,
		createNewHabitDto.HabitCategory,
	)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error":   "error while creating new habit",
			"details": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "successfully created new habit",
	})
}

func (h *HttpHandler) GetUserHabits(c *gin.Context) {
	userId := c.MustGet("currentUser").(*models.UserDb).ID
	habits, err := h.Service.GetUserHabits(userId)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error":   "error while getting user habits",
			"details": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, habits)
}

func (h *HttpHandler) AcceptInvitation(c *gin.Context) {
	userId := c.MustGet("currentUser").(*models.UserDb).ID
	var acceptInvitationDto dto.AcceptInvitationDto
	if err := c.BindJSON(&acceptInvitationDto); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error":   "failed to parse data",
			"details": err.Error(),
		})
		return
	}
	if err := h.Service.AcceptInvitation(userId, acceptInvitationDto.InvitationHash); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error":   "error while accepting invitation",
			"details": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "successfully accepted invitation",
	})
}
