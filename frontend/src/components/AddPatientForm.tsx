'use client';

import { useState, useRef } from 'react';

interface PatientFormData {
  hn: string;              // HN Number (HNXXXXXX)
  titlePrefix: string;     // คำนำหน้า (นาย, นาง, นางสาว)
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
    titlePrefix: '',
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
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate next HN number
  const generateHN = () => {
    const randomNum = Math.floor(Math.random() * 999999) + 1;
    return `HN${randomNum.toString().padStart(6, '0')}`;
  };

  // Auto-select gender based on title prefix
  const getGenderFromPrefix = (prefix: string): string => {
    switch (prefix) {
      case 'นาย':
        return 'ชาย';
      case 'นาง':
      case 'นางสาว':
        return 'หญิง';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'titlePrefix') {
      // Auto-select gender when title prefix changes
      const autoGender = getGenderFromPrefix(value);
      setFormData(prev => ({
        ...prev,
        titlePrefix: value,
        gender: autoGender,
        fullName: value ? `${value}${prev.fullName.replace(/^(นาย|นาง|นางสาว)/, '')}` : prev.fullName.replace(/^(นาย|นาง|นางสาว)/, '')
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'age' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData(prev => ({ ...prev, photo: base64String }));
        setPhotoPreview(base64String);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        hn: formData.hn || generateHN(),
        fullName: formData.titlePrefix ? `${formData.titlePrefix}${formData.fullName.replace(/^(นาย|นาง|นางสาว)/, '')}` : formData.fullName
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
        titlePrefix: '',
        fullName: '',
        gender: '',
        nickname: '',
        phone: '',
        age: 0,
        dateOfBirth: '',
        photo: ''
      });
      setPhotoPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
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
    <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">เพิ่มข้อมูลผู้ป่วย</h3>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 rounded-r-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4 rounded-r-lg">
          <p className="text-green-700 text-sm font-medium">เพิ่มข้อมูลผู้ป่วยเรียบร้อยแล้ว!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Upload Section */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Patient photo preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-xs text-gray-500">รูปภาพ</span>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Compact Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">HN</label>
            <input
              type="text"
              name="hn"
              value={formData.hn}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
              placeholder="อัตโนมัติ"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">คำนำหน้า *</label>
            <select
              name="titlePrefix"
              value={formData.titlePrefix}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
            >
              <option value="">เลือก</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName.replace(/^(นาย|นาง|นางสาว)/, '')}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
              placeholder="กรอกชื่อ-นามสกุล (ไม่ต้องใส่คำนำหน้า)"
            />
            {formData.titlePrefix && formData.fullName.replace(/^(นาย|นาง|นางสาว)/, '') && (
              <p className="text-xs text-blue-600 mt-1">
                ชื่อเต็ม: {formData.titlePrefix}{formData.fullName.replace(/^(นาย|นาง|นางสาว)/, '')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">เพศ *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
              disabled={!!formData.titlePrefix}
            >
              <option value="">เลือก</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
            {formData.titlePrefix && (
              <p className="text-xs text-green-600 mt-1">เลือกอัตโนมัติจากคำนำหน้า</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อเล่น</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
              placeholder="ชื่อเล่น"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">อายุ *</label>
            <input
              type="number"
              name="age"
              value={formData.age || ''}
              onChange={handleInputChange}
              required
              min="0"
              max="150"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
              placeholder="อายุ"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">วันเกิด</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
            placeholder="กรอกเบอร์โทรศัพท์"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">กำลังเพิ่มข้อมูล...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm">เพิ่มผู้ป่วย</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
