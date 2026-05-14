# 📸 Instagram Profile Saver - Chrome Extension

Save Instagram profile data (followers, bio, posts) directly to an Excel/CSV file with one click.

---

## ✅ Features
- **Save button** injected on every Instagram profile page
- **Optional fields**: Custom Name, Category, Notes
- Captures: Username, Full Name, Bio, Posts, Followers, Following
- Downloads all saved profiles as a **CSV file** (opens in Excel)
- **Popup panel** to view saved profiles and re-export anytime

---

## 🚀 How to Install (Chrome)

1. **Download** and unzip this folder
2. Open Chrome and go to: `chrome://extensions/`
3. Enable **Developer Mode** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Select this folder (`instagram-scraper-extension`)
6. The extension is now installed!

---

## 📖 How to Use

1. Go to any Instagram profile (e.g. `instagram.com/username`)
2. Wait for the page to load — a **"Profile Vault"** button will appear below the profile bio
3. Click it — a modal pops up showing the scraped data
4. Optionally fill in:
   - **Custom Name** (e.g. "John Doe")
   - **Category** (e.g. "Influencer", "Client")
   - **Notes** (any extra info you want to save)
5. Click **"Save to Excel"** — a CSV file downloads automatically

---

## 📊 Excel Columns

| Column | Description |
|--------|-------------|
| Custom Name | Your label for this profile |
| Username | Instagram @handle |
| Full Name | Display name |
| Bio | Profile bio text |
| Posts | Number of posts |
| Followers | Follower count |
| Following | Following count |
| Category | Your custom category |
| Notes | Your custom notes |
| Profile URL | Link to the profile |
| Saved At | Date/time of saving |

---

## ⚠️ Notes

- Works on **public profiles** you can view while logged in
- Instagram changes its HTML structure often — if data isn't captured, the extension may need a selector update
- CSV files open natively in Excel, Google Sheets, or any spreadsheet app

---

## 🔧 Troubleshooting

**Button not appearing?**
- Refresh the page and wait 2-3 seconds
- Make sure you're on a profile URL like `instagram.com/username`

**Stats showing "—"?**
- Instagram may have updated their layout. The bio and username should still capture correctly.
