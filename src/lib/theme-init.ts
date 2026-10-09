// Theme initialization script - runs before React hydration to avoid flash
// This replaces the inline script in index.html to avoid CSP issues

function applyTheme(t: string) {
  try {
    const d = document.documentElement
    if (t === 'system') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    d.classList.remove('light', 'dark')
    if (t === 'dark' || t === 'light') {
      d.style.colorScheme = t
      d.classList.add(t)
    }
  } catch {
    // Ignore localStorage errors (private browsing, etc.)
  }
}

// Run immediately
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'light' || savedTheme === 'dark') {
  applyTheme(savedTheme)
} else {
  // system default
  applyTheme('system')
}

// Export for potential future use
export { applyTheme }