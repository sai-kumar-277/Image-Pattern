from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import io
import os
from PIL import Image
import numpy as np
import texture

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/process")
async def process_image(file: UploadFile = File(...), out_w: int = Form(1920), out_h: int = Form(1080)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img_arr = np.array(img, dtype=np.float64) / 255.0
    
    try:
        results = texture.process_texture(img_arr, out_w, out_h)
        return {"status": "success", "data": results}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
