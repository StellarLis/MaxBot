FROM golang:alpine3.22

ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GOARCH=amd64

WORKDIR /app
COPY go.mod go.sum .
RUN go mod download
COPY . .
EXPOSE 8080
CMD ["go", "run", "cmd/main/main.go"]