'use client';

import { useState } from 'react';

interface PatientFormData {
  hn: string;              // HN Number (HNXXXXXX)
  fullName: string;        // ชื่อ-นามสกุล
  gender: string;          // เพศ
  nickname: string;        // ชื่อเล่น
  phone: string;           // เบอร์โทร
  age: number;             // อายุ
  dateOfBirth: string;     // วันเกิด
  photo: string;           // Photo URL/Base64
}

interface AddPatientFormProps {
  onPatientAdded: () => void;
}

export default function AddPatientForm({ onPatientAdded }: AddPatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    hn: '',
    fullName: '',
    gender: '',
    nickname: '',
    phone: '',
    age: 0,
    dateOfBirth: '',
    photo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Generate next HN number
  const generateHN = () => {
    const randomNum = Math.floor(Math.random() * 999999) + 1;
    return `HN${randomNum.toString().padStart(6, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Generate HN if not provided
      const submitData = {
        ...formData,
        hn: formData.hn || generateHN()
      };

      const response = await fetch('http://localhost:8080/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to create patient');
      }

      const newPatient = await response.json();
      console.log('New patient created:', newPatient);
      
      // Reset form
      setFormData({
        hn: '',
        fullName: '',
        gender: '',
        nickname: '',
        phone: '',
        age: 0,
        dateOfBirth: '',
        photo: ''
      });
      
      setSuccess(true);
      onPatientAdded(); // Refresh the patient list
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">เพิ่มข้อมูลผู้ป่วย</h3>
        </div>
        <p className="text-gray-600">กรุณากรอกข้อมูลผู้ป่วยให้ครบถ้วน</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="ml-3">
              <p className="text-green-700 font-medium">เพิ่มข้อมูลผู้ป่วยเรียบร้อยแล้ว!</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="hn" className="block text-sm font-semibold text-gray-700">
              หมายเลข HN
            </label>
            <input
              type="text"
              id="hn"
              name="hn"
              value={formData.hn}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
              placeholder="จะสร้างอัตโนมัติหากไม่กรอก"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
              ชื่อ-นามสกุล *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
              placeholder="กรอกชื่อ-นามสกุล"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">
              เพศ *
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
            >
              <option value="">เลือกเพศ</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="nickname" className="block text-sm font-semibold text-gray-700">
              ชื่อเล่น
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
              placeholder="กรอกชื่อเล่น"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
              placeholder="กรอกเบอร์โทรศัพท์"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="age" className="block text-sm font-semibold text-gray-700">
              อายุ *
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age || ''}
              onChange={handleInputChange}
              required
              min="0"
              max="150"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
              placeholder="กรอกอายุ"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700">
            วันเกิด
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="photo" className="block text-sm font-semibold text-gray-700">
            รูปภาพ (URL)
          </label>
          <input
            type="url"
            id="photo"
            name="photo"
            value={formData.photo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
            placeholder="กรอก URL รูปภาพ"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>กำลังเพิ่มข้อมูล...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>เพิ่มผู้ป่วย</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
