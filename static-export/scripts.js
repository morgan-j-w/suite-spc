/* Preference Centre - Static HTML/CSS/JS Export */

// Theme Management
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('preference-centre-theme', theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('preference-centre-theme') || 'blue';
  setTheme(savedTheme);
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = savedTheme;
  }
}

// Form Validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateRequired(value) {
  return value && value.trim().length > 0;
}

// Checkbox/Radio Item Toggle
function setupCheckboxItems() {
  document.querySelectorAll('.checkbox-item').forEach(item => {
    const checkbox = item.querySelector('.checkbox-input');
    
    item.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      item.classList.toggle('checked', checkbox.checked);
    });
    
    // Initialize state
    item.classList.toggle('checked', checkbox.checked);
  });
}

function setupRadioItems() {
  document.querySelectorAll('.radio-group').forEach(group => {
    const items = group.querySelectorAll('.radio-item');
    
    items.forEach(item => {
      const radio = item.querySelector('.radio-input');
      
      item.addEventListener('click', (e) => {
        if (e.target !== radio) {
          radio.checked = true;
        }
        // Update all items in group
        items.forEach(i => i.classList.remove('checked'));
        item.classList.add('checked');
      });
      
      // Initialize state
      item.classList.toggle('checked', radio.checked);
    });
  });
}

// Subscribe Form
function setupSubscribeForm() {
  const form = document.getElementById('subscribe-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Get form data
    const formData = new FormData(form);
    const data = {
      profile: {
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone') || '',
        company: formData.get('company') || '',
        jobTitle: formData.get('jobTitle') || '',
      },
      preferences: {
        newsletterTopics: formData.getAll('newsletterTopics'),
        communicationTypes: formData.getAll('communicationTypes'),
        frequency: formData.get('frequency') || 'weekly',
        customGroups: formData.getAll('customGroups'),
      }
    };
    
    // Validation
    if (!validateEmail(data.profile.email)) {
      showAlert('Please enter a valid email address.', 'error');
      return;
    }
    
    if (!validateRequired(data.profile.firstName) || !validateRequired(data.profile.lastName)) {
      showAlert('Please enter your first and last name.', 'error');
      return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Subscribing...';
    
    try {
      // Simulate API call (replace with actual endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock token
      const token = 'sub_' + Math.random().toString(36).substring(2, 15);
      
      // Store in localStorage for demo
      localStorage.setItem('subscriber-token', token);
      localStorage.setItem('subscriber-data', JSON.stringify(data));
      
      // Redirect to success page
      window.location.href = `success.html?token=${token}`;
    } catch (error) {
      showAlert('Something went wrong. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Manage Preferences Form
function setupManagePreferencesForm() {
  const form = document.getElementById('manage-preferences-form');
  if (!form) return;
  
  // Load existing data
  const savedData = localStorage.getItem('subscriber-data');
  if (savedData) {
    const data = JSON.parse(savedData);
    
    // Populate profile fields
    Object.entries(data.profile).forEach(([key, value]) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = value;
    });
    
    // Populate checkboxes
    data.preferences.newsletterTopics.forEach(topic => {
      const checkbox = form.querySelector(`[name="newsletterTopics"][value="${topic}"]`);
      if (checkbox) {
        checkbox.checked = true;
        checkbox.closest('.checkbox-item')?.classList.add('checked');
      }
    });
    
    data.preferences.communicationTypes.forEach(type => {
      const checkbox = form.querySelector(`[name="communicationTypes"][value="${type}"]`);
      if (checkbox) {
        checkbox.checked = true;
        checkbox.closest('.checkbox-item')?.classList.add('checked');
      }
    });
    
    // Populate radio
    const frequencyRadio = form.querySelector(`[name="frequency"][value="${data.preferences.frequency}"]`);
    if (frequencyRadio) {
      frequencyRadio.checked = true;
      frequencyRadio.closest('.radio-item')?.classList.add('checked');
    }
    
    data.preferences.customGroups.forEach(group => {
      const checkbox = form.querySelector(`[name="customGroups"][value="${group}"]`);
      if (checkbox) {
        checkbox.checked = true;
        checkbox.closest('.checkbox-item')?.classList.add('checked');
      }
    });
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Get form data
    const formData = new FormData(form);
    const data = {
      profile: {
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone') || '',
        company: formData.get('company') || '',
        jobTitle: formData.get('jobTitle') || '',
      },
      preferences: {
        newsletterTopics: formData.getAll('newsletterTopics'),
        communicationTypes: formData.getAll('communicationTypes'),
        frequency: formData.get('frequency') || 'weekly',
        customGroups: formData.getAll('customGroups'),
      }
    };
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for demo
      localStorage.setItem('subscriber-data', JSON.stringify(data));
      
      showAlert('Your preferences have been saved successfully!', 'success');
    } catch (error) {
      showAlert('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Unsubscribe Form
function setupUnsubscribeForm() {
  const form = document.getElementById('unsubscribe-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const confirmCheckbox = form.querySelector('#confirm-unsubscribe');
    if (!confirmCheckbox.checked) {
      showAlert('Please confirm that you want to unsubscribe.', 'error');
      return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Unsubscribing...';
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success state
      document.getElementById('unsubscribe-form-container').classList.add('hidden');
      document.getElementById('unsubscribe-success').classList.remove('hidden');
    } catch (error) {
      showAlert('Something went wrong. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Alert/Message Display
function showAlert(message, type = 'success') {
  // Remove existing alerts
  document.querySelectorAll('.alert').forEach(el => el.remove());
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      ${type === 'success' 
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
      }
    </svg>
    <span>${message}</span>
  `;
  
  const form = document.querySelector('form') || document.querySelector('.container');
  form.insertBefore(alert, form.firstChild);
  
  // Auto-remove after 5 seconds
  setTimeout(() => alert.remove(), 5000);
}

// Success Page Setup
function setupSuccessPage() {
  const tokenDisplay = document.getElementById('preferences-url');
  if (!tokenDisplay) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || localStorage.getItem('subscriber-token');
  
  if (token) {
    const preferencesUrl = `${window.location.origin}/preferences.html?token=${token}`;
    tokenDisplay.textContent = preferencesUrl;
    
    // Update manage preferences link
    const manageLink = document.getElementById('manage-preferences-link');
    if (manageLink) {
      manageLink.href = `preferences.html?token=${token}`;
    }
  }
  
  // Copy URL button
  const copyBtn = document.getElementById('copy-url-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(tokenDisplay.textContent);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy URL', 2000);
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  
  // Theme selector
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
  }
  
  // Setup interactive elements
  setupCheckboxItems();
  setupRadioItems();
  
  // Setup page-specific forms
  setupSubscribeForm();
  setupManagePreferencesForm();
  setupUnsubscribeForm();
  setupSuccessPage();
});
