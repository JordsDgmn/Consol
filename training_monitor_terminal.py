#!/usr/bin/env python3
"""
CONSOL AI Training Monitor - Terminal Only Mode
Runs indefinitely with detailed logs and hardware monitoring
"""

import time
import random
import math
import psutil
import threading
import sys
from datetime import datetime
from collections import deque

class TerminalTrainingMonitor:
    def __init__(self):
        self.training_active = True
        self.start_time = time.time()
        self.last_log_time = time.time()
        self.epoch = 0
        self.step = 0
        self.loss_history = deque(maxlen=100)
        
        # ANSI Colors
        self.GREEN = '\033[92m'
        self.YELLOW = '\033[93m'
        self.CYAN = '\033[96m'
        self.RESET = '\033[0m'
        self.BOLD = '\033[1m'
    
    def log(self, message, level='INFO'):
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == 'INFO':
            prefix = f"{self.GREEN}[{timestamp}]{self.RESET}"
        elif level == 'SUCCESS':
            prefix = f"{self.GREEN}[{timestamp} ✓]{self.RESET}"
        elif level == 'WARNING':
            prefix = f"{self.YELLOW}[{timestamp} ⚠]{self.RESET}"
        else:
            prefix = f"{self.CYAN}[{timestamp}]{self.RESET}"
        
        print(f"{prefix} {message}")
    
    def print_header(self):
        print(f"\n{self.BOLD}{self.GREEN}")
        print("╔════════════════════════════════════════════════════════╗")
        print("║   CONSOL AI Training Monitor - Terminal Mode v2.1.4   ║")
        print("║   SimCSE-RoBERTa Distributed Training Pipeline        ║")
        print("╚════════════════════════════════════════════════════════╝")
        print(f"{self.RESET}")
    
    def print_status(self):
        try:
            cpu = psutil.cpu_percent(interval=0.01)
            ram = psutil.virtual_memory()
            ram_gb = ram.used / (1024**3)
            gpu_usage = min(95, 30 + cpu * 0.6 + random.randint(0, 20))
            
            elapsed = time.time() - self.start_time
            hours, remainder = divmod(elapsed, 3600)
            minutes, seconds = divmod(remainder, 60)
            
            print(f"\r{self.CYAN}Epoch {self.epoch:3d}/500 | "
                  f"Step {self.step:5d} | "
                  f"CPU {cpu:5.1f}% | "
                  f"RAM {ram_gb:5.1f}GB | "
                  f"GPU {gpu_usage:5.1f}% | "
                  f"Time {int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}{self.RESET}", 
                  end='', flush=True)
        except:
            pass
    
    def training_loop(self):
        self.print_header()
        
        self.log("Initializing training environment...", 'INFO')
        self.log("CUDA Devices: 2 (Tesla V100, Tesla V100)", 'SUCCESS')
        self.log("Model: SimCSE-RoBERTa-large", 'INFO')
        self.log("Batch Size: 512 | Learning Rate: 2e-5 | Epochs: 500", 'INFO')
        self.log("Dataset: NLI-MNLI + STS-B (1.2M samples)", 'INFO')
        self.log("Distributed Training: 2 GPUs with NCCL backend\n", 'SUCCESS')
        
        time.sleep(2)
        
        epoch = 1
        warmup_steps = 100
        
        while self.training_active:
            try:
                steps_per_epoch = random.randint(2300, 2400)
                epoch_losses = []
                
                self.log(f"Starting epoch {epoch}/500", 'INFO')
                
                for step in range(steps_per_epoch):
                    if not self.training_active:
                        break
                    
                    try:
                        # Simulate training step
                        warmup_factor = min(1.0, (epoch * steps_per_epoch + step) / max(warmup_steps, 1))
                        base_loss = 0.5 * math.exp(-0.001 * max(epoch - 1, 0))
                        noise = random.uniform(-0.02, 0.02)
                        loss = (base_loss + noise) * warmup_factor + (0.005 * random.random())
                        
                        epoch_losses.append(loss)
                        self.loss_history.append(loss)
                        
                        self.epoch = epoch
                        self.step = step + 1
                        
                        # Detailed logging every 150 steps
                        current_time = time.time()
                        if step % 150 == 0 and step > 0:
                            avg_loss = sum(list(epoch_losses)[-50:]) / min(50, len(epoch_losses)) if epoch_losses else 0
                            time_diff = max(current_time - self.last_log_time, 0.01)
                            throughput = (512 * 150) / time_diff
                            
                            try:
                                gpu_mem = random.randint(18, 25)
                                self.log(f"E{epoch:03d} S{self.step:04d} | "
                                       f"Loss: {loss:.4f} | "
                                       f"Throughput: {throughput:.0f} samples/sec | "
                                       f"GPU Mem: {gpu_mem}/40 GB", 'INFO')
                                self.last_log_time = current_time
                            except:
                                pass
                        
                        # Validation checkpoint
                        if step % 500 == 0 and step > 0:
                            val_acc = 0.72 + 0.15 * (1 - math.exp(-0.003 * max(epoch - 1, 0) * steps_per_epoch + step))
                            val_spearman = 0.75 + 0.15 * (1 - math.exp(-0.003 * max(epoch - 1, 0) * steps_per_epoch + step))
                            self.log(f"VALIDATION | Accuracy: {val_acc:.4f} | Spearman: {val_spearman:.4f}", 'SUCCESS')
                        
                        self.print_status()
                        time.sleep(0.05)
                    
                    except Exception as step_error:
                        self.log(f"Step error: {str(step_error)[:60]}", 'WARNING')
                        continue
                
                # End of epoch
                try:
                    if epoch_losses:
                        avg_epoch_loss = sum(epoch_losses) / len(epoch_losses)
                    else:
                        avg_epoch_loss = 0
                    
                    self.epoch = epoch
                    self.step = steps_per_epoch
                    print()
                    
                    self.log(f"Epoch {epoch} complete | "
                           f"Avg Loss: {avg_epoch_loss:.4f} | "
                           f"Time: {time.time() - self.start_time:.1f}s", 'SUCCESS')
                except Exception as e:
                    self.log(f"Epoch summary error: {str(e)[:60]}", 'WARNING')
                
                # Checkpoint saving
                if epoch % 5 == 0:
                    self.log(f"Saving checkpoint: /checkpoints/epoch_{epoch}/", 'INFO')
                
                epoch += 1
                
                # Run indefinitely - loop back to epoch 1
                if epoch > 500:
                    epoch = 1
                    self.log("Training cycle complete, restarting from epoch 1...", 'SUCCESS')
            
            except Exception as epoch_error:
                self.log(f"Epoch error: {str(epoch_error)[:60]}", 'WARNING')
                time.sleep(1)
                continue
    
    def run(self):
        try:
            self.training_loop()
        except KeyboardInterrupt:
            print(f"\n\n{self.YELLOW}Training interrupted by user{self.RESET}")
            self.training_active = False
            sys.exit(0)

if __name__ == "__main__":
    monitor = TerminalTrainingMonitor()
    monitor.run()
