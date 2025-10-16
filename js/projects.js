document.addEventListener("DOMContentLoaded", () => {
  // Tab functionality and other common features
  const tabs = document.querySelectorAll(".tab")
  const tabPanes = document.querySelectorAll(".tab-pane")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab

      tabs.forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")

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

  // Project card click handlers
  const projectCards = document.querySelectorAll(".project-card")
  const modal = document.getElementById("project-modal")
  const modalClose = document.getElementById("modal-close")

  projectCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".project-actions")) return

      const projectId = card.dataset.project
      openProjectModal(projectId)
    })
  })

  // Modal functionality
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.classList.remove("active")
    })
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active")
      }
    })
  }

  // Participate buttons
  const participateButtons = document.querySelectorAll('.btn:contains("Participate")')
  participateButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation()
      alert("Thank you for your interest! You'll be redirected to the participation form.")
    })
  })

  function openProjectModal(projectId) {
    // Sample project data
    const projectData = {
      "rainwater-filter": {
        title: "Community Rainwater Filter",
        image: "https://source.unsplash.com/600x400/?rainwater,filter",
        description:
          "Install a rainwater harvesting system to provide clean water for the community garden. This project will help reduce water waste and provide a sustainable water source for our local plants and vegetables.",
        progress: 65,
        progressText: "26kg / 40kg (65%)",
        contributors: "24 community members",
        timeRemaining: "15 days left",
      },
    }

    const project = projectData[projectId]
    if (!project) return

    document.getElementById("modal-title").textContent = "Project Details"
    document.getElementById("modal-image").src = project.image
    document.getElementById("modal-project-title").textContent = project.title
    document.getElementById("modal-description").textContent = project.description
    document.getElementById("modal-progress").style.width = project.progress + "%"
    document.getElementById("modal-progress-text").textContent = project.progressText
    document.getElementById("modal-contributors").textContent = project.contributors
    document.getElementById("modal-time").textContent = project.timeRemaining

    modal.classList.add("active")
  }

  // Filter functionality
  const filters = document.querySelectorAll("select")
  filters.forEach((filter) => {
    filter.addEventListener("change", () => {
      // Implement filtering logic here
      console.log("Filter changed:", filter.id, filter.value)
    })
  })

  // Search functionality
  const searchInput = document.getElementById("search")
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      // Implement search logic here
      console.log("Search:", e.target.value)
    })
  }
})
// Projects page functionality

document.addEventListener("DOMContentLoaded", () => {
  // Project data
  const projectsData = {
    "rainwater-filter": {
      title: "Community Rainwater Filter",
      category: "Environment",
      description: "Install a community rainwater harvesting and filtration system for the neighborhood park.",
      goal: "40kg of plastic bottles",
      percentage: 65,
      collected: "26kg",
      remaining: "14kg",
      participants: 23,
      timeLeft: "15 days left",
      image: "https://source.unsplash.com/400x250/?rainwater,filter",
    },
    "solar-lights": {
      title: "Solar Street Lights",
      category: "Energy",
      description: "Install solar-powered LED street lights along the community walking path.",
      goal: "60kg of metal cans",
      percentage: 42,
      collected: "25kg",
      remaining: "35kg",
      participants: 18,
      timeLeft: "22 days left",
      image: "https://source.unsplash.com/400x250/?solar,lights,park",
    },
    "park-benches": {
      title: "Recycled Park Benches",
      category: "Community",
      description: "Create park benches from recycled plastic materials for the community garden.",
      goal: "80kg of mixed plastic",
      percentage: 78,
      collected: "62kg",
      remaining: "18kg",
      participants: 31,
      timeLeft: "8 days left",
      image: "https://source.unsplash.com/400x250/?park,bench,recycled",
    },
    "bike-shelter": {
      title: "Community Bike Shelter",
      category: "Infrastructure",
      description: "Build a covered bike parking area to encourage sustainable transportation.",
      goal: "50kg of cardboard",
      percentage: 15,
      collected: "7.5kg",
      remaining: "42.5kg",
      participants: 9,
      timeLeft: "45 days left",
      image: "https://source.unsplash.com/400x250/?bike,shelter,community",
    },
    "compost-bins": {
      title: "Community Compost Bins",
      category: "Environment",
      description: "Install community composting bins to reduce organic waste and create fertilizer.",
      goal: "30kg of organic waste",
      percentage: 100,
      collected: "30kg",
      remaining: "Goal achieved!",
      participants: 42,
      timeLeft: "Completed",
      image: "https://source.unsplash.com/400x250/?compost,bins,community",
    },
    "water-fountain": {
      title: "Public Water Fountain",
      category: "Infrastructure",
      description: "Install a public water fountain to reduce single-use plastic bottle consumption.",
      goal: "35kg of glass bottles",
      percentage: 28,
      collected: "9.8kg",
      remaining: "25.2kg",
      participants: 14,
      timeLeft: "28 days left",
      image: "https://source.unsplash.com/400x250/?water,fountain,public",
    },
  }

  // Modal elements
  const modal = document.getElementById("projectModal")
  const closeModal = document.getElementById("closeModal")
  const projectCards = document.querySelectorAll(".project-card")

  // Filter elements
  const categoryFilter = document.getElementById("category")
  const statusFilter = document.getElementById("status")
  const materialFilter = document.getElementById("material")
  const searchInput = document.getElementById("search")

  // Open modal when project card is clicked
  projectCards.forEach((card) => {
    card.addEventListener("click", function () {
      const projectId = this.getAttribute("data-project")
      const project = projectsData[projectId]

      if (project) {
        populateModal(project)
        modal.classList.add("active")
        document.body.style.overflow = "hidden"
      }
    })
  })

  // Close modal
  function closeProjectModal() {
    modal.classList.remove("active")
    document.body.style.overflow = "auto"
  }

  closeModal.addEventListener("click", closeProjectModal)

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeProjectModal()
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeProjectModal()
    }
  })

  // Populate modal with project data
  function populateModal(project) {
    document.getElementById("modalTitle").textContent = "Project Details"
    document.getElementById("modalImage").src = project.image
    document.getElementById("modalImage").alt = project.title
    document.getElementById("modalCategory").innerHTML = `<i class="fas fa-tag"></i> ${project.category}`
    document.getElementById("modalProjectTitle").textContent = project.title
    document.getElementById("modalDescription").textContent = project.description
    document.getElementById("modalGoalText").textContent = `Goal: ${project.goal}`
    document.getElementById("modalGoalPercentage").textContent = `${project.percentage}%`
    document.getElementById("modalProgress").style.width = `${project.percentage}%`
    document.getElementById("modalCollected").textContent = `${project.collected} collected`
    document.getElementById("modalRemaining").textContent = `${project.remaining} remaining`
    document.getElementById("modalParticipants").textContent = `${project.participants} participants`
    document.getElementById("modalTimeLeft").textContent = project.timeLeft
  }

  // Modal tabs functionality
  const modalTabs = document.querySelectorAll(".modal-tabs .tab")
  const modalTabPanes = document.querySelectorAll(".modal-tabs .tab-pane")

  modalTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab")

      modalTabs.forEach((t) => t.classList.remove("active"))
      modalTabPanes.forEach((pane) => pane.classList.remove("active"))

      this.classList.add("active")
      document.getElementById(targetTab).classList.add("active")
    })
  })

  // Filter functionality
  function filterProjects() {
    const categoryValue = categoryFilter.value
    const statusValue = statusFilter.value
    const materialValue = materialFilter.value
    const searchValue = searchInput.value.toLowerCase()

    projectCards.forEach((card) => {
      let show = true

      // Category filter
      if (categoryValue !== "all") {
        const cardCategory = card.querySelector(".project-category").textContent.toLowerCase()
        if (!cardCategory.includes(categoryValue)) {
          show = false
        }
      }

      // Status filter
      if (statusValue !== "all") {
        const cardStatus = card.querySelector(".project-status").textContent.toLowerCase()
        if (!cardStatus.includes(statusValue)) {
          show = false
        }
      }

      // Material filter
      if (materialValue !== "all") {
        const cardGoal = card.querySelector(".goal-header span:first-child").textContent.toLowerCase()
        if (!cardGoal.includes(materialValue)) {
          show = false
        }
      }

      // Search filter
      if (searchValue) {
        const cardTitle = card.querySelector(".project-header h3").textContent.toLowerCase()
        const cardDescription = card.querySelector(".project-description").textContent.toLowerCase()
        if (!cardTitle.includes(searchValue) && !cardDescription.includes(searchValue)) {
          show = false
        }
      }

      card.style.display = show ? "block" : "none"
    })
  }

  // Add event listeners for filters
  categoryFilter.addEventListener("change", filterProjects)
  statusFilter.addEventListener("change", filterProjects)
  materialFilter.addEventListener("change", filterProjects)
  searchInput.addEventListener("input", debounce(filterProjects, 300))

  // Participate button functionality
  document.addEventListener("click", (e) => {
    if (e.target.textContent === "Participate" || e.target.closest("button")?.textContent === "Participate") {
      e.preventDefault()
      e.stopPropagation()
      showNotification("Thank you for your interest! You will be contacted with participation details.", "success")
    }

    if (e.target.textContent === "Participate Now" || e.target.closest("button")?.textContent === "Participate Now") {
      e.preventDefault()
      e.stopPropagation()
      showNotification("Thank you for your interest! You will be contacted with participation details.", "success")
    }

    if (
      e.target.closest("button")?.innerHTML.includes("Share") ||
      e.target.closest("button")?.innerHTML.includes("Invite")
    ) {
      e.preventDefault()
      e.stopPropagation()

      if (navigator.share) {
        navigator.share({
          title: "ReCircle Community Project",
          text: "Check out this amazing community project on ReCircle!",
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
          showNotification("Project link copied to clipboard!", "success")
        })
      }
    }
  })

  // Suggest project functionality
  document.querySelector(".btn-outline").addEventListener("click", () => {
    showNotification("Project suggestion form will be available soon!", "info")
  })

  // Create project functionality
  document.querySelector(".btn-primary").addEventListener("click", () => {
    showNotification("Project creation form will be available soon!", "info")
  })

  // Add loading animation to project cards
  projectCards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"

    setTimeout(() => {
      card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
    }, index * 100)
  })

  function debounce(func, delay) {
    let timeout
    return function (...args) {
      
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), delay)
    }
  }

  function showNotification(message, type) {
    const notification = document.createElement("div")
    notification.classList.add("notification", type)
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("show")
    }, 10)

    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }
})
