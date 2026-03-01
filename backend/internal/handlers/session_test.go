package handlers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestCreateSession_Validation(t *testing.T) {
	h := newTestHandler()

	tests := []struct {
		name       string
		body       any
		wantStatus int
	}{
		{"empty body", map[string]string{}, http.StatusBadRequest},
		{"missing quiz_id", map[string]string{"quiz_id": ""}, http.StatusBadRequest},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			w := postJSON(t, h.CreateSession, tc.body)
			if w.Code != tc.wantStatus {
				t.Errorf("expected %d, got %d — body: %s", tc.wantStatus, w.Code, w.Body.String())
			}
		})
	}
}

func TestCreateSession_InvalidJSON(t *testing.T) {
	h := newTestHandler()
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader("not-json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.CreateSession(w, req)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestJoinSession_Validation(t *testing.T) {
	h := newTestHandler()

	tests := []struct {
		name       string
		body       any
		wantStatus int
	}{
		{"empty body", map[string]string{}, http.StatusBadRequest},
		{"missing name", map[string]string{"code": "123456"}, http.StatusBadRequest},
		{"missing code", map[string]string{"name": "Alice"}, http.StatusBadRequest},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			w := postJSON(t, h.JoinSession, tc.body)
			if w.Code != tc.wantStatus {
				t.Errorf("expected %d, got %d — body: %s", tc.wantStatus, w.Code, w.Body.String())
			}
		})
	}
}

// TestListSessions_HandlerRegistered verifies ListSessions is defined on Handler
// and has the correct signature. DB-hitting paths are covered by integration tests.
func TestListSessions_HandlerRegistered(t *testing.T) {
	h := newTestHandler()
	var _ http.HandlerFunc = h.ListSessions
}

func getWithChiParams(sessionID, playerID string) *http.Request {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("sessionID", sessionID)
	rctx.URLParams.Add("playerID", playerID)
	return req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
}

func TestGetPlayerResults_InvalidUUIDs(t *testing.T) {
	h := newTestHandler()

	validUUID := "550e8400-e29b-41d4-a716-446655440000"

	tests := []struct {
		name      string
		sessionID string
		playerID  string
	}{
		{"invalid session ID", "not-a-uuid", validUUID},
		{"invalid player ID", validUUID, "not-a-uuid"},
		{"both invalid", "bad", "bad"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := getWithChiParams(tc.sessionID, tc.playerID)
			w := httptest.NewRecorder()
			h.GetPlayerResults(w, req)
			if w.Code != http.StatusBadRequest {
				t.Errorf("expected 400, got %d — body: %s", w.Code, w.Body.String())
			}
		})
	}
}

func TestGenerateCode(t *testing.T) {
	codes := make(map[string]bool)
	for i := 0; i < 100; i++ {
		code, err := generateCode()
		if err != nil {
			t.Fatalf("generateCode failed: %v", err)
		}
		if len(code) != 6 {
			t.Errorf("expected 6-digit code, got %q (len=%d)", code, len(code))
		}
		codes[code] = true
	}
	// With 100 samples from 1M possibilities, collision rate is negligible
	if len(codes) < 90 {
		t.Errorf("too many collisions: only %d unique codes in 100 attempts", len(codes))
	}
}
