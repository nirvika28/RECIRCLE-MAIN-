document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  const tabs = document.querySelectorAll(".auth-tab")
  const forms = document.querySelectorAll(".auth-form")
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab")
      tabs.forEach((t) => t.classList.remove("active"))
      forms.forEach((f) => f.classList.remove("active"))
      tab.classList.add("active")
      const targetForm = document.getElementById(`${target}-form`)
      if (targetForm) targetForm.classList.add("active")
      // Update URL ?tab=...
      const url = new URL(window.location.href)
      url.searchParams.set("tab", target)
      window.history.replaceState({}, "", url)
    })
  })

  // Helper: toggle button loading state
  function toggleBtnLoading(btn, isLoading, loadingText) {
    const text = btn.querySelector(".btn-text")
    const loading = btn.querySelector(".btn-loading")
    if (!text || !loading) return
    if (isLoading) {
      text.classList.add("hidden")
      loading.classList.remove("hidden")
      btn.disabled = true
      if (loadingText) {
        const span = loading.querySelector("span")
        if (span) span.innerText = loadingText
      }
    } else {
      text.classList.remove("hidden")
      loading.classList.add("hidden")
      btn.disabled = false
    }
  }

  // Login submit -> splash
  const loginForm = document.getElementById("login-form-element")
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const submitBtn = loginForm.querySelector('button[type="submit"]')
      if (submitBtn) toggleBtnLoading(submitBtn, true, "Logging in...")
      setTimeout(() => {
        window.location.href = "splash.html"
      }, 1200)
    })
  }

  // Signup submit -> splash
  const signupForm = document.getElementById("signup-form-element")
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const submitBtn = signupForm.querySelector('button[type="submit"]')
      if (submitBtn) toggleBtnLoading(submitBtn, true, "Creating account...")
      setTimeout(() => {
        window.location.href = "splash.html"
      }, 1400)
    })
  }
})
