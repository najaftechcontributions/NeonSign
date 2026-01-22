# ⚡ Quick Start - Get Your App on Android in 15 Minutes

Follow these steps to install your Neon Sign Generator on Android:

## ✅ Pre-Flight Checklist

- [ ] XAMPP/WAMP/MAMP installed and running
- [ ] Database created and schema imported
- [ ] App works at `http://localhost/neon-sign-generator/`

---

## 🚀 Option 1: Test Locally (Fastest - 5 Minutes)

### Step 1: Create Icons (2 minutes)
1. Go to: https://www.pwabuilder.com/imageGenerator
2. Upload any 512x512 image (or create a simple one)
3. Download the icon pack
4. Create folder `/pwa-icons/` in your project
5. Extract all PNG files to this folder

### Step 2: Enable Local Access (1 minute)
1. Find your computer's IP address:
   - **Windows:** Open CMD → type `ipconfig` → look for IPv4 (e.g., 192.168.1.5)
   - **Mac:** System Preferences → Network → look for IP
2. Make sure your phone and computer are on the **same WiFi**

### Step 3: Update Config (1 minute)
Edit `config/config.php`:
```php
define('APP_URL', 'http://YOUR_IP_ADDRESS'); // e.g., http://192.168.1.5
```

### Step 4: Install on Android (1 minute)
1. Open **Chrome** on your Android phone
2. Go to: `http://YOUR_IP_ADDRESS/neon-sign-generator/`
3. Look for **"Install App"** button at bottom-right
4. Tap **Install**
5. **Done!** App icon appears on home screen

---

## 🌐 Option 2: Deploy Online (15 Minutes)

### Step 1: Choose Free Hosting (3 minutes)
**Recommended:** InfinityFree
1. Go to: https://infinityfree.net
2. Sign up (free)
3. Create account and website

### Step 2: Create Icons (2 minutes)
Same as Option 1, Step 1 above

### Step 3: Upload Files (5 minutes)
1. Login to your hosting control panel
2. Go to **File Manager** or use **FTP**
3. Upload all your project files to `htdocs` or `public_html`
4. Make sure `/pwa-icons/` folder is uploaded

### Step 4: Setup Database (3 minutes)
1. Go to **MySQL Databases** in control panel
2. Create new database: `neon_sign_db`
3. Create database user and password
4. Open **phpMyAdmin**
5. Select your database
6. Click **Import** → upload `database/schema.sql`

### Step 5: Configure (1 minute)
Edit `config/config.php` on the server:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('APP_URL', 'https://yourdomain.com');
```

### Step 6: Install on Android (1 minute)
1. Open Chrome on Android
2. Go to your website URL
3. Tap **Install App**
4. **Done!**

---

## 🔥 Super Quick Test (2 Minutes)

Just want to see it work right now?

### Using Ngrok:

1. **Download ngrok:** https://ngrok.com/download
2. **Extract** and run ngrok
3. **Open terminal** in ngrok folder
4. **Run:** `ngrok http 80`
5. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)
6. **On Android:** 
   - Open Chrome
   - Go to: `https://abc123.ngrok.io/neon-sign-generator/`
   - Tap menu → **Add to Home screen**

**Note:** Free ngrok URLs expire after a few hours.

---

## 📱 Verification Checklist

After installation, verify these work:

- [ ] App icon appears on Android home screen
- [ ] Tapping icon opens the app (no browser bar)
- [ ] Splash screen shows on launch
- [ ] All 4 steps load correctly
- [ ] Canvas preview works
- [ ] Font selection works
- [ ] Color picker works
- [ ] Size selection updates price

---

## 🐛 Common Issues & Quick Fixes

### "Install" button doesn't appear
**Fix:** You need HTTPS (use ngrok or deploy to hosting with SSL)

### Icons are broken
**Fix:** Check `/pwa-icons/` folder exists and has all 8 PNG files

### Can't access from phone
**Fix:** Make sure phone and computer are on same WiFi network

### Service worker error
**Fix:** Make sure you're using `http://localhost/` or `https://` (not plain `http://IP`)

### Database connection fails
**Fix:** Check credentials in `config/config.php`

---

## 🎯 What You Get

After installation:

✅ **Native app experience** - No browser controls  
✅ **Home screen icon** - Launch like any app  
✅ **Offline capability** - Works without internet (cached pages)  
✅ **Faster loading** - Resources cached locally  
✅ **Splash screen** - Professional app launch  
✅ **Full screen** - Immersive experience  

---

## 📚 Need More Details?

- **Full guide:** See `ANDROID_SETUP_GUIDE.md`
- **Icon creation:** See `CREATE_ICONS.md`
- **Troubleshooting:** Check browser console (F12)

---

## 🎉 Success!

Your app should now be installed on Android!

**Next steps:**
1. Customize the app name and colors in `manifest.json`
2. Add your own app icons
3. Test all features thoroughly
4. Deploy to production hosting
5. Share with users!

**Need help?** Check the console for errors (Chrome DevTools → F12)
