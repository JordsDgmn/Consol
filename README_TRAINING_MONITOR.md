# CONSOL AI Training Monitor v2.1.4

Quick-click program to display convincing AI model training in progress with real hardware monitoring.

## Quick Start

**Choose ONE option below:**

### Option 1: Batch File (Easiest)
- Double-click: `START_TRAINING.bat`
- Shows a terminal window with training logs
- Easy to see what's happening

### Option 2: Silent Mode (Most Inconspicuous)
- Double-click: `START_TRAINING_SILENT.vbs`
- Runs silently with just the GUI window
- No command prompt visible

### Option 3: PowerShell (Best)
- Right-click: `START_TRAINING.ps1` → "Run with PowerShell"
- Or in PowerShell: `powershell -ExecutionPolicy Bypass -File START_TRAINING.ps1`
- Auto-installs dependencies

## Features

✅ **Realistic GUI Window** - Shows fake but convincing training metrics
✅ **Terminal Output** - Detailed logs of "training progress"
✅ **Real Hardware Monitoring** - Actual CPU, RAM, GPU usage displayed
✅ **Infinite Loop** - Runs indefinitely until you close it
✅ **Looks Professional** - Green terminal aesthetic, epoch tracking, loss graphs
✅ **One-Click Launch** - Super easy to start

## What You'll See

- **Training Progress**: Epochs 1-500, step counting, loss decreasing
- **Live Hardware Stats**: CPU %, RAM usage, GPU %, temperature
- **Detailed Logs**: 
  - Model config (SimCSE-RoBERTa-large)
  - Batch processing metrics
  - Validation scores
  - Throughput (samples/sec)
- **Progress Bar**: Visual representation of training completion

## First Time Setup

### Windows (Automatic)
1. Open PowerShell
2. Run: `pip install psutil`
3. Done! Just double-click any launcher

### Or Manual
```
pip install psutil
```

That's it! psutil is the only dependency (for real hardware monitoring).

## How to Run Again

After the first time:
- Just double-click `START_TRAINING.bat` or `START_TRAINING_SILENT.vbs` anytime
- Runs forever until you close the window
- Can be closed and restarted immediately

## Pro Tips

🔹 **Most Convincing**: Use `START_TRAINING_SILENT.vbs` + minimize the window in taskbar
🔹 **To Stop**: Just close the GUI window or the terminal
🔹 **Run in Background**: Start the silent version, minimize window, go about your day
🔹 **Stack Them**: You can even open multiple instances if needed

## File Breakdown

- `training_monitor.py` - Main program (the actual training simulator)
- `START_TRAINING.bat` - Batch launcher (shows terminal)
- `START_TRAINING_SILENT.vbs` - VBS launcher (no terminal)
- `START_TRAINING.ps1` - PowerShell launcher (auto-installs deps)
- `README.md` - This file

---

**Note**: This is purely visual. It doesn't actually train anything or use much real resources beyond display rendering. Just looks busy!
