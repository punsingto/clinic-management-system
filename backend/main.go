package main

import (
	"log"
	"net/http"

	"clinic/backend/api/handlers"
	"clinic/backend/internal/database"

	"github.com/gorilla/mux"
)

func main() {
	// Initialize mock database (replace with real database connection later)
	patientRepo := database.NewMockPatientRepository()
	patientHandler := handlers.NewPatientHandler(patientRepo)

	r := mux.NewRouter()

	// Add CORS middleware
	r.Use(corsMiddleware)

	// API routes
	r.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	// Patient routes
	r.HandleFunc("/api/patients", patientHandler.GetPatients).Methods("GET")
	r.HandleFunc("/api/patients/{id}", patientHandler.GetPatient).Methods("GET")
	r.HandleFunc("/api/patients", patientHandler.CreatePatient).Methods("POST")
	r.HandleFunc("/api/patients/{id}", patientHandler.UpdatePatient).Methods("PUT")
	r.HandleFunc("/api/patients/{id}", patientHandler.DeletePatient).Methods("DELETE")

	log.Printf("Starting server on :8080")
	log.Printf("Available endpoints:")
	log.Printf("  GET    /health")
	log.Printf("  GET    /api/patients")
	log.Printf("  GET    /api/patients/{id}")
	log.Printf("  POST   /api/patients")
	log.Printf("  PUT    /api/patients/{id}")
	log.Printf("  DELETE /api/patients/{id}")

	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
