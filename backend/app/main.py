from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps
import io, os
import numpy as np
import tensorflow as tf

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "fingernail_cnn.keras")
app = FastAPI(title="NailSense AI API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

model = None

def load_model():
    global model
    if model is None:
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    return model

@app.on_event("startup")
def startup():
    load_model()

@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": load_model() is not None}

@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Upload a JPG, PNG, or WEBP image.")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be smaller than 10 MB.")
    try:
        image = Image.open(io.BytesIO(data)).convert("RGB")
        image = ImageOps.fit(image, (224, 224), method=Image.Resampling.LANCZOS)
        pixels = np.asarray(image, dtype=np.float32) / 255.0
        prediction = float(load_model()(pixels[np.newaxis, ...], training=False).numpy()[0][0])
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not process image: {exc}")

    anemic = prediction >= 0.5
    predicted_class = "Anemic" if anemic else "Non-Anemic"
    score = prediction if anemic else 1.0 - prediction
    return {
        "predicted_class": predicted_class,
        "experimental_score": round(score, 4),
        "raw_output": round(prediction, 6)
    }


FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.isdir(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def frontend(full_path: str):
        requested_file = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(requested_file):
            return FileResponse(requested_file)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
