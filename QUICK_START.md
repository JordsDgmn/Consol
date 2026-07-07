# 🚀 QUICK START GUIDE - CONSOL Training Monitor

## One-Click Launch

**Just double-click one of these:**

| File | What it does | Best for |
|------|-------------|----------|
| `LAUNCHER.bat` | 🎯 **RECOMMENDED** - Menu to choose mode | First time users |
| `START_TRAINING.bat` | Shows GUI window + terminal logs | Looks most legitimate |
| `START_TRAINING_SILENT.vbs` | GUI window only, no terminal | Most inconspicuous |
| `START_TRAINING_TERMINAL.bat` | Terminal logs only, no GUI | Minimal footprint |

---

## 🎯 Recommended Usage

1. **First time?** Run `SETUP_CHECK.bat` to verify setup
2. **Then?** Double-click `LAUNCHER.bat`
3. **Choose option 1** for maximum convincingness

---

## 📊 What You'll See

### GUI Window (Option 1 & 2)
```
╔════════════════════════════════════════════╗
║ 🔄 CONSOL SimCSE Model Training           ║
├────────────────────────────────────────────┤
│ Epoch: 42/500                              │
│ Step: 1523/2350 | Loss: 0.3421             │
│ Current Loss: 0.3421                       │
│ Progress: ████████░░░░░░░░░░░░░░ 23%       │
├────────────────────────────────────────────┤
│ System Resources                           │
│ CPU Usage: 45.3%                           │
│ RAM Usage: 12.4 GB / 32 GB                 │
│ GPU Usage: 78.9% | Temp: 72°C              │
│ Throughput: 642 samples/sec                │
├────────────────────────────────────────────┤
│ [SYSTEM] Initializing CONSOL...            │
│ [E042 S1523] Loss: 0.3421 | Throughput: 624 │
│ [VALIDATION] Accuracy: 0.8234              │
└────────────────────────────────────────────┘
```

### Terminal Output (Option 1 & 3)
```
17:42:33 ✓ Initializing training environment...
17:42:33 ✓ CUDA Devices: 2 (Tesla V100, Tesla V100)
17:42:33   Model: SimCSE-RoBERTa-large
17:42:33   Batch Size: 512 | Learning Rate: 2e-5 | Epochs: 500
17:42:33   Starting epoch 1...
17:42:45   E001 S0150 | Loss: 0.4521 | Avg Loss: 0.4543
17:43:12 ✓ VALIDATION | Accuracy: 0.7234 | Spearman: 0.7556
```

---

## 🎮 Keyboard Controls

- **Close window**: Click X (stops training)
- **Close terminal**: Close window or Ctrl+C
- **Restart**: Just run again!

---

## 🔧 Advanced Options

### Run Multiple Instances
```
click START_TRAINING.bat
click START_TRAINING.bat  (again)
```
Now you have 2 training sessions running!

### Create Desktop Shortcut
1. Right-click `LAUNCHER.bat`
2. "Send to" → "Desktop (create shortcut)"
3. Now just click on desktop!

### Auto-start on Login
1. Press `Win + R`
2. Type: `shell:startup`
3. Copy `START_TRAINING_SILENT.vbs` there
4. Next login = auto-starts!

---

## 🛠️ Troubleshooting

**"Python not found"**
- Install Python from python.org
- Make sure to check "Add Python to PATH"

**"ModuleNotFoundError: psutil"**
- Run: `pip install psutil`
- Or run `SETUP_CHECK.bat`

**"Can't run .vbs files"**
- Windows Defender might block it
- Use `START_TRAINING.bat` instead
- Or right-click → "Run as administrator"

**Window appears then closes**
- It crashed - check that Python is installed
- Run `SETUP_CHECK.bat` to diagnose

**Need to stop it**
- Just close the window or terminal
- Can restart immediately after

---

## 📝 File Summary

```
training_monitor.py              ← Main GUI program
training_monitor_terminal.py     ← Terminal-only version

START_TRAINING.bat               ← GUI + terminal
START_TRAINING.bat               ← Silent GUI
START_TRAINING_TERMINAL.bat      ← Terminal only
START_TRAINING_SILENT.vbs        ← VBS launcher
START_TRAINING.ps1               ← PowerShell launcher

LAUNCHER.bat                      ← Universal menu (RECOMMENDED)
SETUP_CHECK.bat                   ← Verify installation
README_TRAINING_MONITOR.md        ← Full documentation
QUICK_START.md                    ← This file!
```

---

## 💡 Pro Tips

✅ **Most Convincing**: Use GUI version + minimize to taskbar
✅ **Most Stealthy**: Use silent VBS version + hide window
✅ **Easiest**: Use LAUNCHER.bat menu
✅ **Multiple Sessions**: Open multiple instances for extra load
✅ **Always Available**: Keep LAUNCHER.bat on desktop

---

## ⚡ TL;DR

1. Double-click `LAUNCHER.bat`
2. Choose option 1
3. Done! Leave it running

That's it! 🎉

---

**Version**: 2.1.4  
**Last Updated**: 2026-05-15  
**Status**: Production Ready ✓
