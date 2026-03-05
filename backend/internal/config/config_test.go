package config

import "testing"

func TestValidate_ValidConfig(t *testing.T) {
	c := &Config{
		Port:        "8081",
		DatabaseURL: "postgres://user:pass@localhost:5432/db",
		RedisURL:    "redis://localhost:6379",
		JWTSecret:   "supersecret",
		FrontendURL: "http://localhost:5173",
	}
	if err := c.Validate(); err != nil {
		t.Errorf("expected no error, got: %v", err)
	}
}

func TestValidate_PostgresqlPrefix(t *testing.T) {
	c := &Config{
		Port:        "8081",
		DatabaseURL: "postgresql://user:pass@localhost:5432/db",
		RedisURL:    "redis://localhost:6379",
		JWTSecret:   "supersecret",
		FrontendURL: "http://localhost:5173",
	}
	if err := c.Validate(); err != nil {
		t.Errorf("expected no error for postgresql://, got: %v", err)
	}
}

func TestValidate_RedissPrefix(t *testing.T) {
	c := &Config{
		Port:        "8081",
		DatabaseURL: "postgres://user:pass@localhost:5432/db",
		RedisURL:    "rediss://localhost:6379",
		JWTSecret:   "supersecret",
		FrontendURL: "http://localhost:5173",
	}
	if err := c.Validate(); err != nil {
		t.Errorf("expected no error for rediss://, got: %v", err)
	}
}

func TestValidate_MissingRequired(t *testing.T) {
	tests := []struct {
		name   string
		config Config
	}{
		{
			name: "missing JWT_SECRET",
			config: Config{
				Port: "8081", DatabaseURL: "postgres://x", RedisURL: "redis://x", FrontendURL: "http://x",
			},
		},
		{
			name: "missing DATABASE_URL",
			config: Config{
				Port: "8081", RedisURL: "redis://x", JWTSecret: "x", FrontendURL: "http://x",
			},
		},
		{
			name: "missing REDIS_URL",
			config: Config{
				Port: "8081", DatabaseURL: "postgres://x", JWTSecret: "x", FrontendURL: "http://x",
			},
		},
		{
			name: "missing PORT",
			config: Config{
				DatabaseURL: "postgres://x", RedisURL: "redis://x", JWTSecret: "x", FrontendURL: "http://x",
			},
		},
		{
			name: "missing FRONTEND_URL",
			config: Config{
				Port: "8081", DatabaseURL: "postgres://x", RedisURL: "redis://x", JWTSecret: "x",
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if err := tc.config.Validate(); err == nil {
				t.Error("expected error, got nil")
			}
		})
	}
}

func TestValidate_BadDatabaseURL(t *testing.T) {
	c := &Config{
		Port:        "8081",
		DatabaseURL: "mysql://user:pass@localhost/db",
		RedisURL:    "redis://localhost:6379",
		JWTSecret:   "supersecret",
		FrontendURL: "http://localhost:5173",
	}
	err := c.Validate()
	if err == nil {
		t.Fatal("expected error for bad DATABASE_URL prefix")
	}
	if got := err.Error(); got != "DATABASE_URL must start with postgres:// or postgresql://" {
		t.Errorf("unexpected error: %s", got)
	}
}

func TestValidate_BadRedisURL(t *testing.T) {
	c := &Config{
		Port:        "8081",
		DatabaseURL: "postgres://user:pass@localhost/db",
		RedisURL:    "http://localhost:6379",
		JWTSecret:   "supersecret",
		FrontendURL: "http://localhost:5173",
	}
	err := c.Validate()
	if err == nil {
		t.Fatal("expected error for bad REDIS_URL prefix")
	}
	if got := err.Error(); got != "REDIS_URL must start with redis:// or rediss://" {
		t.Errorf("unexpected error: %s", got)
	}
}

func TestValidate_RedisURLWithControlChars(t *testing.T) {
	c := &Config{
		Port:        "8081",
		DatabaseURL: "postgres://user:pass@localhost/db",
		RedisURL:    "redis://localhost:6379\n",
		JWTSecret:   "supersecret",
		FrontendURL: "http://localhost:5173",
	}
	err := c.Validate()
	if err == nil {
		t.Fatal("expected error for REDIS_URL with control chars")
	}
	if got := err.Error(); got != "REDIS_URL contains control characters (newlines, tabs, etc.) — check for line-wrapping in your config" {
		t.Errorf("unexpected error: %s", got)
	}
}

func TestContainsControlChars(t *testing.T) {
	tests := []struct {
		input string
		want  bool
	}{
		{"redis://localhost:6379", false},
		{"redis://localhost:6379\n", true},
		{"redis://localhost\t:6379", true},
		{"redis://localhost\r:6379", true},
		{"", false},
	}
	for _, tc := range tests {
		got := containsControlChars(tc.input)
		if got != tc.want {
			t.Errorf("containsControlChars(%q) = %v, want %v", tc.input, got, tc.want)
		}
	}
}
