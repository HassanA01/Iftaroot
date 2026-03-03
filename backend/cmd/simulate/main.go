// simulate connects N bot players to a running Hilal session and
// auto-answers each question. Use this to visually verify gameplay
// from the host screen in your browser.
//
// Usage:
//
//	go run ./cmd/simulate/ -code <SESSION_CODE> [-players 40]
package main

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"
	"net/url"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type wsMsg struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

func main() {
	apiBase := flag.String("api", "http://localhost:8081", "API base URL")
	wsBase := flag.String("ws", "ws://localhost:8081", "WebSocket base URL")
	origin := flag.String("origin", "http://localhost:5173", "Origin header (must match FRONTEND_URL)")
	sessionCode := flag.String("code", "", "Session code to join (required)")
	numPlayers := flag.Int("players", 40, "Number of simulated players")
	flag.Parse()

	if *sessionCode == "" {
		fmt.Fprintln(os.Stderr, "usage: simulate -code <6-digit-code> [-players 40] [-api http://...] [-ws ws://...]")
		os.Exit(1)
	}

	log.Printf("joining session %s with %d players", *sessionCode, *numPlayers)

	// ── Join players via HTTP ──────────────────────────────────────
	type player struct {
		ID   string
		Name string
	}
	players := make([]player, *numPlayers)
	for i := 0; i < *numPlayers; i++ {
		name := fmt.Sprintf("Bot %d", i+1)
		body, _ := json.Marshal(map[string]string{"code": *sessionCode, "name": name})
		resp, err := http.Post(*apiBase+"/api/v1/sessions/join", "application/json", bytes.NewReader(body))
		if err != nil {
			log.Fatalf("join %s: %v", name, err)
		}
		raw, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			log.Fatalf("join %s: %d %s", name, resp.StatusCode, raw)
		}
		var result map[string]string
		if err := json.Unmarshal(raw, &result); err != nil {
			log.Fatalf("unmarshal join response for %s: %v", name, err)
		}
		players[i] = player{ID: result["player_id"], Name: name}
		log.Printf("  joined: %s (id=%s)", name, result["player_id"])
	}
	log.Printf("all %d players joined — start the game from the host UI", *numPlayers)

	// ── Connect WebSockets ─────────────────────────────────────────
	var wg sync.WaitGroup
	for _, p := range players {
		wg.Add(1)
		go func(p player) {
			defer wg.Done()
			wsURL := fmt.Sprintf("%s/api/v1/ws/player/%s?player_id=%s&name=%s",
				*wsBase, *sessionCode, p.ID, url.QueryEscape(p.Name))

			header := http.Header{}
			header.Set("Origin", *origin)
			conn, resp, err := websocket.DefaultDialer.Dial(wsURL, header)
			if resp != nil && resp.Body != nil {
				resp.Body.Close()
			}
			if err != nil {
				log.Printf("[%s] dial error: %v", p.Name, err)
				return
			}
			defer conn.Close()

			// Write channel so we never block the read loop.
			writeCh := make(chan []byte, 16)
			done := make(chan struct{})

			// Writer goroutine — serialises all writes to the conn.
			go func() {
				defer close(done)
				for msg := range writeCh {
					if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
						log.Printf("[%s] write error: %v", p.Name, err)
						return
					}
				}
			}()

			for {
				_, raw, err := conn.ReadMessage()
				if err != nil {
					log.Printf("[%s] disconnected: %v", p.Name, err)
					close(writeCh)
					return
				}
				for _, line := range bytes.Split(raw, []byte("\n")) {
					line = bytes.TrimSpace(line)
					if len(line) == 0 {
						continue
					}
					var msg wsMsg
					if json.Unmarshal(line, &msg) != nil {
						continue
					}

					switch msg.Type {
					case "question":
						var qPayload struct {
							Question struct {
								ID      string `json:"id"`
								Text    string `json:"text"`
								Options []struct {
									ID   string `json:"id"`
									Text string `json:"text"`
								} `json:"options"`
							} `json:"question"`
						}
						if err := json.Unmarshal(msg.Payload, &qPayload); err != nil {
							log.Printf("[%s] unmarshal question: %v", p.Name, err)
							continue
						}
						log.Printf("[%s] got question: %s", p.Name, qPayload.Question.Text)

						// Answer in a goroutine so the read loop stays unblocked
						// (keeps protocol-level pong responses flowing).
						go func() {
							delayN, _ := rand.Int(rand.Reader, big.NewInt(4000))
							delay := time.Duration(1000+delayN.Int64()) * time.Millisecond
							time.Sleep(delay)

							optN, _ := rand.Int(rand.Reader, big.NewInt(int64(len(qPayload.Question.Options))))
							optIdx := int(optN.Int64())
							answer, _ := json.Marshal(map[string]any{
								"type": "answer_submitted",
								"payload": map[string]string{
									"question_id": qPayload.Question.ID,
									"option_id":   qPayload.Question.Options[optIdx].ID,
								},
							})
							select {
							case writeCh <- answer:
								log.Printf("[%s] answered option %d after %v", p.Name, optIdx+1, delay)
							case <-done:
							}
						}()

					case "podium":
						log.Printf("[%s] game over — podium received", p.Name)
						close(writeCh)
						return

					case "ping":
						pong, _ := json.Marshal(map[string]any{"type": "ping", "payload": "pong"})
						select {
						case writeCh <- pong:
						case <-done:
						}
					}
				}
			}
		}(p)
	}

	wg.Wait()
	log.Println("all players disconnected — simulation complete")
}
