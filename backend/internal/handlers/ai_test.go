package handlers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestGenerateQuiz_MissingAPIKey(t *testing.T) {
	h := newTestHandler() // anthropicClient is nil (no key in test config)

	w := postJSON(t, h.GenerateQuiz, map[string]any{
		"topic":          "Science",
		"question_count": 3,
		"context":        "",
	})

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("want 503, got %d", w.Code)
	}
}

func TestGenerateQuiz_ValidationErrors(t *testing.T) {
	h := newTestHandler()

	tests := []struct {
		name       string
		body       any
		wantStatus int
	}{
		{
			name:       "missing topic",
			body:       map[string]any{"question_count": 5},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "whitespace-only topic",
			body:       map[string]any{"topic": "   \t\n  ", "question_count": 5},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "question_count zero",
			body:       map[string]any{"topic": "Science", "question_count": 0},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "question_count exceeds AI cap",
			body:       map[string]any{"topic": "Science", "question_count": 11},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "question_count way too high",
			body:       map[string]any{"topic": "Science", "question_count": 21},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "non-printable chars in topic",
			body:       map[string]any{"topic": "Science\x00quiz", "question_count": 5},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "non-printable chars in context",
			body:       map[string]any{"topic": "Science", "question_count": 5, "context": "normal\x00text"},
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			w := postJSON(t, h.GenerateQuiz, tc.body)
			if w.Code != tc.wantStatus {
				t.Errorf("want %d, got %d", tc.wantStatus, w.Code)
			}
		})
	}
}

func TestGenerateQuiz_InvalidJSON(t *testing.T) {
	h := newTestHandler()
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader("not-json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.GenerateQuiz(w, req)
	if w.Code != http.StatusBadRequest {
		t.Errorf("want 400, got %d", w.Code)
	}
}

func TestGenerateQuiz_TopicTooLong(t *testing.T) {
	h := newTestHandler()
	w := postJSON(t, h.GenerateQuiz, map[string]any{
		"topic":          strings.Repeat("a", 201),
		"question_count": 5,
	})
	if w.Code != http.StatusBadRequest {
		t.Errorf("want 400, got %d", w.Code)
	}
}

func TestGenerateQuiz_MaxQuestionsAllowed(t *testing.T) {
	// With no API key, a valid request at the cap should pass validation
	// and reach the 503 "not configured" check.
	h := newTestHandler()
	w := postJSON(t, h.GenerateQuiz, map[string]any{
		"topic":          "Science",
		"question_count": 10,
	})
	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("want 503 (passed validation), got %d", w.Code)
	}
}

func TestIsPrintable(t *testing.T) {
	tests := []struct {
		input string
		want  bool
	}{
		{"normal text", true},
		{"with numbers 123", true},
		{"Unicode: café résumé", true},
		{"has\x00null", false},
		{"has\x01control", false},
		{"", true},
		{"tabs\tand\nnewlines", true},
	}
	for _, tc := range tests {
		got := isPrintable(tc.input)
		if got != tc.want {
			t.Errorf("isPrintable(%q) = %v, want %v", tc.input, got, tc.want)
		}
	}
}

func TestClassifyInput_Pass(t *testing.T) {
	h := newTestHandler()
	// No anthropic client → classifyInput should fail-open (return true)
	// since it can't make the API call.
	// This tests the fail-open behavior.
	reason, ok := h.classifyInput(context.Background(), "Islamic history", "")
	if !ok {
		t.Errorf("expected pass (fail-open), got fail with reason: %s", reason)
	}
}

func TestClassifyInput_FailOpen_NilClient(t *testing.T) {
	h := newTestHandler() // no anthropic client
	reason, ok := h.classifyInput(context.Background(), "anything", "")
	if !ok {
		t.Errorf("expected fail-open, got fail with reason: %s", reason)
	}
	if reason != "" {
		t.Errorf("expected empty reason on fail-open, got: %s", reason)
	}
}
