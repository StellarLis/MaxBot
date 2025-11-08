package handlers

import (
	"maxbot/internal/dto"
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
	CreateNewHabit(c *gin.Context)
}

type HttpHandler struct {
	Service *services.Service
}

var _ HandlerInterface = &HttpHandler{}

func (h *HttpHandler) New() http.Handler {
	router := gin.Default()

	router.GET("/healthy", h.Healthy)

	router.GET("/user/getUserInfo", h.GetUserInfo)
	router.GET("/duel/getDuelLogs", h.GetDuelLogs)
	router.POST("/duel/contribute", h.ContributeToDuel)
	router.POST("/duel/createNew", h.CreateNewDuel)

	return router.Handler()
}

func (h *HttpHandler) Healthy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"healthy": true,
	})
}

func (h *HttpHandler) GetUserInfo(c *gin.Context) {
	// TODO
	// Создать middleware в пакете middlewares, который перед получением инфы
	// о юзере будет проверять, существует ли он в БД по max_id. Если нет, надо создать его.
	// Подключить middleware к этой ручке.
	// max_id получать либо из query, либо из заголовка запроса
}

func (h *HttpHandler) GetDuelLogs(c *gin.Context) {
	// TODO
}

func (h *HttpHandler) ContributeToDuel(c *gin.Context) {
	// TODO
}

func (h *HttpHandler) CreateNewDuel(c *gin.Context) {
	// TODO
}

func (h *HttpHandler) CreateNewHabit(c *gin.Context) {
	var createNewHabitDto dto.CreateNewHabitDto
	if err := c.BindJSON(&createNewHabitDto); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "failed to parse data",
			"details": err.Error(),
		})
		return
	}
	err := h.Service.CreateHabit(
		createNewHabitDto.UserId,
		createNewHabitDto.HabitName,
		createNewHabitDto.HabitCategory,
	)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "error while creating new habit",
			"details": err.Error(),
		})
	}
}