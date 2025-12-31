import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Landing Page
      "welcome": "Welcome to Satori",
      "tagline": "Your companion for mental wellness and academic success",
      "getStarted": "Get Started",
      "learnMore": "Learn More",
      
      // Auth
      "login": "Log In",
      "signup": "Sign Up",
      "email": "Email",
      "password": "Password",
      "continueWithGoogle": "Continue with Google",
      "or": "or",
      
      // Onboarding
      "letsGetToKnowYou": "Let's get to know you",
      "yourName": "What's your name?",
      "yourAge": "How old are you?",
      "yourGender": "Your gender",
      "yourClass": "Which class are you in?",
      "yourLanguage": "Preferred language",
      "next": "Next",
      "back": "Back",
      "finish": "Finish",
      
      // Dashboard
      "home": "Home",
      "talkToKokoro": "Talk to Kokoro",
      "breathingExercise": "Breathing Exercise",
      "pomodoroTimer": "Focus Timer",
      "moodTracker": "Mood Tracker",
      "journal": "Journal",
      "moodGraph": "Mood History",
      "profile": "Profile",
      "research": "Academic Stress",
      "helpline": "Get Help",
      
      // Kokoro
      "meetKokoro": "Meet Kokoro",
      "kokoroDescription": "Your AI companion, here to listen and support you through your journey.",
      
      // Common
      "save": "Save",
      "cancel": "Cancel",
      "logout": "Logout",
      "settings": "Settings",
    }
  },
  ur: {
    translation: {
      // Landing Page
      "welcome": "ساتوری میں خوش آمدید",
      "tagline": "ذہنی صحت اور تعلیمی کامیابی کے لیے آپ کا ساتھی",
      "getStarted": "شروع کریں",
      "learnMore": "مزید جانیں",
      
      // Auth
      "login": "لاگ ان",
      "signup": "سائن اپ",
      "email": "ای میل",
      "password": "پاس ورڈ",
      "continueWithGoogle": "گوگل کے ساتھ جاری رکھیں",
      "or": "یا",
      
      // Onboarding
      "letsGetToKnowYou": "آئیے آپ کو جانتے ہیں",
      "yourName": "آپ کا نام کیا ہے؟",
      "yourAge": "آپ کی عمر کتنی ہے؟",
      "yourGender": "آپ کی جنس",
      "yourClass": "آپ کس جماعت میں ہیں؟",
      "yourLanguage": "پسندیدہ زبان",
      "next": "اگلا",
      "back": "پیچھے",
      "finish": "ختم کریں",
      
      // Dashboard
      "home": "ہوم",
      "talkToKokoro": "کوکورو سے بات کریں",
      "breathingExercise": "سانس کی مشق",
      "pomodoroTimer": "فوکس ٹائمر",
      "moodTracker": "موڈ ٹریکر",
      "journal": "ڈائری",
      "moodGraph": "موڈ کی تاریخ",
      "profile": "پروفائل",
      "research": "تعلیمی دباؤ",
      "helpline": "مدد حاصل کریں",
      
      // Kokoro
      "meetKokoro": "کوکورو سے ملیں",
      "kokoroDescription": "آپ کا AI ساتھی، آپ کے سفر میں سننے اور مدد کرنے کے لیے یہاں ہے۔",
      
      // Common
      "save": "محفوظ کریں",
      "cancel": "منسوخ کریں",
      "logout": "لاگ آؤٹ",
      "settings": "ترتیبات",
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n