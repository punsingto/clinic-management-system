package database

import (
	"database/sql"
	"fmt"
	"time"
)

// Patient represents a patient in the database
type Patient struct {
	HN          string    `json:"hn" db:"hn"`                               // HN Number (HNXXXXXX)
	FullName    string    `json:"fullName" db:"full_name"`                  // ชื่อ-นามสกุล
	Gender      string    `json:"gender" db:"gender"`                       // เพศ
	Nickname    *string   `json:"nickname,omitempty" db:"nickname"`         // ชื่อเล่น
	Phone       *string   `json:"phone,omitempty" db:"phone"`               // เบอร์โทร
	Age         int       `json:"age" db:"age"`                             // อายุ
	DateOfBirth *string   `json:"dateOfBirth,omitempty" db:"date_of_birth"` // วันเกิด
	Photo       *string   `json:"photo,omitempty" db:"photo"`               // Photo URL/Base64
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
		SELECT hn, full_name, gender, nickname, phone, age, date_of_birth, photo, created_at, updated_at
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
		err := rows.Scan(&p.HN, &p.FullName, &p.Gender, &p.Nickname,
			&p.Phone, &p.Age, &p.DateOfBirth, &p.Photo, &p.CreatedAt, &p.UpdatedAt)
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
		SELECT hn, full_name, gender, nickname, phone, age, date_of_birth, photo, created_at, updated_at
		FROM patients
		WHERE hn = $1
	`

	var p Patient
	err := r.db.conn.QueryRow(query, id).Scan(
		&p.HN, &p.FullName, &p.Gender, &p.Nickname,
		&p.Phone, &p.Age, &p.DateOfBirth, &p.Photo, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("patient with hn %d not found", id)
		}
		return nil, fmt.Errorf("failed to get patient: %w", err)
	}

	return &p, nil
}

// Create adds a new patient to the database
func (r *PatientRepository) Create(p *Patient) error {
	query := `
		INSERT INTO patients (hn, full_name, gender, nickname, phone, age, date_of_birth, photo)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at, updated_at
	`

	err := r.db.conn.QueryRow(query, p.HN, p.FullName, p.Gender, p.Nickname,
		p.Phone, p.Age, p.DateOfBirth, p.Photo).Scan(&p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create patient: %w", err)
	}

	return nil
}

// Update modifies an existing patient
func (r *PatientRepository) Update(p *Patient) error {
	query := `
		UPDATE patients 
		SET full_name = $1, gender = $2, nickname = $3, phone = $4, 
		    age = $5, date_of_birth = $6, photo = $7, updated_at = CURRENT_TIMESTAMP
		WHERE hn = $8
		RETURNING updated_at
	`

	err := r.db.conn.QueryRow(query, p.FullName, p.Gender, p.Nickname,
		p.Phone, p.Age, p.DateOfBirth, p.Photo, p.HN).Scan(&p.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to update patient: %w", err)
	}

	return nil
}

// Delete removes a patient from the database
func (r *PatientRepository) Delete(id int) error {
	query := "DELETE FROM patients WHERE hn = $1"

	result, err := r.db.conn.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete patient: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("patient with hn %d not found", id)
	}

	return nil
}
