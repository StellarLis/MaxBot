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
				"error":   "internal error",
				"details": err.Error(),
			})
			return
		}
		if user != nil {
			c.Set("currentUser", user)
			c.Next()
			return
		}

		// If user was not found, create it!
		firstName := c.Query("first_name")
		if firstName == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": "first_name query parameter is required",
			})
			return
		}
		photo_url := c.Query("photo_url")

		user, err = repo.CreateUser(maxID, firstName, photo_url)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error":   "failed to create user",
				"details": err.Error(),
			})
			return
		}
		c.Set("currentUser", user)
		c.Next()
	}
}
