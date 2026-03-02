package handlers

import (
	"testing"
	"time"
)

// TestWebSocketTimeoutConfig ensures disconnect detection is fast enough for
// a responsive lobby. pongWait drives worst-case detection time when the
// browser doesn't send a clean close frame (mobile suspend, crash, etc.).
func TestWebSocketTimeoutConfig(t *testing.T) {
	const maxAcceptablePongWait = 15 * time.Second

	if pongWait > maxAcceptablePongWait {
		t.Errorf("pongWait=%v is too large; ghost players would linger for >%v after disconnect",
			pongWait, maxAcceptablePongWait)
	}
	if pingPeriod >= pongWait {
		t.Errorf("pingPeriod=%v must be less than pongWait=%v", pingPeriod, pongWait)
	}
	if writeWait <= 0 {
		t.Error("writeWait must be positive")
	}
}
