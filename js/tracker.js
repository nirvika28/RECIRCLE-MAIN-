// Tracker page functionality

document.addEventListener('DOMContentLoaded', () => {
  // Heatmap data (simulated)
  const heatmapData = generateHeatmapData();
  
  // Initialize heatmap
  initializeHeatmap();
  
  // Mark today button functionality
  const markTodayBtn = document.getElementById('markTodayBtn');
  markTodayBtn.addEventListener('click', markToday);
  
  // Education tabs functionality
  initializeEducationTabs();
  
  // Quiz functionality
  initializeQuiz();
  
  // Tooltip functionality
  initializeTooltip();

  function generateHeatmapData() {
    const data = {};
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      // Simulate activity levels (0-4)
      const activity = Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0;
      data[dateStr] = activity;
    }
    
    return data;
  }

  function initializeHeatmap() {
    const heatmapGrid = document.getElementById('heatmapGrid');
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // Calculate the starting Sunday
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Generate 53 weeks * 7 days
    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'heatmap-day';
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const activity = heatmapData[dateStr] || 0;
        
        if (activity > 0) {
          dayElement.classList.add(`level-${activity}`);
        }
        
        dayElement.setAttribute('data-date', dateStr);
        dayElement.setAttribute('data-activity', activity);
        
        // Don't show future dates
        if (currentDate > today) {
          dayElement.style.opacity = '0.3';
        }
        
        heatmapGrid.appendChild(dayElement);
      }
    }
  }

  function markToday() {
    const today = new Date().toISOString().split('T')[0];
    const todayElement = document.querySelector(`[data-date="${today}"]`);
    
    if (todayElement) {
      const currentActivity = Number.parseInt(todayElement.getAttribute('data-activity')) || 0;
      const newActivity = Math.min(currentActivity + 1, 4);
      
      // Update visual
      todayElement.className = 'heatmap-day';
      if (newActivity > 0) {
        todayElement.classList.add(`level-${newActivity}`);
      }
      todayElement.setAttribute('data-activity', newActivity);
      
      // Update data
      heatmapData[today] = newActivity;
      
      // Show success message
      showNotification('Great job! Today marked as completed.', 'success');
      
      // Update stats (simplified)
      updateStats();
    }
  }

  function updateStats() {
    // This would normally update based on real data
    const currentStreakElement = document.querySelector('.stat-card:first-child .stat-value');
    const currentStreak = Number.parseInt(currentStreakElement.textContent) + 1;
    currentStreakElement.textContent = currentStreak;
    
    const totalDaysElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
    const totalDays = Number.parseInt(totalDaysElement.textContent) + 1;
    totalDaysElement.textContent = totalDays;
  }

  function initializeEducationTabs() {
    const tabs = document.querySelectorAll('.education-tabs .tab');
    const tabPanes = document.querySelectorAll('.education-tabs .tab-pane');

    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        
        tabs.forEach(t => t.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
      });
    });

    // Video play functionality
    document.addEventListener('click', (e) => {
      if (e.target.closest('.content-card')) {
        const card = e.target.closest('.content-card');
        const title = card.querySelector('h4').textContent;
        showNotification(`Playing: ${title}`, 'info');
      }
    });

    // Guide read functionality
    document.addEventListener('click', (e) => {
      if (e.target.textContent === 'Read Guide') {
        e.preventDefault();
        const guideTitle = e.target.closest('.guide-item').querySelector('h4').textContent;
        showNotification(`Opening guide: ${guideTitle}`, 'info');
      }
    });
  }

  function initializeQuiz() {
    const quizOptions = document.querySelectorAll('.quiz-option');
    const nextButton = document.querySelector('.quiz-actions .btn');
    
    quizOptions.forEach(option => {
      option.addEventListener('click', function() {
        // Remove selection from other options
        quizOptions.forEach(opt => opt.classList.remove('selected'));
        // Select this option
        this.classList.add('selected');
        // Enable next button
        nextButton.disabled = false;
      });
    });

    nextButton.addEventListener('click', () => {
      const selectedOption = document.querySelector('.quiz-option.selected');
      if (selectedOption) {
        const value = selectedOption.querySelector('input').value;
        if (value === 'b') {
          showNotification('Correct! Organic waste goes in the green bin.', 'success');
        } else {
          showNotification('Not quite right. Organic waste should go in the green bin.', 'error');
        }
        
        // Reset for next question (simplified)
        setTimeout(() => {
          showNotification('Quiz completed! Check back for more questions.', 'info');
        }, 2000);
      }
    });

    // Add CSS for selected state
    const style = document.createElement('style');
    style.textContent = `
      .quiz-option.selected {
        background-color: var(--bg-accent) !important;
        border-left: 4px solid var(--primary-green);
      }
    `;
    document.head.appendChild(style);
  }

  function initializeTooltip() {
    const tooltip = document.getElementById('tooltip');
    const heatmapDays = document.querySelectorAll('.heatmap-day');

    heatmapDays.forEach(day => {
