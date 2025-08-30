package database

import (
	"database/sql"
	"fmt"
	"time"
)

// Patient represents a patient in the database
type Patient struct {
	ID          int       `json:"id" db:"id"`
	FirstName   string    `json:"firstName" db:"first_name"`
	LastName    string    `json:"lastName" db:"last_name"`
	Email       string    `json:"email" db:"email"`
	Phone       *string   `json:"phone,omitempty" db:"phone"`
	DateOfBirth *string   `json:"dateOfBirth,omitempty" db:"date_of_birth"`
	Address     *string   `json:"address,omitempty" db:"address"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

// PatientRepository handles patient database operations
type PatientRepository struct {
	db *DB
}

// NewPatientRepository creates a new patient repository
func NewPatientRepository(db *DB) *PatientRepository {
	return &PatientRepository{db: db}
}

// GetAll retrieves all patients from the database
func (r *PatientRepository) GetAll() ([]Patient, error) {
	query := `
		SELECT id, first_name, last_name, email, phone, date_of_birth, address, created_at, updated_at
		FROM patients
		ORDER BY created_at DESC
	`

	rows, err := r.db.conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query patients: %w", err)
	}
	defer rows.Close()

	var patients []Patient
	for rows.Next() {
		var p Patient
		err := rows.Scan(&p.ID, &p.FirstName, &p.LastName, &p.Email,
			&p.Phone, &p.DateOfBirth, &p.Address, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan patient: %w", err)
		}
		patients = append(patients, p)
	}

	return patients, nil
}

// GetByID retrieves a patient by ID
func (r *PatientRepository) GetByID(id int) (*Patient, error) {
	query := `
		SELECT id, first_name, last_name, email, phone, date_of_birth, address, created_at, updated_at
		FROM patients
		WHERE id = $1
	`

	var p Patient
	err := r.db.conn.QueryRow(query, id).Scan(
		&p.ID, &p.FirstName, &p.LastName, &p.Email,
		&p.Phone, &p.DateOfBirth, &p.Address, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("patient with id %d not found", id)
		}
		return nil, fmt.Errorf("failed to get patient: %w", err)
	}

	return &p, nil
}

// Create adds a new patient to the database
func (r *PatientRepository) Create(p *Patient) error {
	query := `
		INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, address)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`

	err := r.db.conn.QueryRow(query, p.FirstName, p.LastName, p.Email,
		p.Phone, p.DateOfBirth, p.Address).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create patient: %w", err)
	}

	return nil
}

// Update modifies an existing patient
func (r *PatientRepository) Update(p *Patient) error {
	query := `
		UPDATE patients 
		SET first_name = $1, last_name = $2, email = $3, phone = $4, 
		    date_of_birth = $5, address = $6, updated_at = CURRENT_TIMESTAMP
		WHERE id = $7
		RETURNING updated_at
	`

	err := r.db.conn.QueryRow(query, p.FirstName, p.LastName, p.Email,
		p.Phone, p.DateOfBirth, p.Address, p.ID).Scan(&p.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to update patient: %w", err)
	}

	return nil
}

// Delete removes a patient from the database
func (r *PatientRepository) Delete(id int) error {
	query := "DELETE FROM patients WHERE id = $1"

	result, err := r.db.conn.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete patient: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("patient with id %d not found", id)
	}

	return nil
}
