package database

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

// MockPatientRepository is an in-memory implementation for testing
type MockPatientRepository struct {
	patients map[string]*Patient
	mutex    sync.RWMutex
}

// NewMockPatientRepository creates a new mock patient repository
func NewMockPatientRepository() *MockPatientRepository {
	repo := &MockPatientRepository{
		patients: make(map[string]*Patient),
	}

	// Add some sample data
	repo.createSampleData()
	return repo
}

func (r *MockPatientRepository) createSampleData() {
	samplePatients := []*Patient{
		{
			HN:          "HN000001",
			FullName:    "นายสมชาย ใจดี",
			Gender:      "ชาย",
			Nickname:    stringPtr("ชาย"),
			Phone:       stringPtr("081-234-5678"),
			Age:         35,
			DateOfBirth: stringPtr("1989-03-15"),
		},
		{
			HN:          "HN000002",
			FullName:    "นางสาวสมหญิง สวยงาม",
			Gender:      "หญิง",
			Nickname:    stringPtr("หญิง"),
			Phone:       stringPtr("082-345-6789"),
			Age:         28,
			DateOfBirth: stringPtr("1996-07-22"),
		},
		{
			HN:          "HN000003",
			FullName:    "นายวิชัย เก่งกาจ",
			Gender:      "ชาย",
			Nickname:    stringPtr("วิชัย"),
			Phone:       stringPtr("083-456-7890"),
			Age:         42,
			DateOfBirth: stringPtr("1982-11-08"),
		},
	}

	for _, p := range samplePatients {
		r.Create(p)
	}
}

// GetAll retrieves all patients
func (r *MockPatientRepository) GetAll() ([]Patient, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	patients := make([]Patient, 0, len(r.patients))
	for _, p := range r.patients {
		patients = append(patients, *p)
	}

	// Sort by CreatedAt (newest first)
	sort.Slice(patients, func(i, j int) bool {
		return patients[i].CreatedAt.After(patients[j].CreatedAt)
	})

	return patients, nil
}

// GetByID retrieves a patient by ID
func (r *MockPatientRepository) GetByID(id int) (*Patient, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	// Convert int id to HN string format
	hnString := fmt.Sprintf("HN%06d", id)

	patient, exists := r.patients[hnString]
	if !exists {
		return nil, fmt.Errorf("patient with hn %s not found", hnString)
	}

	// Return a copy
	patientCopy := *patient
	return &patientCopy, nil
}

// Create adds a new patient
func (r *MockPatientRepository) Create(p *Patient) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	// Check if HN already exists
	if _, exists := r.patients[p.HN]; exists {
		return fmt.Errorf("patient with HN %s already exists", p.HN)
	}

	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()

	// Store a copy
	patientCopy := *p
	r.patients[p.HN] = &patientCopy

	return nil
}

// Update modifies an existing patient
func (r *MockPatientRepository) Update(p *Patient) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	existing, exists := r.patients[p.HN]
	if !exists {
		return fmt.Errorf("patient with HN %s not found", p.HN)
	}

	// Update fields
	existing.FullName = p.FullName
	existing.Gender = p.Gender
	existing.Nickname = p.Nickname
	existing.Phone = p.Phone
	existing.Age = p.Age
	existing.DateOfBirth = p.DateOfBirth
	existing.Photo = p.Photo
	existing.UpdatedAt = time.Now()

	// Update the stored patient
	p.CreatedAt = existing.CreatedAt
	p.UpdatedAt = existing.UpdatedAt

	return nil
}

// Delete removes a patient
func (r *MockPatientRepository) Delete(id int) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	// Convert int id to HN string format
	hnString := fmt.Sprintf("HN%06d", id)

	if _, exists := r.patients[hnString]; !exists {
		return fmt.Errorf("patient with hn %s not found", hnString)
	}

	delete(r.patients, hnString)
	return nil
}

// Helper function to create string pointers
func stringPtr(s string) *string {
	return &s
}
