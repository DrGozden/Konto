package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/konto/services"
)

func AuthMiddleware(authService services.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				next.ServeHTTP(w, r)
				return
			}

			// Bearer token format: "Bearer <token>"
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
				next.ServeHTTP(w, r)
				return
			}

			token := tokenParts[1]
			user, err := authService.ValidateToken(token)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			// Add user to context using the same key as auth service
			ctx := context.WithValue(r.Context(), services.UserContextKey, user)
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}
