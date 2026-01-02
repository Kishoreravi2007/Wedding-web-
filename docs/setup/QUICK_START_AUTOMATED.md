# ⚡ Quick Start - Automated Wedding Website

## 🎯 Everything You Need to Know

### Start the Website

```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1
./start-all.sh
```

**Done!** Both servers start automatically.

### Stop the Website

```bash
./stop-all.sh
```

Or press `Ctrl+C` in the terminal running start-all.sh

## 🔗 Access URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Home** | http://localhost:3000/ | Main wedding site |
| **Sister A Gallery** | http://localhost:3000/parvathy/gallery | 3 photos |
| **Sister B Gallery** | http://localhost:3000/sreedevi/gallery | 17 photos |
| **Upload Photos** | http://localhost:3000/photographer-login | Photographer portal |
| **Face Admin** | http://localhost:3000/face-admin | Manage detected guests |

## 🎯 Upload Photos (Fully Automated)

1. Go to: http://localhost:3000/photographer-login
2. Login:
   - Username: `photographer`
   - Password: `photo123`
3. Select wedding (Sister A or Sister B)
4. Drag & drop or browse for photos
5. Click "Upload Photos"
6. **DONE!** Everything else is automatic:
   - ✅ Photo saved
   - ✅ Face detection runs automatically
   - ✅ Gallery refreshes automatically
   - ✅ Statistics update automatically

## 🤖 What Happens Automatically

### Every Photo Upload:
1. Photo saves to filesystem ✅
2. Face detection script runs in background ✅
3. Faces detected and clustered ✅
4. Reference images created ✅
5. Guest mappings updated ✅
6. Gallery refreshes (within 30 sec) ✅

**You do nothing - it all just works!**

### Gallery Auto-Updates:
- Checks for new photos every 30 seconds
- New photos appear without refresh
- Works for both galleries
- Always shows latest content

## 📊 Current Status

```
Photos:  20 total (3 Sister A + 17 Sister B)
Guests:  23+ detected across both galleries
Status:  Fully automated and operational
```

## 🆘 Troubleshooting

### Servers won't start
```bash
# Kill any lingering processes
./stop-all.sh
# Try again
./start-all.sh
```

### Photos not uploading
- Check you're logged in
- Verify backend is running: `lsof -i :5002`
- Check browser console (F12)

### Gallery not showing photos
- Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
- Wait 30 seconds for auto-refresh
- Check backend logs

## 📚 Documentation

- **README_AUTOMATION.md** - Complete automation guide
- **AUTOMATION_USAGE_GUIDE.md** - Daily usage instructions
- **AUTOMATION_COMPLETE.md** - Technical details
- **QUICK_START_AUTOMATED.md** - This file!

---

## 🎊 Summary

**Two Commands is All You Need:**

```bash
./start-all.sh  # Start
./stop-all.sh   # Stop
```

**Everything else is automatic!**

- ✅ Face detection
- ✅ Gallery updates
- ✅ Statistics
- ✅ Background processing

**Your wedding website is now a professional, fully automated system!** 🚀

Upload photos and watch the automation work! ✨

