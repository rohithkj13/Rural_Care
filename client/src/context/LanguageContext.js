import React, { createContext, useState } from 'react';

export const LanguageContext = createContext();

const translations = {
  en: {
    home: 'Home',
    about: 'About',
    doctors: 'Doctors',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    prescriptions: 'Prescriptions',
    reports: 'Medical Reports',
    profile: 'Profile',
    logout: 'Logout',
    bookAppointment: 'Book Appointment',
    viewDoctors: 'View Doctors',
    uploadReport: 'Upload Report',
    consultations: 'Consultations',
    notifications: 'Notifications'
  },
  hi: {
    home: 'होम',
    about: 'के बारे में',
    doctors: 'डॉक्टर',
    contact: 'संपर्क',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    dashboard: 'डैशबोर्ड',
    appointments: 'अपॉइंटमेंट',
    prescriptions: 'प्रिस्क्रिप्शन',
    reports: 'मेडिकल रिपोर्ट',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉगआउट',
    bookAppointment: 'अपॉइंटमेंट बुक करें',
    viewDoctors: 'डॉक्टर देखें',
    uploadReport: 'रिपोर्ट अपलोड करें',
    consultations: 'परामर्श',
    notifications: 'सूचनाएं'
  },
  ta: {
    home: 'முகப்பு',
    about: 'பற்றி',
    doctors: 'மருத்துவர்கள்',
    contact: 'தொடர்பு',
    login: 'உள்நுழைய',
    register: 'பதிவு',
    dashboard: 'டாஷ்போர்டு',
    appointments: 'சந்திப்புகள்',
    prescriptions: 'மருந்துச்சீட்டுகள்',
    reports: 'மருத்துவ அறிக்கைகள்',
    profile: 'சுயவிவரம்',
    logout: 'வெளியேறு',
    bookAppointment: 'சந்திப்பு பதிவு',
    viewDoctors: 'மருத்துவர்களைக் காண்க',
    uploadReport: 'அறிக்கை பதிவேற்று',
    consultations: 'ஆலோசனைகள்',
    notifications: 'அறிவிப்புகள்'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
