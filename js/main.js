document.addEventListener("DOMContentLoaded", () => {
  // Set current year in footer
  const yearElement = document.getElementById("current-year")
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear()
  }

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle")
  const mobileMenu = document.getElementById("mobile-menu")

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("active")

      // Toggle icon between bars and X
      const icon = menuToggle.querySelector("i")
      if (icon) {
        if (icon.classList.contains("fa-bars")) {
          icon.classList.remove("fa-bars")
          icon.classList.add("fa-times")
        } else {
          icon.classList.remove("fa-times")
          icon.classList.add("fa-bars")
        }
      }
    })
  }

  // Close mobile menu when clicking on a link
  const mobileLinks = document.querySelectorAll(".mobile-link")
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileMenu) {
        mobileMenu.classList.remove("active")
      }
    })
  })

  // Handle URL parameters for tabs
  const urlParams = new URLSearchParams(window.location.search)
  const tabParam = urlParams.get("tab")

  if (tabParam) {
    const tabToActivate = document.querySelector(`.auth-tab[data-tab="${tabParam}"]`)
    if (tabToActivate) {
      const authTabs = document.querySelectorAll(".auth-tab")
      const authForms = document.querySelectorAll(".auth-form")

      authTabs.forEach((tab) => tab.classList.remove("active"))
      authForms.forEach((form) => form.classList.remove("active"))

      tabToActivate.classList.add("active")
      document.getElementById(`${tabParam}-form`).classList.add("active")
    }
  }
})

// Main JavaScript file for common functionality

// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger")
  const navMenu = document.getElementById("nav-menu")
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebar = document.getElementById("sidebar")

  // Mobile navigation toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      hamburger.classList.toggle("active")
    })
  }

  // Sidebar toggle for dashboard
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }

  // Tab functionality
  const tabs = document.querySelectorAll(".tab")
  const tabPanes = document.querySelectorAll(".tab-pane")

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab")

      // Remove active class from all tabs and panes
      tabs.forEach((t) => t.classList.remove("active"))
      tabPanes.forEach((pane) => pane.classList.remove("active"))

      // Add active class to clicked tab
      this.classList.add("active")

      // Show corresponding pane
      const targetPane = document.getElementById(targetTab)
      if (targetPane) {
        targetPane.classList.add("active")
      }
    })
  })

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href")
      if (href === "#") return

      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (sidebar && sidebar.classList.contains("open")) {
      if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove("open")
      }
    }
  })

  // Form validation helper
  function validateForm(form) {
    const inputs = form.querySelectorAll("input[required], select[required], textarea[required]")
    let isValid = true

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        input.classList.add("error")
        isValid = false
      } else {
        input.classList.remove("error")
      }
    })

    return isValid
  }

  // Add form validation to all forms
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      if (!validateForm(this)) {
        e.preventDefault()
      }
    })
  })

  // Notification system
  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.textContent = message

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `

    // Set background color based on type
    switch (type) {
      case "success":
        notification.style.backgroundColor = "#22c55e"
        break
      case "error":
        notification.style.backgroundColor = "#ef4444"
        break
      case "warning":
        notification.style.backgroundColor = "#f59e0b"
        break
      default:
        notification.style.backgroundColor = "#3b82f6"
    }

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  // Make showNotification globally available
  window.showNotification = showNotification

  // Loading state helper
  function setLoadingState(button, isLoading) {
    if (isLoading) {
      button.disabled = true
      button.dataset.originalText = button.textContent
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...'
    } else {
      button.disabled = false
      button.textContent = button.dataset.originalText
    }
  }

  // Make setLoadingState globally available
  window.setLoadingState = setLoadingState

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observe elements with animation classes
  const animatedElements = document.querySelectorAll(".feature-card, .stat-card, .activity-card")
  animatedElements.forEach((el) => observer.observe(el))

  // Add CSS for animations
  const style = document.createElement("style")
  style.textContent = `
    .feature-card, .stat-card, .activity-card {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    .notification {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    input.error, select.error, textarea.error {
      border-color: #ef4444 !important;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
  `
  document.head.appendChild(style)
})

// Utility functions
function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num)
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Make utility functions globally available
window.formatDate = formatDate
window.formatNumber = formatNumber
window.debounce = debounce
