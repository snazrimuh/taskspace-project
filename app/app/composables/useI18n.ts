import { ref, computed } from 'vue'

type Language = 'en' | 'id'

interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

const translations: Translations = {
  en: {
    // Auth layout
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',

    // Login page
    'login.title': 'Sign In',
    'login.subtitle': 'Welcome back! Sign in to your account',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.remember': 'Stay signed in',
    'login.forgot': 'Forgot password?',
    'login.submit': 'Sign In',
    'login.signup': "Don't have an account? Sign Up",
    'login.error.required': 'This field is required',
    'login.error.email': 'Please enter a valid email',
    'login.error.password': 'Password is required',

    // Register page
    'register.title': 'Sign Up',
    'register.subtitle': 'Create a new account',
    'register.name': 'Full Name',
    'register.email': 'Email Address',
    'register.password': 'Password',
    'register.confirm': 'Confirm Password',
    'register.submit': 'Create Account',
    'register.signin': 'Already have an account? Sign In',
    'register.error.required': 'This field is required',
    'register.error.email': 'Please enter a valid email',
    'register.error.password': 'Password must be at least 8 characters',
    'register.error.match': 'Passwords do not match',

    // Forgot Password page
    'forgot.title': 'Forgot Password',
    'forgot.subtitle': 'Enter your email to receive a password reset link',
    'forgot.email': 'Email Address',
    'forgot.submit': 'Send Reset Link',
    'forgot.back': 'Back to Sign In',
    'forgot.success': 'We sent a reset link to',
    'forgot.check': 'Check your email for the reset link',
    'forgot.error.required': 'Email is required',
    'forgot.error.email': 'Please enter a valid email',

    // Reset Password page
    'reset.title': 'Reset Password',
    'reset.subtitle': 'Enter your new password',
    'reset.password': 'New Password',
    'reset.confirm': 'Confirm Password',
    'reset.submit': 'Reset Password',
    'reset.signin': 'Back to Sign In',
    'reset.success': 'Password reset successful! You can now sign in.',
    'reset.error.invalid': 'Invalid or missing reset token',
    'reset.error.required': 'This field is required',
    'reset.error.password': 'Password must be at least 8 characters',
    'reset.error.match': 'Passwords do not match',
  },
  id: {
    // Auth layout
    'nav.signin': 'Masuk',
    'nav.signup': 'Daftar',

    // Login page
    'login.title': 'Masuk',
    'login.subtitle': 'Selamat kembali! Masuk ke akun Anda',
    'login.email': 'Alamat Email',
    'login.password': 'Kata Sandi',
    'login.remember': 'Tetap terhubung',
    'login.forgot': 'Lupa kata sandi?',
    'login.submit': 'Masuk',
    'login.signup': 'Belum punya akun? Daftar',
    'login.error.required': 'Bidang ini harus diisi',
    'login.error.email': 'Masukkan email yang valid',
    'login.error.password': 'Kata sandi harus diisi',

    // Register page
    'register.title': 'Daftar',
    'register.subtitle': 'Buat akun baru',
    'register.name': 'Nama Lengkap',
    'register.email': 'Alamat Email',
    'register.password': 'Kata Sandi',
    'register.confirm': 'Konfirmasi Kata Sandi',
    'register.submit': 'Buat Akun',
    'register.signin': 'Sudah punya akun? Masuk',
    'register.error.required': 'Bidang ini harus diisi',
    'register.error.email': 'Masukkan email yang valid',
    'register.error.password': 'Kata sandi minimal 8 karakter',
    'register.error.match': 'Kata sandi tidak cocok',

    // Forgot Password page
    'forgot.title': 'Lupa Kata Sandi',
    'forgot.subtitle': 'Masukkan email Anda untuk menerima tautan reset kata sandi',
    'forgot.email': 'Alamat Email',
    'forgot.submit': 'Kirim Tautan Reset',
    'forgot.back': 'Kembali ke Masuk',
    'forgot.success': 'Kami mengirim tautan reset ke',
    'forgot.check': 'Periksa email Anda untuk tautan reset',
    'forgot.error.required': 'Email harus diisi',
    'forgot.error.email': 'Masukkan email yang valid',

    // Reset Password page
    'reset.title': 'Reset Kata Sandi',
    'reset.subtitle': 'Masukkan kata sandi baru Anda',
    'reset.password': 'Kata Sandi Baru',
    'reset.confirm': 'Konfirmasi Kata Sandi',
    'reset.submit': 'Reset Kata Sandi',
    'reset.signin': 'Kembali ke Masuk',
    'reset.success': 'Kata sandi berhasil direset! Anda sekarang dapat masuk.',
    'reset.error.invalid': 'Token reset tidak valid atau hilang',
    'reset.error.required': 'Bidang ini harus diisi',
    'reset.error.password': 'Kata sandi minimal 8 karakter',
    'reset.error.match': 'Kata sandi tidak cocok',
  }
}

const currentLanguage = ref<Language>(
  typeof window !== 'undefined' 
    ? (localStorage.getItem('locale') as Language) || 'en'
    : 'en'
)

export function useI18n() {
  const t = (key: string): string => {
    return translations[currentLanguage.value]?.[key] || key
  }

  const locale = computed({
    get: () => currentLanguage.value,
    set: (value: Language) => {
      currentLanguage.value = value
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', value)
      }
    }
  })

  const toggleLocale = () => {
    locale.value = locale.value === 'en' ? 'id' : 'en'
  }

  return {
    t,
    locale,
    toggleLocale,
    currentLanguage: computed(() => currentLanguage.value)
  }
}
