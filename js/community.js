document.addEventListener("DOMContentLoaded", () => {
  // Tab functionality
  const tabs = document.querySelectorAll(".tab")
  const tabPanes = document.querySelectorAll(".tab-pane")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")

      // Show target tab content
      tabPanes.forEach((pane) => {
        pane.classList.remove("active")
        if (pane.id === target) {
          pane.classList.add("active")
        }
      })
    })
  })

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebar = document.getElementById("sidebar")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active")
    })
  }

  // Post form submission
  const postForm = document.querySelector(".community-card form")
  if (postForm) {
    postForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const textarea = postForm.querySelector("textarea")
      if (textarea.value.trim()) {
        alert("Your post has been submitted!")
        textarea.value = ""
      }
    })
  }

  // Join cluster buttons
  const joinButtons = document.querySelectorAll(".cluster-card .btn-primary")
  joinButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.textContent = "Joined"
      button.disabled = true
      button.classList.add("btn-success")
    })
  })
})
