'use client';

import { useState, useRef, useEffect } from 'react';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [fieldValidations, setFieldValidations] = useState<Record<string, FieldValidation>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate HN on component mount (as placeholder/suggestion)
  useEffect(() => {
    // Remove auto-generation on mount - let user input manually
  }, []);

  // Auto-calculate age from date of birth
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age >= 0 && age <= 150 && age !== formData.age) {
        setFormData(prev => ({ ...prev, age }));
      }
    }
  }, [formData.dateOfBirth]);

  // Real-time validation functions
  const validateHN = (hn: string): FieldValidation => {
    if (!hn) return { isValid: false, message: 'กรุณากรอก HN', type: 'error' };
    
    const hnPattern = /^HN\d{6}$/;
    if (!hnPattern.test(hn)) {
      return { isValid: false, message: 'รูปแบบ HN ต้องเป็น HNXXXXXX (6 ตัวเลข)', type: 'error' };
    }
    
    return { isValid: true, message: 'รูปแบบ HN ถูกต้อง', type: 'success' };
  };

  const validateFullName = (name: string): FieldValidation => {
    if (!name || name.trim().length === 0) {
      return { isValid: false, message: 'กรุณากรอกชื่อ-นามสกุล', type: 'error' };
    }
    
    if (name.trim().length < 2) {
      return { isValid: false, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร', type: 'error' };
    }
    
    if (name.trim().length > 100) {
      return { isValid: false, message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร', type: 'error' };
    }
    
    // Check for valid Thai/English characters
    const namePattern = /^[ก-๏a-zA-Z\s\.]+$/;
    if (!namePattern.test(name)) {
      return { isValid: false, message: 'ชื่อควรประกอบด้วยตัวอักษรไทยหรืออังกฤษเท่านั้น', type: 'error' };
    }
    
    return { isValid: true, message: 'ชื่อถูกต้อง', type: 'success' };
  };

  const validatePhone = (phone: string): FieldValidation => {
    if (!phone) return { isValid: true, message: '', type: 'warning' };
    
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 9) {
      return { isValid: false, message: 'เบอร์โทรต้องมีอย่างน้อย 9 หลัก', type: 'error' };
    }
    
    if (cleanPhone.length > 12) {
      return { isValid: false, message: 'เบอร์โทรต้องไม่เกิน 12 หลัก', type: 'error' };
    }
    
    // Thai mobile number patterns
    if (cleanPhone.length === 10 && (cleanPhone.startsWith('06') || cleanPhone.startsWith('08') || cleanPhone.startsWith('09'))) {
      return { isValid: true, message: 'เบอร์มือถือถูกต้อง', type: 'success' };
    }
    
    // Thai landline patterns
    if (cleanPhone.length === 9 && cleanPhone.startsWith('0')) {
      return { isValid: true, message: 'เบอร์บ้านถูกต้อง', type: 'success' };
    }
    
    return { isValid: false, message: 'รูปแบบเบอร์โทรไม่ถูกต้อง', type: 'error' };
  };

  const validateAge = (age: number): FieldValidation => {
    if (!age || age === 0) {
      return { isValid: false, message: 'กรุณากรอกอายุ', type: 'error' };
    }
    
    if (age < 0) {
      return { isValid: false, message: 'อายุต้องเป็นจำนวนบวก', type: 'error' };
    }
    
    if (age > 150) {
      return { isValid: false, message: 'อายุต้องไม่เกิน 150 ปี', type: 'error' };
    }
    
    if (age > 100) {
      return { isValid: true, message: 'โปรดตรวจสอบอายุให้ถูกต้อง', type: 'warning' };
    }
    
    return { isValid: true, message: 'อายุถูกต้อง', type: 'success' };
  };

  const validateDateOfBirth = (date: string): FieldValidation => {
    if (!date) return { isValid: true, message: '', type: 'warning' };
    
    const birthDate = new Date(date);
    const today = new Date();
    
    if (birthDate > today) {
      return { isValid: false, message: 'วันเกิดต้องไม่เกินวันปัจจุบัน', type: 'error' };
    }
    
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > 150) {
      return { isValid: false, message: 'วันเกิดไม่สมเหตุสมผล', type: 'error' };
    }
    
    return { isValid: true, message: 'วันเกิดถูกต้อง', type: 'success' };
  };

  // Real-time validation on field change
  const validateField = (fieldName: string, value: any) => {
    let validation: FieldValidation;
    
    switch (fieldName) {
      case 'hn':
        validation = validateHN(value);
        break;
      case 'fullName':
        validation = validateFullName(value);
        break;
      case 'phone':
        validation = validatePhone(value);
        break;
      case 'age':
        validation = validateAge(value);
        break;
      case 'dateOfBirth':
        validation = validateDateOfBirth(value);
        break;
      default:
        validation = { isValid: true, message: '', type: 'success' };
    }
    
    setFieldValidations(prev => ({
      ...prev,
      [fieldName]: validation
    }));
    
    return validation;
  };

  // Auto-format HN with leading zeros
  const formatHN = (input: string): string => {
    // Remove all non-digit characters except HN prefix
    let cleaned = input.toUpperCase().replace(/[^HN0-9]/g, '');
    
    // If user types numbers first, add HN prefix
    if (cleaned && /^\d/.test(cleaned)) {
      cleaned = 'HN' + cleaned;
    }
    
    // Handle HN prefix
    if (cleaned.startsWith('HN')) {
      const numberPart = cleaned.substring(2);
      
      // Limit to 6 digits
      if (numberPart.length > 6) {
        return 'HN' + numberPart.substring(0, 6);
      }
      
      return 'HN' + numberPart;
    }
    
    return cleaned;
  };

  // Add leading zeros to HN
  const addLeadingZeros = (hn: string): string => {
    if (!hn || !hn.startsWith('HN')) return hn;
    
    const numberPart = hn.substring(2);
    if (numberPart.length > 0 && numberPart.length < 6) {
      return 'HN' + numberPart.padStart(6, '0');
    }
    
    return hn;
  };

  // Auto-format phone number
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

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
    
    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    if (name === 'titlePrefix') {
      // Auto-select gender when title prefix changes
      const autoGender = getGenderFromPrefix(value);
      setFormData(prev => ({
        ...prev,
        titlePrefix: value,
        gender: autoGender,
        fullName: value ? `${value}${prev.fullName.replace(/^(นาย|นาง|นางสาว)/, '')}` : prev.fullName.replace(/^(นาย|นาง|นางสาว)/, '')
      }));
      
      // Validate gender field
      if (autoGender) {
        validateField('gender', autoGender);
      }
    } else if (name === 'phone') {
      // Auto-format phone number
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, phone: formattedPhone }));
      validateField(name, formattedPhone);
    } else if (name === 'hn') {
      // Improved HN input with smart formatting
      const formattedHN = formatHN(value);
      setFormData(prev => ({ ...prev, hn: formattedHN }));
      validateField(name, formattedHN);
    } else if (name === 'fullName') {
      // Clean and validate name
      const cleanName = value.replace(/[^ก-๏a-zA-Z\s\.]/g, '');
      setFormData(prev => ({
        ...prev,
        fullName: prev.titlePrefix ? `${prev.titlePrefix}${cleanName}` : cleanName
      }));
      validateField(name, cleanName);
    } else if (name === 'age') {
      const ageValue = parseInt(value) || 0;
      setFormData(prev => ({ ...prev, age: ageValue }));
      validateField(name, ageValue);
      
      // Auto-suggest birth year if age is provided
      if (ageValue > 0 && ageValue <= 150 && !formData.dateOfBirth) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - ageValue;
        const suggestedDate = `${birthYear}-01-01`;
        setFormData(prev => ({ ...prev, dateOfBirth: suggestedDate }));
      }
    } else if (name === 'dateOfBirth') {
      setFormData(prev => ({ ...prev, dateOfBirth: value }));
      validateField(name, value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      validateField(name, value);
    }
  };

  // Handle field blur for additional validation
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    
    if (fieldName === 'hn') {
      if (formData.hn) {
        // Add leading zeros when user finishes typing
        const paddedHN = addLeadingZeros(formData.hn);
        if (paddedHN !== formData.hn) {
          setFormData(prev => ({ ...prev, hn: paddedHN }));
          validateField('hn', paddedHN);
        }
      }
    } else if (fieldName === 'fullName' && formData.fullName) {
      // Auto-suggest nickname from first name
      const nameWithoutPrefix = formData.fullName.replace(/^(นาย|นาง|นางสาว)/, '').trim();
      const firstName = nameWithoutPrefix.split(' ')[0];
      if (firstName && !formData.nickname) {
        setFormData(prev => ({ ...prev, nickname: firstName }));
      }
    }
  };

  // Get field validation styling
  const getFieldValidationClass = (fieldName: string): string => {
    const validation = fieldValidations[fieldName];
    const isTouched = touchedFields[fieldName];
    
    if (!validation || !isTouched) {
      return 'border-gray-200 focus:ring-blue-500 focus:border-transparent';
    }
    
    switch (validation.type) {
      case 'error':
        return 'border-red-300 focus:ring-red-500 focus:border-transparent';
      case 'warning':
        return 'border-yellow-300 focus:ring-yellow-500 focus:border-transparent';
      case 'success':
        return 'border-green-300 focus:ring-green-500 focus:border-transparent';
      default:
        return 'border-gray-200 focus:ring-blue-500 focus:border-transparent';
    }
  };

  // Render validation message
  const renderValidationMessage = (fieldName: string) => {
    const validation = fieldValidations[fieldName];
    const isTouched = touchedFields[fieldName];
    
    if (!validation || !isTouched || !validation.message) return null;
    
    const colorClass = {
      error: 'text-red-600',
      warning: 'text-yellow-600', 
      success: 'text-green-600'
    }[validation.type];
    
    const iconClass = {
      error: '',
      warning: '',
      success: ''
    }[validation.type];
    
    return (
      <p className={`text-xs mt-1 px-2 flex items-center gap-1 ${colorClass}`}>
        {validation.message}
      </p>
    );
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

    // Validate all fields before submitting
    const validationResults = {
      hn: validateHN(formData.hn),
      fullName: validateFullName(formData.fullName.replace(/^(นาย|นาง|นางสาว)/, '')),
      phone: validatePhone(formData.phone),
      age: validateAge(formData.age),
      dateOfBirth: validateDateOfBirth(formData.dateOfBirth)
    };

    // Check if any required fields are invalid
    const hasErrors = Object.values(validationResults).some(result => !result.isValid);
    
    if (hasErrors) {
      setError('กรุณาแก้ไขข้อมูลที่ไม่ถูกต้องก่อนบันทึก');
      setIsSubmitting(false);
      
      // Mark all fields as touched to show validation messages
      const allFields = ['hn', 'titlePrefix', 'fullName', 'gender', 'phone', 'age', 'dateOfBirth'];
      setTouchedFields(prev => {
        const newTouched = { ...prev };
        allFields.forEach(field => { newTouched[field] = true; });
        return newTouched;
      });
      
      return;
    }

    try {
      // Use the HN as provided (no auto-generation)
      const submitData = {
        ...formData,
        fullName: formData.titlePrefix ? `${formData.titlePrefix}${formData.fullName.replace(/^(นาย|นาง|นางสาว)/, '')}` : formData.fullName,
        phone: formData.phone.replace(/\D/g, '') // Clean phone number for backend
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
      setValidationErrors({});
      setFieldValidations({});
      setTouchedFields({});
      
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
    <div className="space-y-8">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-r-xl shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-green-700 text-sm font-medium">เพิ่มข้อมูลผู้ป่วยเรียบร้อยแล้ว!</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Header */}
          <div className="text-center pb-4 border-b border-gray-100">
            <h2 className="text-xl font-medium text-gray-800">เพิ่มผู้ป่วยใหม่</h2>
          </div>

          {/* Photo and HN Section */}
          <div className="flex gap-6 items-start bg-gray-50 p-4 rounded-lg">
            {/* Photo Upload */}
            <div className="flex-shrink-0">
              <div className="relative">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="รูปผู้ป่วย"
                      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 bg-white"
                  >
                    <div className="text-center text-gray-400">
                      <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">รูปถ่าย</span>
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

              {/* HN Field - Top Right */}
            {/* HN Field */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเลข HN *
              </label>
              <input
                type="text"
                name="hn"
                value={formData.hn}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('hn')}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${getFieldValidationClass('hn')}`}
                placeholder="ระบุหมายเลข HN"
                maxLength={6}
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
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">ข้อมูลส่วนตัว</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    คำนำหน้า *
                    <span className="text-xs text-emerald-600 ml-2 font-normal">(เลือกเพศอัตโนมัติ)</span>
                  </label>
                  <select
                    name="titlePrefix"
                    value={formData.titlePrefix}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('titlePrefix')}
                    required
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm text-gray-700 ${getFieldValidationClass('titlePrefix')}`}
                  >
                    <option value="">เลือกคำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    เพศ *
                    {formData.titlePrefix && (
                      <span className="text-xs text-emerald-600 ml-2 font-normal">(เลือกอัตโนมัติ)</span>
                    )}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('gender')}
                    required
                    disabled={!!formData.titlePrefix}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-sm text-gray-700 ${
                      formData.titlePrefix ? 'bg-emerald-50 border-emerald-200' : 'bg-white'
                    } ${getFieldValidationClass('gender')}`}
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                  {formData.titlePrefix && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="text-emerald-500">✨</span>
                      <span className="text-xs text-emerald-700 font-medium">เลือกอัตโนมัติจากคำนำหน้า</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  📝 ชื่อ-นามสกุล *
                  <span className="text-xs text-gray-500 ml-2 font-normal">(ภาษาไทยหรืออังกฤษ)</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName.replace(/^(นาย|นาง|นางสาว)/, '')}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('fullName')}
                  required
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm text-gray-700 ${getFieldValidationClass('fullName')}`}
                  placeholder="กรอกชื่อ-นามสกุล"
                  maxLength={100}
                />
                {renderValidationMessage('fullName')}
                {formData.titlePrefix && formData.fullName.replace(/^(นาย|นาง|นางสาว)/, '') && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-sm font-medium text-blue-700">ชื่อเต็ม:</span>
                    <span className="text-sm text-blue-900 font-semibold">{formData.titlePrefix}{formData.fullName.replace(/^(นาย|นาง|นางสาว)/, '')}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    อายุ *
                    <span className="text-xs text-gray-500 ml-2 font-normal">(0-150 ปี)</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('age')}
                    required
                    min="0"
                    max="150"
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm text-gray-700 ${getFieldValidationClass('age')}`}
                    placeholder="อายุ"
                  />
                  {renderValidationMessage('age')}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    😊 ชื่อเล่น
                    <span className="text-xs text-amber-600 ml-2 font-normal">(แนะนำอัตโนมัติ)</span>
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('nickname')}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm text-gray-700 ${getFieldValidationClass('nickname')}`}
                    placeholder="ชื่อเล่น"
                    maxLength={50}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">ข้อมูลติดต่อ</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  เบอร์โทรศัพท์
                  <span className="text-xs text-emerald-600 ml-2 font-normal">(จัดรูปแบบอัตโนมัติ)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('phone')}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm text-gray-700 ${getFieldValidationClass('phone')}`}
                  placeholder="0xx-xxx-xxxx"
                  maxLength={12}
                />
                {renderValidationMessage('phone')}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  วันเกิด
                  <span className="text-xs text-amber-600 ml-2 font-normal">(คำนวณอายุอัตโนมัติ)</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('dateOfBirth')}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm text-gray-700 ${getFieldValidationClass('dateOfBirth')}`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {renderValidationMessage('dateOfBirth')}
                {formData.dateOfBirth && formData.age > 0 && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-sm font-medium text-amber-700">อายุที่คำนวณได้:</span>
                    <span className="text-sm text-amber-900 font-bold">{formData.age} ปี</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Validation Summary */}
          {Object.keys(touchedFields).length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 bg-gray-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-800">สถานะการกรอกข้อมูล</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(fieldValidations).map(([field, validation]) => {
                  if (!touchedFields[field]) return null;
                  
                  const fieldNames: Record<string, string> = {
                    hn: 'HN',
                    titlePrefix: 'คำนำหน้า',
                    fullName: 'ชื่อ-นามสกุล',
                    gender: 'เพศ',
                    age: 'อายุ',
                    phone: 'เบอร์โทร',
                    dateOfBirth: 'วันเกิด',
                    nickname: 'ชื่อเล่น'
                  };
                  
                  const statusConfig = {
                    error: { icon: '', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                    warning: { icon: '', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                    success: { icon: '', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
                  }[validation.type];
                  
                  return (
                    <div key={field} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.border}`}>
                      <span className={`text-sm font-medium ${statusConfig.color}`}>{fieldNames[field]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || Object.values(fieldValidations).some(v => !v.isValid)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg">กำลังบันทึกข้อมูล...</span>
                </div>
              ) : Object.values(fieldValidations).some(v => !v.isValid) ? (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-lg">กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-lg">บันทึกข้อมูลผู้ป่วย</span>
                </div>
              )}
            </button>
            
            {/* Quick help text */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700 font-medium">
                  เคล็ดลับ: ระบบจะช่วยกรอกข้อมูลอัตโนมัติเมื่อคุณเลือกคำนำหน้าและกรอกอายุ
                </p>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddPatientForm;
