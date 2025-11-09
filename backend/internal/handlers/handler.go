package handlers

import (
	"maxbot/internal/dto"
	middleware "maxbot/internal/middlewares"
	"maxbot/internal/models"
	"maxbot/internal/services"
	"net/http"

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
	router.POST("/duel/contribute", h.ContributeToDuel)
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

	message := c.MustGet("message").(string)
	user := c.MustGet("currentUser").(*models.UserDb)

	resp := models.UserResponse{
		Message: message,
		ID:      user.ID,
		MaxID:   user.MaxID,
		Streak:  user.Streak,
		Wins:    user.Wins,
		Losses:  user.Losses,
	}

	c.JSON(http.StatusOK, resp)
}

func (h *HttpHandler) GetDuelLogs(c *gin.Context) {
	// TODO
}

func (h *HttpHandler) ContributeToDuel(c *gin.Context) {
	// TODO
}

func (h *HttpHandler) CreateNewDuel(c *gin.Context) {
	userId := c.MustGet("currentUser").(*models.UserDb).ID
	var createNewDuelDto dto.CreateNewDuelDto
	if err := c.BindJSON(&createNewDuelDto); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "failed to parse data",
			"details": err.Error(),
		})
		return
	}
	invitationLink, err := h.Service.CreateDuelAndGetHash(
		userId, createNewDuelDto.HabitId, createNewDuelDto.Days,
	)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "error while creating duel",
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
			"error": "failed to parse data",
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
			"error": "error while creating new habit",
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
			"error": "error while getting user habits",
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
			"error": "failed to parse data",
			"details": err.Error(),
		})
		return
	}
	if err := h.Service.AcceptInvitation(userId, acceptInvitationDto.InvitationHash); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "error while accepting invitation",
			"details": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "successfully accepted invitation",
	})
}