const dropArea     = document.getElementById('dropArea');
const fileInput    = document.getElementById('fileInput');
const errorBox     = document.getElementById('errorBox');
const progressWrap = document.getElementById('progressWrap');
const progressFill = document.getElementById('progressFill');
const progressPct  = document.getElementById('progressPercent');
const previewGrid  = document.getElementById('previewGrid');
const previewSec   = document.getElementById('previewSection');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Load saved images from localStorage on page load
window.addEventListener('load', loadFromStorage);

// Click to browse
fileInput.addEventListener('change', function() {
  handleFile(this.files[0]);
});

// Drag over — highlight the box
dropArea.addEventListener('dragover', function(e) {
  e.preventDefault();
  dropArea.classList.add('dragover');
});

// Drag leave — remove highlight
dropArea.addEventListener('dragleave', function() {
  dropArea.classList.remove('dragover');
});

// Drop file
dropArea.addEventListener('drop', function(e) {
  e.preventDefault();
  dropArea.classList.remove('dragover');

  // Check if anything was dropped at all
  if (e.dataTransfer.files.length === 0) {
    showError('❌ No file detected! Please drop a file.');
    return;
  }

  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// Main function — handles any file
function handleFile(file) {
  hideError();

  // Check if file exists
  if (!file) return;

  // Check by file extension AND file type both
  const fileName = file.name.toLowerCase();
  const validExtension = fileName.endsWith('.jpg') || 
                         fileName.endsWith('.jpeg') || 
                         fileName.endsWith('.png') || 
                         fileName.endsWith('.gif');

  const validType = ALLOWED_TYPES.includes(file.type);

  if (!validType && !validExtension) {
    showError('❌ Invalid file! Only JPG, PNG, and GIF are allowed. You uploaded: ' + file.name);
    return;
  }

  if (!validExtension) {
    showError('❌ Invalid file! Only JPG, PNG, and GIF are allowed. You uploaded: ' + file.name);
    return;
  }

  // Start progress bar
  simulateProgress(function() {
    // After progress done — read and show the image
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageData = e.target.result;
      addPreview(imageData, file.name);
      saveToStorage(imageData, file.name);
    };
    reader.readAsDataURL(file);
  });
}

// Fake progress bar using setTimeout
function simulateProgress(callback) {
  progressWrap.style.display = 'block';
  progressFill.style.width = '0%';
  progressPct.textContent = '0%';

  let progress = 0;
  const interval = setInterval(function() {
    progress += 10;
    progressFill.style.width = progress + '%';
    progressPct.textContent = progress + '%';

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(function() {
        progressWrap.style.display = 'none';
        callback(); // show preview after progress
      }, 300);
    }
  }, 100); // increases every 100ms
}

// Add image to the preview grid
function addPreview(src, name) {
  previewSec.style.display = 'block';

  const item = document.createElement('div');
  item.className = 'preview-item';

  item.innerHTML = `
    <button class="remove-btn" onclick="removeItem(this, '${name}')">✕</button>
    <img src="${src}" alt="${name}" />
    <div class="file-name">${name}</div>
  `;

  previewGrid.appendChild(item);
}

// Remove single image
function removeItem(btn, name) {
  const item = btn.parentElement;
  item.remove();

  // Remove from localStorage too
  removeFromStorage(name);

  // Hide preview section if no images left
  if (previewGrid.children.length === 0) {
    previewSec.style.display = 'none';
  }
}

// Clear all images
function clearAll() {
  previewGrid.innerHTML = '';
  previewSec.style.display = 'none';
  localStorage.removeItem('uploadedImages');
}

// Save image to localStorage
function saveToStorage(src, name) {
  let images = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
  images.push({ src, name });
  localStorage.setItem('uploadedImages', JSON.stringify(images));
}

// Remove one image from localStorage
function removeFromStorage(name) {
  let images = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
  images = images.filter(img => img.name !== name);
  localStorage.setItem('uploadedImages', JSON.stringify(images));
}

// Load images from localStorage when page opens
function loadFromStorage() {
  const images = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
  images.forEach(function(img) {
    addPreview(img.src, img.name);
  });
}

// Show error message
function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}

// Hide error message
function hideError() {
  errorBox.style.display = 'none';
}
