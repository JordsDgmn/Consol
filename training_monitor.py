#!/usr/bin/env python3
"""
Convincing AI Training Monitor
Displays fake but realistic training progress with real hardware monitoring
"""

import tkinter as tk
from tkinter import ttk, scrolledtext
import threading
import time
import random
import math
import psutil
import datetime
from collections import deque

class TrainingMonitor:
    def __init__(self, root):
        self.root = root
        self.root.title("CONSOL AI Training Monitor - v2.1.4")
        self.root.geometry("900x700")
        self.root.configure(bg="#1a1a2e")
        
        # Styling
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('TFrame', background='#1a1a2e')
        style.configure('TLabel', background='#1a1a2e', foreground='#00ff00')
        style.configure('TProgressbar', background='#00ff00', troughcolor='#0a0a0a')
        style.configure('Header.TLabel', font=('Courier', 14, 'bold'), foreground='#00ff00')
        style.configure('Status.TLabel', font=('Courier', 10), foreground='#00ff00')
        style.configure('Value.TLabel', font=('Courier', 10, 'bold'), foreground='#00ff88')
        
        self.setup_ui()
        self.training_active = True
        self.start_time = time.time()
        self.last_log_time = time.time()
        self.epoch = 0
        self.step = 0
        self.loss_history = deque(maxlen=100)
        self.cpu_history = deque(maxlen=60)
        self.ram_history = deque(maxlen=60)
        
        # Start training thread
        self.training_thread = threading.Thread(target=self.training_loop, daemon=True)
        self.training_thread.start()
        
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
    
    def setup_ui(self):
        # Main container
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Header
        header = ttk.Label(main_frame, text="🔄 CONSOL SimCSE Model Training (Distributed)", 
                          style='Header.TLabel')
        header.pack(pady=10)
        
        # Status line
        status_line = ttk.Label(main_frame, text="Status: INITIALIZING TRAINING PIPELINE...",
                               style='Status.TLabel', foreground='#ffff00')
        status_line.pack()
        self.status_label = status_line
        
        # Top frame for metrics
        top_frame = ttk.Frame(main_frame)
        top_frame.pack(fill=tk.X, pady=10)
        
        # Left column
        left_col = ttk.Frame(top_frame)
        left_col.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=5)
        
        ttk.Label(left_col, text="Training Progress", style='Header.TLabel').pack(anchor=tk.W)
        
        self.epoch_label = ttk.Label(left_col, text="Epoch: 0/500", style='Status.TLabel')
        self.epoch_label.pack(anchor=tk.W)
        
        self.step_label = ttk.Label(left_col, text="Step: 0 | Loss: --", style='Status.TLabel')
        self.step_label.pack(anchor=tk.W)
        
        self.loss_label = ttk.Label(left_col, text="Current Loss: -.----", style='Value.TLabel')
        self.loss_label.pack(anchor=tk.W, pady=5)
        
        # Progress bar
        self.progress = ttk.Progressbar(left_col, mode='determinate', length=250)
        self.progress.pack(fill=tk.X, pady=5)
        
        # Right column - Hardware info
        right_col = ttk.Frame(top_frame)
        right_col.pack(side=tk.RIGHT, expand=True, fill=tk.X, padx=5)
        
        ttk.Label(right_col, text="System Resources", style='Header.TLabel').pack(anchor=tk.W)
        
        self.cpu_label = ttk.Label(right_col, text="CPU Usage: 0%", style='Status.TLabel')
        self.cpu_label.pack(anchor=tk.W)
        
        self.ram_label = ttk.Label(right_col, text="RAM Usage: 0 GB / 32 GB", style='Status.TLabel')
        self.ram_label.pack(anchor=tk.W)
        
        self.gpu_label = ttk.Label(right_col, text="GPU Usage: 0%", style='Status.TLabel')
        self.gpu_label.pack(anchor=tk.W, pady=5)
        
        # Metrics
        self.throughput_label = ttk.Label(right_col, text="Throughput: 0 samples/sec", style='Value.TLabel')
        self.throughput_label.pack(anchor=tk.W)
        
        # Log window
        ttk.Label(main_frame, text="Training Log Output", style='Header.TLabel').pack(anchor=tk.W, pady=(10, 5))
        
        self.log_text = scrolledtext.ScrolledText(main_frame, height=20, width=100,
                                                   bg='#0a0a0a', fg='#00ff00', 
                                                   font=('Courier', 8),
                                                   insertbackground='#00ff00')
        self.log_text.pack(fill=tk.BOTH, expand=True)
        
        # Configure tag for different message types
        self.log_text.tag_config('info', foreground='#00ff00')
        self.log_text.tag_config('warning', foreground='#ffaa00')
        self.log_text.tag_config('success', foreground='#00ff88')
        self.log_text.tag_config('error', foreground='#ff4444')
        
        self.log_message("[SYSTEM] Initializing CONSOL AI Training Monitor v2.1.4", 'info')
        self.log_message("[SYSTEM] CUDA Devices: 2 (Tesla V100, Tesla V100)", 'success')
        self.log_message("[CONFIG] Model: SimCSE-RoBERTa-large", 'info')
        self.log_message("[CONFIG] Batch Size: 512 | Learning Rate: 2e-5 | Epochs: 500", 'info')
        self.log_message("[CONFIG] Dataset: NLI-MNLI + STS-B (1.2M samples)", 'info')
        self.log_message("[SYSTEM] Training pipeline ready. Starting epoch 1...\n", 'success')
    
    def log_message(self, message, tag='info'):
        self.log_text.insert(tk.END, message + '\n', tag)
        self.log_text.see(tk.END)
        self.root.update_idletasks()
    
    def training_loop(self):
        epoch = 1
        warmup_steps = 100
        
        while self.training_active:
            try:
                steps_per_epoch = random.randint(2300, 2400)
                
                for step in range(steps_per_epoch):
                    if not self.training_active:
                        break
                    
                    try:
                        # Fake loss with warmup and decay
                        warmup_factor = min(1.0, (epoch * steps_per_epoch + step) / warmup_steps)
                        base_loss = 0.5 * math.exp(-0.001 * (epoch - 1))
                        noise = random.uniform(-0.02, 0.02)
                        loss = (base_loss + noise) * warmup_factor + (0.005 * random.random())
                        
                        self.loss_history.append(loss)
                        
                        self.epoch = epoch
                        self.step = step + 1
                        
                        # Get real system stats
                        self.update_system_stats()
                        
                        # Update UI
                        progress = ((epoch - 1) * steps_per_epoch + step) / (500 * steps_per_epoch) * 100
                        
                        self.epoch_label.config(text=f"Epoch: {epoch}/500")
                        self.step_label.config(text=f"Step: {self.step}/{steps_per_epoch} | Loss: {loss:.4f}")
                        self.loss_label.config(text=f"Current Loss: {loss:.4f}")
                        self.progress.config(value=progress)
                        
                        # Log periodically
                        current_time = time.time()
                        if step % 150 == 0 and step > 0:
                            avg_loss = sum(list(self.loss_history)[-50:]) / min(50, len(self.loss_history))
                            time_diff = current_time - self.last_log_time
                            if time_diff > 0:
                                throughput = (512 * 150) / time_diff
                            else:
                                throughput = 512 * 150
                            self.log_message(f"[E{epoch:03d} S{self.step:04d}] Loss: {loss:.4f} | Avg Loss: {avg_loss:.4f} | "
                                           f"Throughput: {throughput:.0f} samples/sec | "
                                           f"GPU Mem: {random.randint(18, 25)}/{40} GB", 'info')
                            self.last_log_time = current_time
                        
                        # Validation every 500 steps
                        if step % 500 == 0 and step > 0:
                            val_acc = 0.72 + 0.15 * (1 - math.exp(-0.003 * (epoch - 1) * steps_per_epoch + step))
                            val_spearman = 0.75 + 0.15 * (1 - math.exp(-0.003 * (epoch - 1) * steps_per_epoch + step))
                            self.log_message(f"[VALIDATION] Accuracy: {val_acc:.4f} | Spearman: {val_spearman:.4f}", 'success')
                        
                        self.root.update_idletasks()
                        time.sleep(0.05)
                    
                    except Exception as step_error:
                        self.log_message(f"[ERROR] Step error: {str(step_error)[:100]}", 'error')
                        continue
                
                # End of epoch
                try:
                    avg_epoch_loss = sum(self.loss_history) / len(self.loss_history) if self.loss_history else 0
                    self.log_message(f"\n[EPOCH {epoch} COMPLETE] Average Loss: {avg_epoch_loss:.4f} | "
                                   f"Time: {time.time() - self.start_time:.1f}s", 'success')
                except Exception as e:
                    self.log_message(f"[ERROR] Epoch summary error: {str(e)[:100]}", 'error')
                
                epoch += 1
                
                # Loop back to epoch 1 after 500
                if epoch > 500:
                    epoch = 1
                    self.log_message("\n[SYSTEM] Training cycle complete, restarting from epoch 1...\n", 'success')
            
            except Exception as epoch_error:
                self.log_message(f"[ERROR] Epoch error: {str(epoch_error)[:100]}", 'error')
                epoch += 1
                if epoch > 500:
                    epoch = 1
                continue
    
    def update_system_stats(self):
        try:
            cpu_percent = psutil.cpu_percent(interval=0.01)
            ram_info = psutil.virtual_memory()
            ram_gb = ram_info.used / (1024**3)
            ram_percent = ram_info.percent
            
            self.cpu_history.append(cpu_percent)
            self.ram_history.append(ram_percent)
            
            # Fake GPU based on activity
            gpu_usage = min(95, 30 + cpu_percent * 0.6 + random.randint(0, 20))
            
            self.cpu_label.config(text=f"CPU Usage: {cpu_percent:.1f}%")
            self.ram_label.config(text=f"RAM Usage: {ram_gb:.1f} GB / 32 GB ({ram_percent:.1f}%)")
            self.gpu_label.config(text=f"GPU Usage: {gpu_usage:.1f}% | Temp: {65 + int(gpu_usage*0.3)}°C")
            
            throughput = random.randint(400, 800)
            self.throughput_label.config(text=f"Throughput: {throughput} samples/sec")
            
        except Exception as e:
            self.log_message(f"[WARNING] System stats error: {e}", 'warning')
    
    def on_closing(self):
        self.training_active = False
        self.root.destroy()

def main():
    root = tk.Tk()
    app = TrainingMonitor(root)
    root.mainloop()

if __name__ == "__main__":
    main()
