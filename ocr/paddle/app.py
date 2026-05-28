from fastapi import FastAPI, UploadFile, File
from paddleocr import PaddleOCR
from PIL import Image
import tempfile

app = FastAPI()

ocr = PaddleOCR(use_angle_cls=True, lang='es')

@app.post("/ocr")
async def extract_text(file: UploadFile = File(...)):

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(await file.read())
        path = tmp.name

    result = ocr.ocr(path)

    text = ""

    for line in result[0]:
        text += line[1][0] + "\n"

    return {"engine": "Paddle OCR", 
            "text"  : text}
