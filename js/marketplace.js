document.addEventListener("DOMContentLoaded", () => {
  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebar = document.getElementById("sidebar")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active")
    })
  }

  // Item card click handlers
  const itemCards = document.querySelectorAll(".item-card")
  const modal = document.getElementById("item-modal")
  const modalClose = document.getElementById("modal-close")

  itemCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".wishlist-btn")) return

      const itemId = card.dataset.item
      openItemModal(itemId)
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

  // Wishlist functionality
  const wishlistButtons = document.querySelectorAll(".wishlist-btn")
  wishlistButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation()
      button.classList.toggle("active")
      const icon = button.querySelector("i")
      if (button.classList.contains("active")) {
        icon.classList.remove("far")
        icon.classList.add("fas")
      } else {
        icon.classList.remove("fas")
        icon.classList.add("far")
      }
    })
  })

  function openItemModal(itemId) {
    // Sample item data
    const itemData = {
      "vintage-chair": {
        title: "Vintage Wooden Chair",
        image: "https://source.unsplash.com/600x400/?vintage,chair,furniture",
        price: "₹1,200",
        originalPrice: "₹2,500",
        condition: "Good",
        seller: "Sarah Johnson",
      },
    }

    const item = itemData[itemId]
    if (!item) return

    document.getElementById("modal-title").textContent = "Item Details"
    document.getElementById("modal-image").src = item.image
    document.getElementById("modal-item-title").textContent = item.title
    document.getElementById("modal-price").textContent = item.price
    document.getElementById("modal-original-price").textContent = item.originalPrice
    document.getElementById("modal-condition").textContent = item.condition
    document.getElementById("modal-seller-name").textContent = item.seller

    modal.classList.add("active")
  }

  // Filter functionality
  const filters = document.querySelectorAll("select")
  filters.forEach((filter) => {
    filter.addEventListener("change", () => {
      console.log("Filter changed:", filter.id, filter.value)
    })
  })

  // Search functionality
  const searchInput = document.getElementById("search")
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      console.log("Search:", e.target.value)
    })
  }

  // Thumbnail image switching
  const thumbnails = document.querySelectorAll(".image-thumbnails img")
  const mainImage = document.getElementById("modal-image")

  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbnails.forEach((t) => t.classList.remove("active"))
      thumb.classList.add("active")
      if (mainImage) {
        mainImage.src = thumb.src.replace("100x100", "600x400")
      }
    })
  })
})

// Marketplace page functionality

document.addEventListener("DOMContentLoaded", () => {
  // Item data
  const itemsData = {
    "vintage-chair": {
      title: "Vintage Wooden Chair",
      price: "₹150",
      condition: "Upcycled • Like New",
      location: "2.3km away",
      seller: "Sarah J.",
      rating: "4.8",
      image: "https://source.unsplash.com/300x300/?vintage,chair",
      description:
        "Beautiful vintage wooden chair, carefully restored and upcycled. Perfect for adding character to any room. The chair has been sanded, stained, and sealed with eco-friendly finishes.",
      specs: [
        "Material: Solid Oak Wood",
        "Dimensions: 45cm x 50cm x 85cm",
        "Weight: 8kg",
        "Age: Restored from 1960s original",
      ],
      badges: ["upcycled"],
      ecoScore: "9.2",
    },
    laptop: {
      title: "Refurbished Laptop",
      price: "₹2,500",
      condition: "Electronics • Good",
      location: "1.8km away",
      seller: "Mike R.",
      rating: "4.9",
      image: "https://source.unsplash.com/300x300/?laptop,computer",
      description:
        "Fully refurbished laptop in excellent working condition. Perfect for students or remote work. Includes charger and carrying case.",
      specs: ["Processor: Intel i5", "RAM: 8GB", "Storage: 256GB SSD", "Screen: 14 inch Full HD"],
      badges: ["refurbished"],
      ecoScore: "8.5",
    },
    bookshelf: {
      title: "Wooden Bookshelf",
      price: "₹800",
      condition: "Furniture • Good",
      location: "3.1km away",
      seller: "Emma T.",
      rating: "4.7",
      image: "https://source.unsplash.com/300x300/?bookshelf,wood",
      description:
        "Sturdy wooden bookshelf with 5 shelves. Great for organizing books, decorative items, or storage boxes.",
      specs: ["Material: Pine Wood", "Dimensions: 180cm x 80cm x 30cm", "Shelves: 5 adjustable", "Weight: 25kg"],
      badges: [],
      ecoScore: "7.8",
    },
    bicycle: {
      title: "Vintage Bicycle",
      price: "₹1,200",
      condition: "Sports • Like New",
      location: "0.9km away",
      seller: "David C.",
      rating: "5.0",
      image: "https://source.unsplash.com/300x300/?bicycle,vintage",
      description:
        "Beautifully restored vintage bicycle. Perfect for city commuting or leisurely rides. Recently serviced with new tires and chain.",
      specs: ["Frame: Steel vintage frame", "Gears: 3-speed", "Brakes: Hand brakes", "Condition: Fully restored"],
      badges: ["restored"],
      ecoScore: "9.5",
    },
    "plant-pots": {
      title: "Ceramic Plant Pots (Set of 3)",
      price: "Free",
      condition: "Home & Garden • Good",
      location: "1.2km away",
      seller: "Aisha W.",
      rating: "4.6",
      image: "https://source.unsplash.com/300x300/?plant,pots,ceramic",
      description:
        "Set of 3 ceramic plant pots in different sizes. Perfect for indoor plants or herbs. Some minor wear but still functional.",
      specs: ["Material: Ceramic", "Sizes: Small, Medium, Large", "Drainage: Holes included", "Color: Terracotta"],
      badges: ["free"],
      ecoScore: "8.9",
    },
    books: {
      title: "Classic Literature Collection",
      price: "₹300",
      condition: "Books • Good",
      location: "2.7km away",
      seller: "James W.",
      rating: "4.8",
      image: "https://source.unsplash.com/300x300/?books,stack",
      description:
        "Collection of 15 classic literature books including works by Shakespeare, Dickens, and Austen. Some shelf wear but pages are in excellent condition.",
      specs: ["Count: 15 books", "Condition: Good to Very Good", "Language: English", "Era: Classic literature"],
      badges: [],
      ecoScore: "9.8",
    },
    guitar: {
      title: "Acoustic Guitar",
      price: "₹1,800",
      condition: "Musical • Fair",
      location: "4.2km away",
      seller: "Lisa M.",
      rating: "4.5",
      image: "https://source.unsplash.com/300x300/?acoustic,guitar",
      description:
        "Acoustic guitar in fair condition. Some cosmetic wear but sounds great. Perfect for beginners or as a backup instrument.",
      specs: ["Type: Acoustic", "Body: Spruce top", "Strings: Steel", "Includes: Soft case"],
      badges: [],
      ecoScore: "8.2",
    },
    desk: {
      title: "Upcycled Wooden Desk",
      price: "₹950",
      condition: "Furniture • Like New",
      location: "1.5km away",
      seller: "Carlos R.",
      rating: "4.9",
      image: "https://source.unsplash.com/300x300/?desk,wood,office",
      description:
        "Beautifully upcycled wooden desk with modern finish. Features built-in storage and cable management. Perfect for home office.",
      specs: [
        "Material: Reclaimed wood",
        "Dimensions: 120cm x 60cm x 75cm",
        "Features: 2 drawers, cable management",
        "Finish: Modern matte",
      ],
      badges: ["upcycled"],
      ecoScore: "9.1",
    },
  }

  // Modal elements
  const modal = document.getElementById("itemModal")
  const closeModal = document.getElementById("closeModal")
  const itemCards = document.querySelectorAll(".item-card")

  // Filter elements
  const categoryFilter = document.getElementById("category")
  const conditionFilter = document.getElementById("condition")
  const priceFilter = document.getElementById("price")
  const locationFilter = document.getElementById("location")
  const searchInput = document.getElementById("searchInput")

  // Wishlist functionality
  const wishlistBtns = document.querySelectorAll(".wishlist-btn")
  let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")

  // Initialize wishlist buttons
  wishlistBtns.forEach((btn) => {
    const itemId = btn.getAttribute("data-item")
    if (wishlist.includes(itemId)) {
      btn.classList.add("active")
      btn.querySelector("i").classList.remove("far")
      btn.querySelector("i").classList.add("fas")
    }
  })

  // Wishlist button click handler
  wishlistBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault()
      e.stopPropagation()

      const itemId = this.getAttribute("data-item")
      const icon = this.querySelector("i")

      if (this.classList.contains("active")) {
        // Remove from wishlist
        this.classList.remove("active")
        icon.classList.remove("fas")
        icon.classList.add("far")
        wishlist = wishlist.filter((id) => id !== itemId)
        showNotification("Removed from wishlist", "info")
      } else {
        // Add to wishlist
        this.classList.add("active")
        icon.classList.remove("far")
        icon.classList.add("fas")
        wishlist.push(itemId)
        showNotification("Added to wishlist", "success")
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlist))
      updateWishlistCount()
    })
  })

  // Update wishlist count in header
  function updateWishlistCount() {
    const wishlistBtn = document.querySelector(".header-actions .btn-outline")
    if (wishlistBtn) {
      wishlistBtn.innerHTML = `<i class="fas fa-heart"></i> Wishlist (${wishlist.length})`
    }
  }

  updateWishlistCount()

  // Open modal when item card is clicked
  itemCards.forEach((card) => {
    card.addEventListener("click", function () {
      const itemId = this.getAttribute("data-item")
      const item = itemsData[itemId]

      if (item) {
        populateModal(item)
        modal.classList.add("active")
        document.body.style.overflow = "hidden"
      }
    })
  })

  // Close modal
  function closeItemModal() {
    modal.classList.remove("active")
    document.body.style.overflow = "auto"
  }

  closeModal.addEventListener("click", closeItemModal)

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeItemModal()
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeItemModal()
    }
  })

  // Populate modal with item data
  function populateModal(item) {
    document.getElementById("modalTitle").textContent = "Item Details"
    document.getElementById("modalMainImage").src = item.image
    document.getElementById("modalMainImage").alt = item.title
    document.getElementById("modalItemTitle").textContent = item.title
    document.getElementById("modalPrice").textContent = item.price
    document.getElementById("modalCondition").textContent = item.condition
    document.getElementById("modalDescription").textContent = item.description
    document.getElementById("modalSellerName").textContent = item.seller

    // Update badges
    const badgesContainer = document.getElementById("modalBadges")
    badgesContainer.innerHTML = ""

    item.badges.forEach((badge) => {
      const badgeElement = document.createElement("span")
      badgeElement.className = `badge ${badge}`
      badgeElement.textContent = badge.charAt(0).toUpperCase() + badge.slice(1)
      badgesContainer.appendChild(badgeElement)
    })

    const ecoScoreElement = document.createElement("span")
    ecoScoreElement.className = "eco-score"
    ecoScoreElement.textContent = `Eco Score: ${item.ecoScore}`
    badgesContainer.appendChild(ecoScoreElement)

    // Update specifications
    const specsContainer = document.getElementById("modalSpecs")
    specsContainer.innerHTML = ""

    item.specs.forEach((spec) => {
      const li = document.createElement("li")
      li.textContent = spec
      specsContainer.appendChild(li)
    })
  }

  // Thumbnail image switching
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("thumbnail")) {
      const mainImage = document.getElementById("modalMainImage")
      const thumbnails = document.querySelectorAll(".thumbnail")

      thumbnails.forEach((thumb) => thumb.classList.remove("active"))
      e.target.classList.add("active")

      mainImage.src = e.target.src
    }
  })

  // Filter functionality
  function filterItems() {
    const categoryValue = categoryFilter.value
    const conditionValue = conditionFilter.value
    const priceValue = priceFilter.value
    const locationValue = locationFilter.value
    const searchValue = searchInput.value.toLowerCase()

    itemCards.forEach((card) => {
      let show = true

      // Category filter
      if (categoryValue !== "all") {
        const cardCondition = card.querySelector(".item-condition").textContent.toLowerCase()
        if (!cardCondition.includes(categoryValue)) {
          show = false
        }
      }

      // Condition filter
      if (conditionValue !== "all") {
        const cardCondition = card.querySelector(".item-condition").textContent.toLowerCase()
        if (conditionValue === "upcycled") {
          const hasUpcycledBadge = card.querySelector(".badge.upcycled")
          if (!hasUpcycledBadge) {
            show = false
          }
        } else if (!cardCondition.includes(conditionValue)) {
          show = false
        }
      }

      // Price filter
      if (priceValue !== "all") {
        const cardPrice = card.querySelector(".item-price").textContent
        const priceNum = Number.parseInt(cardPrice.replace(/[^\d]/g, "")) || 0

        switch (priceValue) {
          case "free":
            if (cardPrice !== "Free") show = false
            break
          case "0-25":
            if (priceNum > 25 || cardPrice === "Free") show = false
            break
          case "25-100":
            if (priceNum < 25 || priceNum > 100) show = false
            break
          case "100-500":
            if (priceNum < 100 || priceNum > 500) show = false
            break
          case "500+":
            if (priceNum < 500) show = false
            break
        }
      }

      // Search filter
      if (searchValue) {
        const cardTitle = card.querySelector(".item-title").textContent.toLowerCase()
        const cardCondition = card.querySelector(".item-condition").textContent.toLowerCase()
        if (!cardTitle.includes(searchValue) && !cardCondition.includes(searchValue)) {
          show = false
        }
      }

      card.style.display = show ? "block" : "none"
    })
  }

  // Add event listeners for filters
  categoryFilter.addEventListener("change", filterItems)
  conditionFilter.addEventListener("change", filterItems)
  priceFilter.addEventListener("change", filterItems)
  locationFilter.addEventListener("change", filterItems)
  searchInput.addEventListener("input", debounce(filterItems, 300))

  // Contact seller functionality
  document.addEventListener("click", (e) => {
    if (e.target.textContent === "Contact Seller" || e.target.closest("button")?.textContent === "Contact Seller") {
      e.preventDefault()
      e.stopPropagation()
      showNotification("Contact form will open soon! For now, you can reach out through the community page.", "info")
    }

    if (e.target.textContent === "Add to Wishlist" || e.target.closest("button")?.textContent === "Add to Wishlist") {
      e.preventDefault()
      e.stopPropagation()
      showNotification("Added to wishlist!", "success")
    }

    if (e.target.textContent === "Share Item" || e.target.closest("button")?.textContent === "Share Item") {
      e.preventDefault()
      e.stopPropagation()

      if (navigator.share) {
        navigator.share({
          title: "ReCircle Marketplace Item",
          text: "Check out this item on ReCircle Marketplace!",
          url: window.location.href,
        })
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showNotification("Item link copied to clipboard!", "success")
        })
      }
    }
  })

  // List item functionality
  document.querySelector(".header-actions .btn-primary").addEventListener("click", () => {
    showNotification("Item listing form will be available soon!", "info")
  })

  // Wishlist page functionality
  document.querySelector(".header-actions .btn-outline").addEventListener("click", (e) => {
    e.preventDefault()
    showNotification("Wishlist page will be available soon!", "info")
  })

  // Add loading animation to item cards
  itemCards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"

    setTimeout(() => {
      card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
    }, index * 100)
  })
})

function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.classList.add("notification", type)
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add("show")
  }, 100)

  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 3000)
}

function debounce(func, delay) {
  let timeout
  return function (...args) {
    
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), delay)
  }
}
