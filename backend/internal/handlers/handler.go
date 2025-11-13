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
	swaggerFiles "github.com/swaggo/files" // swagger embed files
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "maxbot/docs"
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
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

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

// GetUserInfo godoc
// @Summary      Get user information, including duels he is participating in
// @Accept       json
// @Produce      json
// @Param        max_id   query      string  true  "Max ID"
// @Param        first_name   query      string  true  "First Name"
// @Param        photo_url   query      string  true  "Photo URL"
// @Success      200  {object}  dto.UserDto
// @Failure      400  {object} dto.ErrorDto
// @Router       /user/getUserInfo [get]
func (h *HttpHandler) GetUserInfo(c *gin.Context) {
	user := c.MustGet("currentUser").(*models.UserDb)
	duels, err := h.Service.Repository.FindDuelsByUserId(user.ID)
	if err != nil {
		
		c.JSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "Invalid request",
			Details: err.Error(),
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

// GetDuelLogs godoc
// @Summary      Get logs of a duel
// @Accept       json
// @Produce      json
// @Param        user_id   query      string  true  "User ID"
// @Success      200  {object}  []dto.LogDto
// @Failure      400  {object} dto.ErrorDto
// @Router       /duel/getDuelLogs [get]
func (h *HttpHandler) GetDuelLogs(c *gin.Context) {
	userIDStr := c.Query("id")
	if userIDStr == "" {
		
		c.JSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "error while getting query id",
			Details: "query parameter 'id' is required",
		})
		return
	}

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "error while parsing id",
			Details: "invalid 'id': must be an integer",
		})
		return
	}

	logs, err := h.Service.GetDuelLogs(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorDto{
			Error: "error while getting logs",
			Details: "failed to retrieve logs",
		})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// ContributeToDuel godoc
// @Summary      Contribute to duel, sending your message and photo
// @Accept       json
// @Produce      json
// @Param        max_id   query      string  true  "Max ID"
// @Param        first_name   query      string  true  "First Name"
// @Param        photo_url   query      string  true  "Photo URL"
// @Param create_log_dto body dto.CreateLogDto true "Create Log Dto"
// @Success      200  {object}  dto.MessageDto
// @Failure      400  {object} dto.ErrorDto
// @Router       /duel/contribute [post]
func (h *HttpHandler) ContributeToDuel(c *gin.Context) {
	user := c.MustGet("currentUser").(*models.UserDb)

	var req dto.CreateLogDto
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "Invalid request",
			Details: err.Error(),
		})
		return
	}

	msg := strings.TrimSpace(req.Message)
	if msg == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "Error while processing message",
			Details: "message cannot be empty or whitespace only",
		})
		return
	}

	var photoBytes []byte
	if req.Photo != "" {
		var err error
		photoBytes, err = base64.StdEncoding.DecodeString(req.Photo)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.ErrorDto{
				Error: "Error while processing photo",
				Details: "invalid base64 in 'photo'",
			})
			return
		}
		if len(photoBytes) > 5*1024*1024 {
			c.JSON(http.StatusBadRequest, dto.ErrorDto{
				Error: "Error while processing photo",
				Details: "photo too large (max 5GB)",
			})
			return
		}
	}

	err := h.Service.CreateDuelLog(user, user.ID, req.DuelID, msg, photoBytes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorDto{
				Error: "Failed to save log",
				Details: err.Error(),
			})
		return
	}

	c.JSON(http.StatusOK, dto.MessageDto{Message: "log created successfully!"})
}

// CreateNewDuel godoc
// @Summary      Create new duel
// @Accept       json
// @Produce      json
// @Param        max_id   query      string  true  "Max ID"
// @Param        first_name   query      string  true  "First Name"
// @Param        photo_url   query      string  true  "Photo URL"
// @Param create_new_duel_dto body dto.CreateNewDuelDto true "Create New Duel Dto"
// @Success      200  {object}  dto.InvitationLinkDto
// @Failure      400  {object} dto.ErrorDto
// @Router       /duel/createNew [post]
func (h *HttpHandler) CreateNewDuel(c *gin.Context) {
	userId := c.MustGet("currentUser").(*models.UserDb).ID
	var createNewDuelDto dto.CreateNewDuelDto
	if err := c.BindJSON(&createNewDuelDto); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "Failed to parse data",
			Details: err.Error(),
		})
		return
	}
	invitationLink, err := h.Service.CreateDuelAndGetHash(
		userId, createNewDuelDto.HabitId, createNewDuelDto.Days,
	)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "error while creating duel",
			Details: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, dto.InvitationLinkDto{
		InvitationLink: invitationLink,
	})
}

// CreateNewHabit godoc
// @Summary      Create new habit
// @Accept       json
// @Produce      json
// @Param        max_id   query      string  true  "Max ID"
// @Param        first_name   query      string  true  "First Name"
// @Param        photo_url   query      string  true  "Photo URL"
// @Param create_new_habit_dto body dto.CreateNewHabitDto true "Create New Habit Dto"
// @Success      200  {object}  dto.MessageDto
// @Failure      400  {object} dto.ErrorDto
// @Router       /habit/createNew [post]
func (h *HttpHandler) CreateNewHabit(c *gin.Context) {
	userId := c.MustGet("currentUser").(*models.UserDb).ID
	var createNewHabitDto dto.CreateNewHabitDto
	if err := c.BindJSON(&createNewHabitDto); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "failed to parse data",
			Details: err.Error(),
		})
		return
	}
	err := h.Service.CreateHabit(
		userId,
		createNewHabitDto.HabitName,
		createNewHabitDto.HabitCategory,
	)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "error while creating new habit",
			Details: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, dto.MessageDto{Message: "created new habit successfully!"})
}

// GetUserHabits godoc
// @Summary      Get user habits
// @Accept       json
// @Produce      json
// @Param        max_id   query      string  true  "Max ID"
// @Param        first_name   query      string  true  "First Name"
// @Param        photo_url   query      string  true  "Photo URL"
// @Success      200  {object}  []dto.HabitDto
// @Failure      400  {object} dto.ErrorDto
// @Router       /habit/getUserHabits [get]
func (h *HttpHandler) GetUserHabits(c *gin.Context) {
	userId := c.MustGet("currentUser").(*models.UserDb).ID
	habits, err := h.Service.GetUserHabits(userId)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "error while getting user habits",
			Details: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, habits)
}

// AcceptInvitation godoc
// @Summary      Accept invitation to duel using invitation hash
// @Accept       json
// @Produce      json
// @Param        max_id   query      string  true  "Max ID"
// @Param        first_name   query      string  true  "First Name"
// @Param        photo_url   query      string  true  "Photo URL"
// @Param accept_invitation_dto body dto.AcceptInvitationDto true "Accept Invitation Dto"
// @Success      200  {object}  dto.MessageDto
// @Failure      400  {object} dto.ErrorDto
// @Router       /duel/acceptInvitation [post]
func (h *HttpHandler) AcceptInvitation(c *gin.Context) {
	userId := c.MustGet("currentUser").(*models.UserDb).ID
	var acceptInvitationDto dto.AcceptInvitationDto
	if err := c.BindJSON(&acceptInvitationDto); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "failed to parse data",
			Details: err.Error(),
		})
		return
	}
	if err := h.Service.AcceptInvitation(userId, acceptInvitationDto.InvitationHash); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, dto.ErrorDto{
			Error: "error while accepting invitation",
			Details: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, dto.MessageDto{Message: "successfully accepted invitation!"})
}
