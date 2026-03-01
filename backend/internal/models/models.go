package models

import (
	"time"

	"github.com/google/uuid"
)

// Admin / user

type Admin struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// Quiz

type Quiz struct {
	ID        uuid.UUID  `json:"id" db:"id"`
	AdminID   uuid.UUID  `json:"admin_id" db:"admin_id"`
	Title     string     `json:"title" db:"title"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
	Questions []Question `json:"questions,omitempty"`
}

type Question struct {
	ID        uuid.UUID `json:"id" db:"id"`
	QuizID    uuid.UUID `json:"quiz_id" db:"quiz_id"`
	Text      string    `json:"text" db:"text"`
	TimeLimit int       `json:"time_limit" db:"time_limit"` // seconds
	Order     int       `json:"order" db:"order"`
	Options   []Option  `json:"options,omitempty"`
}

type Option struct {
	ID         uuid.UUID `json:"id" db:"id"`
	QuestionID uuid.UUID `json:"question_id" db:"question_id"`
	Text       string    `json:"text" db:"text"`
	IsCorrect  bool      `json:"is_correct" db:"is_correct"`
}

// Game session

type GameStatus string

const (
	GameStatusWaiting  GameStatus = "waiting"
	GameStatusActive   GameStatus = "active"
	GameStatusFinished GameStatus = "finished"
)

type GameSession struct {
	ID        uuid.UUID  `json:"id" db:"id"`
	QuizID    uuid.UUID  `json:"quiz_id" db:"quiz_id"`
	Code      string     `json:"code" db:"code"`
	Status    GameStatus `json:"status" db:"status"`
	StartedAt *time.Time `json:"started_at,omitempty" db:"started_at"`
	EndedAt   *time.Time `json:"ended_at,omitempty" db:"ended_at"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}

type GamePlayer struct {
	ID        uuid.UUID `json:"id" db:"id"`
	SessionID uuid.UUID `json:"session_id" db:"session_id"`
	Name      string    `json:"name" db:"name"`
	Score     int       `json:"score" db:"score"`
	JoinedAt  time.Time `json:"joined_at" db:"joined_at"`
}

type GameAnswer struct {
	ID         uuid.UUID `json:"id" db:"id"`
	SessionID  uuid.UUID `json:"session_id" db:"session_id"`
	PlayerID   uuid.UUID `json:"player_id" db:"player_id"`
	QuestionID uuid.UUID `json:"question_id" db:"question_id"`
	OptionID   uuid.UUID `json:"option_id" db:"option_id"`
	AnsweredAt time.Time `json:"answered_at" db:"answered_at"`
	IsCorrect  bool      `json:"is_correct" db:"is_correct"`
	Points     int       `json:"points" db:"points"`
}

// SessionSummary is returned by the list-sessions endpoint.
type SessionSummary struct {
	ID          uuid.UUID  `json:"id"`
	QuizID      uuid.UUID  `json:"quiz_id"`
	QuizTitle   string     `json:"quiz_title"`
	Code        string     `json:"code"`
	Status      GameStatus `json:"status"`
	PlayerCount int        `json:"player_count"`
	StartedAt   *time.Time `json:"started_at,omitempty"`
	EndedAt     *time.Time `json:"ended_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

// Leaderboard

type LeaderboardEntry struct {
	PlayerID uuid.UUID `json:"player_id"`
	Name     string    `json:"name"`
	Score    int       `json:"score"`
	Rank     int       `json:"rank"`
}

// Player results (personal game summary)

type PlayerResultQuestion struct {
	QuestionID         uuid.UUID `json:"question_id"`
	QuestionText       string    `json:"question_text"`
	QuestionOrder      int       `json:"question_order"`
	SelectedOptionID   uuid.UUID `json:"selected_option_id"`
	SelectedOptionText string    `json:"selected_option_text"`
	CorrectOptionID    uuid.UUID `json:"correct_option_id"`
	CorrectOptionText  string    `json:"correct_option_text"`
	IsCorrect          bool      `json:"is_correct"`
	Points             int       `json:"points"`
}

type PlayerResults struct {
	PlayerID  uuid.UUID              `json:"player_id"`
	Name      string                 `json:"name"`
	Score     int                    `json:"score"`
	Rank      int                    `json:"rank"`
	Questions []PlayerResultQuestion `json:"questions"`
}
