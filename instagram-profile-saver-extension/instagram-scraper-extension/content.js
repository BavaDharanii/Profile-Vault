// Instagram Profile Saver - Content Script

let saveButtonInjected = false;

// Wait for Instagram to load the profile
function waitForProfile() {
  const observer = new MutationObserver(() => {
    if (isProfilePage()) {
      setTimeout(() => {
        injectSaveButton();
      }, 1500);
    } else {
      removeSaveButton();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also try on initial load
  setTimeout(() => {
    if (isProfilePage()) injectSaveButton();
  }, 2000);
}

function isProfilePage() {
  const url = window.location.href;
  // Match profile pages but not feed, explore, reels, etc.
  return /https:\/\/www\.instagram\.com\/[^\/]+\/?$/.test(url) ||
         /https:\/\/www\.instagram\.com\/[^\/]+\/$/.test(url);
}

function removeSaveButton() {
  const existing = document.getElementById('ig-saver-btn-wrap');
  if (existing) {
    existing.remove();
    saveButtonInjected = false;
  }
  const modal = document.getElementById('ig-saver-modal');
  if (modal) modal.remove();
}

function injectSaveButton() {
  if (saveButtonInjected) return;
  if (document.getElementById('ig-saver-btn-wrap')) return;

  // Find the profile header section
  const headerSection = findProfileHeader();
  if (!headerSection) {
    setTimeout(injectSaveButton, 1000);
    return;
  }

  const btnWrap = document.createElement('div');
  btnWrap.id = 'ig-saver-btn-wrap';
  btnWrap.innerHTML = `
    <button id="ig-saver-btn" class="ig-saver-button">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Profile Vault
    </button>
  `;

  headerSection.appendChild(btnWrap);
  saveButtonInjected = true;

  document.getElementById('ig-saver-btn').addEventListener('click', () => {
    showModal();
  });
}

function findProfileHeader() {
  // Try multiple selectors as Instagram changes its structure
  const selectors = [
    'header section',
    'main header',
    'article header',
    '[data-testid="user-avatar"]',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      // Go up to find a good parent container
      let parent = el.parentElement;
      for (let i = 0; i < 4; i++) {
        if (parent && parent.tagName !== 'MAIN' && parent.tagName !== 'BODY') {
          parent = parent.parentElement;
        }
      }
      return el.closest('header') || el.parentElement || el;
    }
  }

  // Fallback: find based on URL username match
  const header = document.querySelector('header');
  return header || document.querySelector('main');
}

function scrapeProfileData() {
  const data = {
    username: '',
    fullName: '',
    bio: '',
    followers: '',
    following: '',
    posts: '',
    profileUrl: window.location.href,
    scrapedAt: new Date().toLocaleString()
  };

  // Username from URL
  const urlMatch = window.location.pathname.match(/\/([^\/]+)\/?$/);
  if (urlMatch) data.username = urlMatch[1];

  // Try to get full name
  const nameSelectors = [
    'h1',
    'span[class*="fullName"]',
    'h2',
    'header h1',
    'header h2'
  ];
  for (const sel of nameSelectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim()) {
      data.fullName = el.innerText.trim();
      break;
    }
  }

  // Bio
  const bioSelectors = [
    'div[class*="biography"]',
    'header span[class*="_aa_c"]',
    'span[class*="bio"]',
    'section > div > span'
  ];
  for (const sel of bioSelectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim()) {
      data.bio = el.innerText.trim();
      break;
    }
  }

  // Stats: Posts, Followers, Following
  // Instagram renders these as list items with counts
  const statsList = document.querySelectorAll('ul li, header ul li');
  statsList.forEach((li, index) => {
    const text = li.innerText.trim();
    const numMatch = text.match(/^([\d,KMBkmb\.]+)/);
    const num = numMatch ? numMatch[1] : '';

    const lower = text.toLowerCase();
    if (lower.includes('post')) data.posts = num;
    else if (lower.includes('follower')) data.followers = num;
    else if (lower.includes('following')) data.following = num;
  });

  // Fallback: try finding stats via aria-labels or spans with numbers
  if (!data.followers) {
    const allSpans = document.querySelectorAll('span');
    allSpans.forEach(span => {
      const parent = span.closest('a, li');
      if (!parent) return;
      const parentText = parent.innerText.toLowerCase();
      const val = span.innerText.trim();
      if (parentText.includes('follower') && /[\d,KM]+/.test(val)) data.followers = val;
      if (parentText.includes('following') && /[\d,KM]+/.test(val)) data.following = val;
      if (parentText.includes('post') && /[\d,KM]+/.test(val)) data.posts = val;
    });
  }

  return data;
}

function showModal() {
  // Remove existing modal
  const existing = document.getElementById('ig-saver-modal');
  if (existing) existing.remove();

  const profileData = scrapeProfileData();

  const modal = document.createElement('div');
  modal.id = 'ig-saver-modal';
  modal.innerHTML = `
    <div class="ig-saver-overlay" id="ig-saver-overlay"></div>
    <div class="ig-saver-modal-box">
      <div class="ig-saver-modal-header">
        <div class="ig-saver-modal-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <div>
          <h2 class="ig-saver-title">Save Profile</h2>
          <p class="ig-saver-subtitle">@${profileData.username}</p>
        </div>
        <button class="ig-saver-close" id="ig-saver-close">✕</button>
      </div>

      <div class="ig-saver-preview">
        <div class="ig-saver-stat">
          <span class="ig-saver-stat-label">Posts</span>
          <span class="ig-saver-stat-value">${profileData.posts || '—'}</span>
        </div>
        <div class="ig-saver-stat">
          <span class="ig-saver-stat-label">Followers</span>
          <span class="ig-saver-stat-value">${profileData.followers || '—'}</span>
        </div>
        <div class="ig-saver-stat">
          <span class="ig-saver-stat-label">Following</span>
          <span class="ig-saver-stat-value">${profileData.following || '—'}</span>
        </div>
      </div>

      ${profileData.bio ? `<div class="ig-saver-bio">${profileData.bio}</div>` : ''}

      <div class="ig-saver-form">
        <div class="ig-saver-field">
          <label class="ig-saver-label">Custom Name <span class="ig-optional">(optional)</span></label>
          <input type="text" id="ig-custom-name" class="ig-saver-input" placeholder="e.g. John Doe, Brand Contact...">
        </div>
        <div class="ig-saver-field">
          <label class="ig-saver-label">Category <span class="ig-optional">(optional)</span></label>
          <input type="text" id="ig-custom-category" class="ig-saver-input" placeholder="e.g. Influencer, Client, Lead...">
        </div>
        <div class="ig-saver-field">
          <label class="ig-saver-label">Notes <span class="ig-optional">(optional)</span></label>
          <textarea id="ig-custom-notes" class="ig-saver-textarea" placeholder="Any additional notes..."></textarea>
        </div>
      </div>

      <div class="ig-saver-actions">
        <button class="ig-saver-cancel" id="ig-saver-cancel">Cancel</button>
        <button class="ig-saver-save" id="ig-saver-save">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Save to Excel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  document.getElementById('ig-saver-close').addEventListener('click', closeModal);
  document.getElementById('ig-saver-cancel').addEventListener('click', closeModal);
  document.getElementById('ig-saver-overlay').addEventListener('click', closeModal);

  // Save handler
  document.getElementById('ig-saver-save').addEventListener('click', () => {
    const customName = document.getElementById('ig-custom-name').value.trim();
    const category = document.getElementById('ig-custom-category').value.trim();
    const notes = document.getElementById('ig-custom-notes').value.trim();

    const fullData = {
      ...profileData,
      customName,
      category,
      notes
    };

    saveToExcel(fullData);
    closeModal();
    showSuccessToast();
  });
}

function closeModal() {
  const modal = document.getElementById('ig-saver-modal');
  if (modal) {
    modal.classList.add('ig-saver-fade-out');
    setTimeout(() => modal.remove(), 200);
  }
}

function showSuccessToast() {
  const toast = document.createElement('div');
  toast.id = 'ig-saver-toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    Profile saved to Excel!
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('ig-toast-hide');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function saveToExcel(data) {
  // Load saved profiles from chrome.storage, append new one, then export
  chrome.storage.local.get(['igProfiles'], (result) => {
    const profiles = result.igProfiles || [];
    profiles.push(data);
    chrome.storage.local.set({ igProfiles: profiles }, () => {
      downloadAsCSV(profiles);
    });
  });
}

function downloadAsCSV(profiles) {
  const headers = [
    'Custom Name', 'Username', 'Full Name', 'Bio',
    'Posts', 'Followers', 'Following',
    'Category', 'Notes', 'Profile URL', 'Saved At'
  ];

  const rows = profiles.map(p => [
    p.customName || '',
    p.username || '',
    p.fullName || '',
    (p.bio || '').replace(/\n/g, ' '),
    p.posts || '',
    p.followers || '',
    p.following || '',
    p.category || '',
    (p.notes || '').replace(/\n/g, ' '),
    p.profileUrl || '',
    p.scrapedAt || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `instagram_profiles_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Start watching
waitForProfile();
