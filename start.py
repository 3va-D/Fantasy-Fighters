import subprocess
import signal
import sys
import os

processes = []

def cleanup(signum, frame):
    print("Terminating processes...")
    for p in processes:
        p.terminate()
    for p in processes:
        p.wait()
    sys.exit(0)
signal.signal(signal.SIGINT, cleanup)

print("Starting node server:")

node = subprocess.Popen(
    ["node", "questionServer.js"],
    cwd = "src/scenes"    
)

processes.append(node)

node_import = subprocess.Popen(
    ["node", "importQuestions.js"],
    cwd = "src/scenes"    
)

processes.append(node_import)

ocr_server = subprocess.Popen(
    ["python", "ocr_server.py"]  
)

processes.append(ocr_server)

print(f"Question Server PID = {node.pid}")
print(f"Import Questions PID = {node_import.pid}")
print(f"OCR Server PID = {ocr_server.pid}")
print("All servers started. Press Ctrl+C to terminate.")

for p in processes:
    p.wait()