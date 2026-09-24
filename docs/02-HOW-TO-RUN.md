# How to Run evaad Locally

## Prerequisites

- Python 3.12 (download from [python.org](https://python.org))
  - On Windows: tick "Add Python to PATH" during installation

## Step 1: Start the backend

Open PowerShell (or Terminal) in `evaad/backend`:

```powershell
# Create virtual environment
python -m venv .venv

# Activate it
.venv\Scripts\Activate.ps1

# If you get an execution policy error, run this first:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Then activate again
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

The backend will be available at `http://127.0.0.1:8000`

## Step 2: Start the web preview

Open **another** PowerShell (or Terminal) in `evaad/web-preview`:

```powershell
python -m http.server 5500
```

The frontend will be available at `http://127.0.0.1:5500`

## Step 3: Open in browser

Navigate to: **http://127.0.0.1:5500**

## Features to try

1. **Sort modes** — Click 🔥 Hot, ✨ New, 🏆 Top, or ⚡ Controversial
2. **Balance bars** — See the green/pink split on each topic card
3. **Filter chips** — Filter by Genre and Region
4. **Language toggle** — Switch between English and Hindi
5. **Toast notifications** — Watch the elegant notifications appear
6. **Like arguments** — Click the ▲ Like button (persists per device)
7. **Post arguments** — Join a debate with the compose box

## API docs

FastAPI auto-generates interactive docs at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Stopping

- Press `Ctrl+C` in each terminal window to stop the servers
