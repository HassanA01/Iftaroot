package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
)

type generateQuizRequest struct {
	Topic         string `json:"topic"`
	QuestionCount int    `json:"question_count"`
	Context       string `json:"context"`
}

func (h *Handler) GenerateQuiz(w http.ResponseWriter, r *http.Request) {
	// 1. Decode request
	var req generateQuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// 2. Validate inputs first (before checking service availability)
	if req.Topic == "" {
		writeError(w, http.StatusBadRequest, "topic is required")
		return
	}
	if req.QuestionCount < 1 || req.QuestionCount > 20 {
		writeError(w, http.StatusBadRequest, "question_count must be between 1 and 20")
		return
	}

	// 3. Check API key
	if h.anthropicClient == nil {
		writeError(w, http.StatusServiceUnavailable, "AI quiz generation is not configured")
		return
	}

	// 4. Build prompt
	userPrompt := "Generate a quiz about: " + req.Topic + ". Number of questions: " + strconv.Itoa(req.QuestionCount) + "."
	if req.Context != "" {
		userPrompt += " Additional context: " + req.Context
	}

	// 5. Define the tool schema
	toolSchema := anthropic.ToolInputSchemaParam{
		Properties: map[string]any{
			"title": map[string]any{
				"type":        "string",
				"description": "The title of the quiz",
			},
			"questions": map[string]any{
				"type":        "array",
				"description": "List of quiz questions",
				"items": map[string]any{
					"type": "object",
					"properties": map[string]any{
						"text": map[string]any{
							"type":        "string",
							"description": "The question text",
						},
						"time_limit": map[string]any{
							"type":        "integer",
							"description": "Time limit in seconds (e.g. 20 or 30)",
						},
						"order": map[string]any{
							"type":        "integer",
							"description": "Question order (1-based)",
						},
						"options": map[string]any{
							"type":        "array",
							"description": "Answer options (exactly 4)",
							"items": map[string]any{
								"type": "object",
								"properties": map[string]any{
									"text": map[string]any{
										"type":        "string",
										"description": "Option text",
									},
									"is_correct": map[string]any{
										"type":        "boolean",
										"description": "Whether this option is correct",
									},
								},
								"required": []string{"text", "is_correct"},
							},
						},
					},
					"required": []string{"text", "time_limit", "order", "options"},
				},
			},
		},
		Required: []string{"title", "questions"},
	}

	tool := anthropic.ToolUnionParamOfTool(toolSchema, "create_quiz")

	// 6. Call Claude with a 30s timeout, forced tool use
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	resp, err := h.anthropicClient.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     anthropic.ModelClaudeSonnet4_6,
		MaxTokens: 4096,
		Messages: []anthropic.MessageParam{
			anthropic.NewUserMessage(anthropic.NewTextBlock(userPrompt)),
		},
		Tools: []anthropic.ToolUnionParam{tool},
		ToolChoice: anthropic.ToolChoiceUnionParam{
			OfTool: &anthropic.ToolChoiceToolParam{
				Name: "create_quiz",
			},
		},
	})
	if err != nil {
		writeError(w, http.StatusBadGateway, fmt.Sprintf("AI service error: %v", err))
		return
	}

	// 7. Find the tool_use block in the response
	var toolInput json.RawMessage
	for _, block := range resp.Content {
		if block.Type == "tool_use" && block.Name == "create_quiz" {
			toolInput = block.Input
			break
		}
	}
	if toolInput == nil {
		writeError(w, http.StatusBadGateway, "AI did not return a quiz")
		return
	}

	// 8. Unmarshal into createQuizRequest (defined in quiz.go)
	var quiz createQuizRequest
	if err := json.Unmarshal(toolInput, &quiz); err != nil {
		writeError(w, http.StatusBadGateway, "AI returned malformed quiz data")
		return
	}

	// 9. Validate result
	if quiz.Title == "" || len(quiz.Questions) == 0 {
		writeError(w, http.StatusBadGateway, "AI returned an incomplete quiz")
		return
	}

	// 10. Return the generated quiz
	writeJSON(w, http.StatusOK, quiz)
}
