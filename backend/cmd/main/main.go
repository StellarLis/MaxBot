package main

import (
	"log/slog"
	"maxbot/internal/handlers"
	"maxbot/internal/repository"
	"maxbot/internal/services"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/lib/pq"
)

// ~/go/bin/swag init -g cmd/main/main.go --parseDependency --parseInternal --parseDepth 1

// @title MaxBot API docs
// @version 0.9
// @description Documentation for "Habit Duels" project
// @host localhost:8080

func main() {
	repositoryObj := repository.New()
	serviceObj := &services.Service{Repository: repositoryObj}
	handler := &handlers.HttpHandler{Service: serviceObj}

	// Run Http Server
	server := &http.Server{
		Addr:         ":8080",
		Handler:      handler.New(),
		ReadTimeout:  4 * time.Second,
		WriteTimeout: 4 * time.Second,
		IdleTimeout:  30 * time.Second,
	}
	go server.ListenAndServe()

	// Graceful Shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)
	stoppingSignal := <-stop
	slog.With("signal", stoppingSignal).Info("stopping application")

	repositoryObj.Stop()
	slog.Info("application stopped")
}
