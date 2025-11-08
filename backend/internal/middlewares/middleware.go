package middleware

import (
	"database/sql"
	"maxbot/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

func UserExistsOrNot(repo repository.Repository) gin.HandlerFunc {
	return func(c *gin.Context) {
		maxIdStr := c.Query("id")
		if maxIdStr == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": "id query parameter is required",
			})
			return
		}

		var userId int64

		err := repo.Db.QueryRow(`SELECT id FROM users WHERE max_id = $1`, maxIdStr).Scan(&userId)
		if err != nil {
			if err == sql.ErrNoRows {
				query := `
					INSERT INTO users (max_id, streak, wins, loses) 
					VALUES ($1, $2, $3, $4) 
					RETURNING id
				`
				err := repo.Db.QueryRow(query, maxIdStr, 0, 0, 0).Scan(&userId)
				if err != nil {
					c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
						"error":   "failed to create user",
						"details": err.Error(),
					})
					return
				}

			} else {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error":   "database error",
					"details": err.Error(),
				})
				return
			}
		}

		c.Set("user_id", userId)
		c.Next()
	}
}
