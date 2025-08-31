package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"clinic/backend/internal/database"

	"github.com/gorilla/mux"
)

// PatientHandler handles patient-related HTTP requests
type PatientHandler struct {
	repo PatientRepository
}

// PatientRepository interface for database operations
type PatientRepository interface {
	GetAll() ([]database.Patient, error)
	GetByID(id int) (*database.Patient, error)
	Create(p *database.Patient) error
	Update(p *database.Patient) error
	Delete(id int) error
}

// NewPatientHandler creates a new patient handler
func NewPatientHandler(repo PatientRepository) *PatientHandler {
	return &PatientHandler{repo: repo}
}

// HealthCheck handles the health check endpoint
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status":  "healthy",
		"message": "API is running",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetPatients returns a list of all patients
func (h *PatientHandler) GetPatients(w http.ResponseWriter, r *http.Request) {
	patients, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, "Failed to retrieve patients", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(patients)
}

// GetPatient returns a single patient by HN
func (h *PatientHandler) GetPatient(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	hnString := vars["hn"]

	// Extract the numeric part from HN string (e.g., "HN000001" -> 1)
	var id int
	if _, err := fmt.Sscanf(hnString, "HN%d", &id); err != nil {
		http.Error(w, "Invalid patient HN format", http.StatusBadRequest)
		return
	}

	patient, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "Patient not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(patient)
}

// CreatePatient creates a new patient
func (h *PatientHandler) CreatePatient(w http.ResponseWriter, r *http.Request) {
	var patient database.Patient
	if err := json.NewDecoder(r.Body).Decode(&patient); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(&patient); err != nil {
		http.Error(w, "Failed to create patient", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(patient)
}

// UpdatePatient updates an existing patient
func (h *PatientHandler) UpdatePatient(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	hnString := vars["hn"]

	var patient database.Patient
	if err := json.NewDecoder(r.Body).Decode(&patient); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	patient.HN = hnString
	if err := h.repo.Update(&patient); err != nil {
		http.Error(w, "Failed to update patient", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(patient)
}

// DeletePatient deletes a patient
func (h *PatientHandler) DeletePatient(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	hnString := vars["hn"]

	// Extract the numeric part from HN string (e.g., "HN000001" -> 1)
	var id int
	if _, err := fmt.Sscanf(hnString, "HN%d", &id); err != nil {
		http.Error(w, "Invalid patient HN format", http.StatusBadRequest)
		return
	}

	if err := h.repo.Delete(id); err != nil {
		http.Error(w, "Failed to delete patient", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
