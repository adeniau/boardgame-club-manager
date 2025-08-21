import { useState } from 'react';
import { MemberCreateRequest, MemberUpdateRequest, Member } from '../types/members';
import { VALIDATION_RULES } from '../constants/validation';

interface UseMemberFormOptions {
  initialData?: Partial<Member>;
  onError?: (error: string) => void;
}

interface MemberFormData {
  name: string;
  firstname: string;
  adress: string;
  postal_code: string;
  city: string;
  email: string;
  birth_date: string;
  phone_number: string;
  discord_tag: string;
  admin: string;
  admin_password: string;
}

interface FormErrors {
  [key: string]: string;
}

export const useMemberForm = (options: UseMemberFormOptions = {}) => {
  const { initialData } = options;

  const [formData, setFormData] = useState<MemberFormData>({
    name: initialData?.name || '',
    firstname: initialData?.firstname || '',
    adress: initialData?.adress || '',
    postal_code: initialData?.postal_code?.toString() || '',
    city: initialData?.city || '',
    email: initialData?.email || '',
    birth_date: initialData?.birth_date || '',
    phone_number: initialData?.phone_number || '',
    discord_tag: initialData?.discord_tag || '',
    admin: initialData?.admin || '0',
    admin_password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof MemberFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation des champs obligatoires
    if (!formData.name.trim()) {
      newErrors.name = VALIDATION_RULES.REQUIRED_FIELDS.MEMBER_NAME;
    }

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'Le prénom est obligatoire';
    }

    if (!formData.email.trim()) {
      newErrors.email = VALIDATION_RULES.REQUIRED_FIELDS.MEMBER_EMAIL;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Veuillez saisir un email valide';
    }

    if (!formData.adress.trim()) {
      newErrors.adress = 'L\'adresse est obligatoire';
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Le code postal est obligatoire';
    } else if (!isValidPostalCode(formData.postal_code)) {
      newErrors.postal_code = 'Le code postal doit contenir 5 chiffres';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est obligatoire';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'La date de naissance est obligatoire';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Le numéro de téléphone est obligatoire';
    } else if (!isValidPhoneNumber(formData.phone_number)) {
      newErrors.phone_number = 'Le numéro de téléphone doit contenir 10 chiffres';
    }

    // Validation du mot de passe admin si admin est coché
    if (formData.admin === '1' && !formData.admin_password.trim()) {
      newErrors.admin_password = 'Le mot de passe admin est obligatoire pour les administrateurs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPostalCode = (postalCode: string): boolean => {
    const postalCodeRegex = /^\d{5}$/;
    return postalCodeRegex.test(postalCode);
  };

  const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const getCreateRequest = (): MemberCreateRequest => {
    const request: MemberCreateRequest = {
      name: formData.name.trim(),
      firstname: formData.firstname.trim(),
      adress: formData.adress.trim(),
      postal_code: parseInt(formData.postal_code),
      city: formData.city.trim(),
      email: formData.email.trim(),
      birth_date: formData.birth_date,
      phone_number: formData.phone_number.replace(/\s/g, ''),
      discord_tag: formData.discord_tag.trim(),
      admin: formData.admin,
    };
    
    if (formData.admin_password.trim()) {
      request.admin_password = formData.admin_password.trim();
    }
    
    return request;
  };

  const getUpdateRequest = (): MemberUpdateRequest => {
    return getCreateRequest();
  };

  const reset = (newData?: Partial<Member>) => {
    setFormData({
      name: newData?.name || '',
      firstname: newData?.firstname || '',
      adress: newData?.adress || '',
      postal_code: newData?.postal_code?.toString() || '',
      city: newData?.city || '',
      email: newData?.email || '',
      birth_date: newData?.birth_date || '',
      phone_number: newData?.phone_number || '',
      discord_tag: newData?.discord_tag || '',
      admin: newData?.admin || '0',
      admin_password: '',
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const hasChanges = (original?: Member): boolean => {
    if (!original) return true;

    return (
      formData.name !== original.name ||
      formData.firstname !== original.firstname ||
      formData.adress !== original.adress ||
      formData.postal_code !== original.postal_code.toString() ||
      formData.city !== original.city ||
      formData.email !== original.email ||
      formData.birth_date !== original.birth_date ||
      formData.phone_number !== original.phone_number ||
      formData.discord_tag !== original.discord_tag ||
      formData.admin !== original.admin ||
      (formData.admin === '1' && formData.admin_password.trim() !== '')
    );
  };

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validateForm,
    getCreateRequest,
    getUpdateRequest,
    reset,
    hasChanges,
  };
};