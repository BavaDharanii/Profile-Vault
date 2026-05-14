// Popup Script
document.addEventListener('DOMContentLoaded', () => {
  loadProfiles();

  document.getElementById('btn-export').addEventListener('click', exportAll);
  document.getElementById('btn-clear').addEventListener('click', clearAll);
});

function loadProfiles() {
  chrome.storage.local.get(['igProfiles'], (result) => {
    const profiles = result.igProfiles || [];
    document.getElementById('profile-count').textContent = profiles.length;

    const list = document.getElementById('profiles-list');

    if (profiles.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          No profiles saved yet.<br>Visit an Instagram profile to start.
        </div>`;
      return;
    }

    list.innerHTML = '';
    // Show latest first
    [...profiles].reverse().forEach(p => {
      const item = document.createElement('div');
      item.className = 'profile-item';
      item.innerHTML = `
        <div>
          <div class="profile-name">${p.customName || '@' + p.username}</div>
          <div class="profile-sub">@${p.username} ${p.category ? '· ' + p.category : ''}</div>
        </div>
        <div class="profile-followers">${p.followers ? p.followers + ' followers' : ''}</div>
      `;
      list.appendChild(item);
    });
  });
}

function exportAll() {
  chrome.storage.local.get(['igProfiles'], (result) => {
    const profiles = result.igProfiles || [];
    if (profiles.length === 0) {
      alert('No profiles saved yet!');
      return;
    }

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
  });
}

function clearAll() {
  if (confirm('Are you sure you want to delete all saved profiles?')) {
    chrome.storage.local.remove(['igProfiles'], () => {
      loadProfiles();
    });
  }
}
