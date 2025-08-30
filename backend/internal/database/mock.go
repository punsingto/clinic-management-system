package database

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

// MockPatientRepository is an in-memory implementation for testing
type MockPatientRepository struct {
	patients map[int]*Patient
	nextID   int
	mutex    sync.RWMutex
}

// NewMockPatientRepository creates a new mock patient repository
func NewMockPatientRepository() *MockPatientRepository {
	repo := &MockPatientRepository{
		patients: make(map[int]*Patient),
		nextID:   1,
	}

	// Add some sample data
	repo.createSampleData()
	return repo
}

func (r *MockPatientRepository) createSampleData() {
	samplePatients := []*Patient{
		{
			FirstName: "John",
			LastName:  "Doe",
			Email:     "john.doe@example.com",
			Phone:     stringPtr("555-0101"),
			Address:   stringPtr("123 Main St, City, State"),
		},
		{
			FirstName: "Jane",
			LastName:  "Smith",
			Email:     "jane.smith@example.com",
			Phone:     stringPtr("555-0102"),
			Address:   stringPtr("456 Oak Ave, City, State"),
		},
		{
			FirstName: "Robert",
			LastName:  "Johnson",
			Email:     "robert.johnson@example.com",
			Phone:     stringPtr("555-0103"),
			Address:   stringPtr("789 Pine St, City, State"),
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

	// Sort by ID (newest first)
	sort.Slice(patients, func(i, j int) bool {
		return patients[i].ID > patients[j].ID
	})

	return patients, nil
}

// GetByID retrieves a patient by ID
func (r *MockPatientRepository) GetByID(id int) (*Patient, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	patient, exists := r.patients[id]
	if !exists {
		return nil, fmt.Errorf("patient with id %d not found", id)
	}

	// Return a copy
	patientCopy := *patient
	return &patientCopy, nil
}

// Create adds a new patient
func (r *MockPatientRepository) Create(p *Patient) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	// Check if email already exists
	for _, existing := range r.patients {
		if existing.Email == p.Email {
			return fmt.Errorf("patient with email %s already exists", p.Email)
		}
	}

	p.ID = r.nextID
	r.nextID++
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()

	// Store a copy
	patientCopy := *p
	r.patients[p.ID] = &patientCopy

	return nil
}

// Update modifies an existing patient
func (r *MockPatientRepository) Update(p *Patient) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	existing, exists := r.patients[p.ID]
	if !exists {
		return fmt.Errorf("patient with id %d not found", p.ID)
	}

	// Check if email conflicts with another patient
	for id, other := range r.patients {
		if id != p.ID && other.Email == p.Email {
			return fmt.Errorf("patient with email %s already exists", p.Email)
		}
	}

	// Update fields
	existing.FirstName = p.FirstName
	existing.LastName = p.LastName
	existing.Email = p.Email
	existing.Phone = p.Phone
	existing.DateOfBirth = p.DateOfBirth
	existing.Address = p.Address
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

	if _, exists := r.patients[id]; !exists {
		return fmt.Errorf("patient with id %d not found", id)
	}

	delete(r.patients, id)
	return nil
}

// Helper function to create string pointers
func stringPtr(s string) *string {
	return &s
}
