package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"

	maxbot "github.com/max-messenger/max-bot-api-client-go"
	"github.com/max-messenger/max-bot-api-client-go/schemes"
)

func main() {
    api, err := maxbot.New(os.Getenv("TOKEN"))
	if err != nil {
		slog.Error(err.Error())
	}
	ctx, cancel := context.WithCancel(context.Background())
    info, err := api.Bots.GetBot(ctx)
    fmt.Printf("Get me: %#v %#v", info, err)

    go func() {
        exit := make(chan os.Signal)
        signal.Notify(exit, os.Kill, os.Interrupt)
        <-exit
        cancel()
    }()

    for upd := range api.GetUpdates(ctx) {
        switch upd := upd.(type) {
        case *schemes.MessageCreatedUpdate:
            _, err := api.Messages.Send(ctx, maxbot.NewMessage().SetChat(upd.Message.Recipient.ChatId).SetText("Привет! ✨"))
			if err != nil {
				slog.Error(err.Error())
			}
        }
    }
}
