'use client';

import { useState, useRef, useEffect } from 'react';

interface PatientFormData {
  hn: string;
  titlePrefix: string;
  fullName: string;
  gender: string;
  nickname: string;
  phone: string;
  age: number;
  dateOfBirth: string;
  photo: string;
}

interface ValidationErrors {
  hn?: string;
  titlePrefix?: string;
  fullName?: string;
  gender?: string;
  nickname?: string;
  phone?: string;
  age?: string;
  dateOfBirth?: string;
  photo?: string;
}

interface FieldValidation {
  isValid: boolean;
  message: string;
  type: 'error' | 'warning' | 'success';
}

interface AddPatientFormProps {
  onPatientAdded: () => void;
}

function AddPatientForm({ onPatientAdded }: AddPatientFormProps) {
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
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [fieldValidations, setFieldValidations] = useState<Record<string, FieldValidation>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions
  const addLeadingZeros = (hn: string): string => {
    if (!hn) return '';
    const cleanHN = hn.replace(/\D/g, '');
    return cleanHN.padStart(6, '0');
  };

  const formatHN = (hn: string): string => {
    const cleanHN = hn.replace(/\D/g, '');
    return cleanHN.slice(0, 6);
  };

  const validateHN = (hn: string): FieldValidation => {
    if (!hn) {
      return { isValid: false, message: 'กรุณาระบุหมายเลข HN', type: 'error' };
    }
    
    const cleanHN = hn.replace(/\D/g, '');
    if (cleanHN.length < 1) {
      return { isValid: false, message: 'HN ต้องมีอย่างน้อย 1 หลัก', type: 'error' };
    }
    if (cleanHN.length > 6) {
      return { isValid: false, message: 'HN ต้องไม่เกิน 6 หลัก', type: 'error' };
    }
    
    return { isValid: true, message: 'HN ถูกต้อง', type: 'success' };
  };

  const validatePhone = (phone: string): FieldValidation => {
    if (!phone) {
      return { isValid: false, message: 'กรุณาระบุเบอร์โทรศัพท์', type: 'error' };
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { isValid: false, message: 'เบอร์โทรต้องมี 10 หลัก', type: 'error' };
    }
    
    return { isValid: true, message: 'เบอร์โทรถูกต้อง', type: 'success' };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    if (name === 'hn') {
      processedValue = formatHN(value);
    } else if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        processedValue = digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      }
    } else if (name === 'titlePrefix') {
      // Auto-fill gender based on title
      if (value === 'นาย') {
        setFormData(prev => ({ ...prev, gender: 'ชาย' }));
      } else if (value === 'นาง' || value === 'นางสาว') {
        setFormData(prev => ({ ...prev, gender: 'หญิง' }));
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Validate field
    if (name === 'hn') {
      setFieldValidations(prev => ({
        ...prev,
        [name]: validateHN(processedValue)
      }));
    } else if (name === 'phone') {
      setFieldValidations(prev => ({
        ...prev,
        [name]: validatePhone(processedValue)
      }));
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPhotoPreview(base64);
        setFormData(prev => ({ ...prev, photo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setFormData(prev => ({ ...prev, photo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Add leading zeros to HN
      const finalHN = addLeadingZeros(formData.hn);
      
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          hn: finalHN
        }),
      });

      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

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
      setValidationErrors({});
      setFieldValidations({});
      setTouchedFields({});
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setSuccess(true);
      onPatientAdded();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldValidationClass = (field: string) => {
    const validation = fieldValidations[field];
    if (!validation || !touchedFields[field]) return 'border-gray-300';
    
    return validation.isValid ? 'border-green-500' : 'border-red-500';
  };

  const renderValidationMessage = (field: string) => {
    const validation = fieldValidations[field];
    if (!validation || !touchedFields[field]) return null;

    const colorClass = validation.isValid ? 'text-green-600' : 'text-red-600';
    
    return (
      <p className={`text-xs mt-1 px-2 ${colorClass}`}>
        {validation.message}
      </p>
    );
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">บันทึกข้อมูลผู้ป่วยเรียบร้อยแล้ว</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="text-center border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-xl font-medium text-gray-800">เพิ่มผู้ป่วยใหม่</h2>
            <p className="text-gray-500 text-sm mt-1">กรอกข้อมูลผู้ป่วยให้ครบถ้วน</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo and HN Section */}
            <div className="flex gap-6 items-start bg-gray-50 p-4 rounded-lg">
              {/* Photo Upload */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">รูปถ่าย</label>
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="รูปผู้ป่วย"
                      className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 bg-white"
                  >
                    <div className="text-center text-gray-400">
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">เพิ่มรูป</span>
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

              {/* HN Field */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเลข HN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hn"
                  value={formData.hn}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('hn')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${getFieldValidationClass('hn')}`}
                  placeholder="ระบุหมายเลข HN"
                  maxLength={6}
                  required
                />
                {renderValidationMessage('hn')}
                {formData.hn && (
                  <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                    <span className="text-sm text-blue-700">รูปแบบ HN: </span>
                    <span className="font-mono font-semibold text-blue-900">{addLeadingZeros(formData.hn)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">ข้อมูลส่วนตัว</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำนำหน้า <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="titlePrefix"
                    value={formData.titlePrefix}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('titlePrefix')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">เลือกคำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="เด็กชาย">เด็กชาย</option>
                    <option value="เด็กหญิง">เด็กหญิง</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เพศ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('gender')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('fullName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ระบุชื่อและนามสกุล"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อเล่น
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('nickname')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ระบุชื่อเล่น"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อายุ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('age')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ระบุอายุ"
                    min="0"
                    max="150"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">ข้อมูลติดต่อ</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('phone')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${getFieldValidationClass('phone')}`}
                    placeholder="0xx-xxx-xxxx"
                    required
                  />
                  {renderValidationMessage('phone')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันเกิด
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('dateOfBirth')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-md transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังบันทึกข้อมูล...</span>
                  </div>
                ) : (
                  'บันทึกข้อมูลผู้ป่วย'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPatientForm;
