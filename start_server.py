"""
AgriLink Server Launcher
Runs FastAPI backend on http://127.0.0.1:8000
"""
import uvicorn

if __name__ == "__main__":
    print("🌾 Starting AgriLink FastAPI Server...")
    print("📍 URL: http://127.0.0.1:8000")
    print("📖 Interactive Swagger API Docs: http://127.0.0.1:8000/docs")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
