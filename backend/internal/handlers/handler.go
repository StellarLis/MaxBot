package handlers

import (
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
	router.POST("/duel/createNew", h.CreateNewDuel)

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
	// TODO
}
