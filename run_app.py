import subprocess
import os
import sys
import time

def run_backend():
    print("Starting backend server...")
    return subprocess.Popen([sys.executable, "backend.py"], cwd=".")

def run_frontend():
    print("Starting frontend server...")
    # Using shell=True for Windows to execute 'npm'
    return subprocess.Popen("npm run dev", shell=True, cwd="frontend")

def main():
    backend_process = None
    frontend_process = None
    try:
        backend_process = run_backend()
        # Give backend a moment to start
        time.sleep(2)
        frontend_process = run_frontend()
        
        print("\nBoth servers are running!")
        print("Backend: http://localhost:5000")
        print("Frontend: http://localhost:5173")
        print("Press Ctrl+C to stop both servers.\n")
        
        # Wait for both processes
        while True:
            if backend_process.poll() is not None:
                print("Backend process terminated.")
                break
            if frontend_process.poll() is not None:
                print("Frontend process terminated.")
                break
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            # On Windows, terminating a shell process needs special care, 
            # but for a dev script this is usually okay as Ctrl+C handles it or 
            # we just let the user close the terminal.
            subprocess.run("taskkill /F /T /PID " + str(frontend_process.pid), shell=True, stderr=subprocess.DEVNULL)
            frontend_process.terminate()

if __name__ == "__main__":
    main()
