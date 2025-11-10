package middlewares

import (
	"maxbot/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

func UserExistsOrNot(repo repository.Repository) gin.HandlerFunc {
	return func(c *gin.Context) {
		maxID := c.Query("max_id")
		if maxID == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": "max_id query parameter is required",
			})
			return
		}

		user, err := repo.FindUserByMaxId(maxID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error":   "database error",
				"details": err.Error(),
			})
			return
		}

		var message string
		if user == nil {
			user, err = repo.CreateUser(maxID)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error":   "failed to create user",
					"details": err.Error(),
				})
				return
			}
			message = "User created"
		} else {
			message = "User found"
		}

		c.Set("message", message)
		c.Set("currentUser", user)
		c.Next()
	}
}
