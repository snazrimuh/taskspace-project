export const useTheme = () => {
  const isDark = useState<boolean>('theme-dark', () => false)

  const applyTheme = (dark: boolean) => {
    if (import.meta.client) {
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const initTheme = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark') {
        isDark.value = true
        applyTheme(true)
      } else if (saved === 'light') {
        isDark.value = false
        applyTheme(false)
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isDark.value = true
        applyTheme(true)
      }
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
    if (import.meta.client) {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
  }

  return { isDark, initTheme, toggleTheme }
}
