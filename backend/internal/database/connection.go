package database

import (
	"database/sql"
	"fmt"
	"log"
	// _ "github.com/lib/pq" // PostgreSQL driver (uncomment when using real database)
)

type DB struct {
	conn *sql.DB
}

// NewConnection creates a new database connection
func NewConnection(host, port, user, password, dbname string) (*DB, error) {
	// For PostgreSQL (replace with Progress DB connection string format)
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	conn, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &DB{conn: conn}, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.conn.Close()
}

// CreatePatientsTable creates the patients table
func (db *DB) CreatePatientsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS patients (
		id SERIAL PRIMARY KEY,
		first_name VARCHAR(100) NOT NULL,
		last_name VARCHAR(100) NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		phone VARCHAR(20),
		date_of_birth DATE,
		address TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`

	_, err := db.conn.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create patients table: %w", err)
	}

	log.Println("Patients table created successfully")
	return nil
}
