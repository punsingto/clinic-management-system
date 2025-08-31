'use client';

import { useEffect, useState } from 'react';

interface Patient {
  hn: string;                // HN Number (HNXXXXXX)
  fullName: string;          // ชื่อ-นามสกุล
  gender: string;            // เพศ
  nickname?: string;         // ชื่อเล่น
  phone?: string;            // เบอร์โทร
  age: number;               // อายุ
  dateOfBirth?: string;      // วันเกิด
  photo?: string;            // Photo URL/Base64
  createdAt: string;
  updatedAt: string;
}

interface PatientListProps {
  refreshTrigger?: number;
}

export default function PatientList({ refreshTrigger }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/patients');
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      setPatients(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-white/20">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Patients Directory
            </h2>
            <p className="text-gray-600 mt-1">{patients.length} total patients</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            {patients.length} Active
          </div>
        </div>
      </div>
      
      {patients.length === 0 ? (
        <div className="px-8 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No patients found</h3>
          <p className="mt-2 text-gray-500">Get started by adding your first patient.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Personal Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Age & DOB
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {patients.map((patient, index) => (
                <tr key={patient.hn} className="hover:bg-blue-50/30 transition-colors duration-150">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {patient.photo ? (
                          <img 
                            src={patient.photo} 
                            alt={patient.fullName}
                            className="h-12 w-12 rounded-xl object-cover shadow-lg"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {patient.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-semibold text-gray-900">
                          {patient.fullName}
                        </div>
                        <div className="text-sm text-gray-500">HN: {patient.hn}</div>
                        {patient.nickname && (
                          <div className="text-sm text-blue-600">({patient.nickname})</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">
                        {patient.phone || 'No phone'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900 font-medium">
                        เพศ: {patient.gender}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900 font-medium">
                        อายุ: {patient.age} ปี
                      </div>
                      {patient.dateOfBirth && (
                        <div className="text-xs text-gray-500">
                          วันเกิด: {patient.dateOfBirth}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-gray-500">
                      {formatDate(patient.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
