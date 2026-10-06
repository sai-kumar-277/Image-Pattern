from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import io
import os
from PIL import Image
import numpy as np
import texture
import asyncio

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/process")
async def process_image(
    file: UploadFile = File(...), 
    out_w: int = Form(1920, le=3840), 
    out_h: int = Form(1080, le=2160)
):
    contents = await file.read()
    
    def _process():
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        # Prevent OOM by scaling down extremely large input images
        img.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
        img_arr = np.array(img, dtype=np.float64) / 255.0
        return texture.process_texture(img_arr, out_w, out_h)

    try:
        results = await asyncio.to_thread(_process)
        return {"status": "success", "data": results}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
