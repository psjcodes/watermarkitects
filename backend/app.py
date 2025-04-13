from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from io import BytesIO
from PIL import Image
from watermark.watermark import detect_watermark
from watermark.watermark import embed_watermark
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#image from event listener (image generator: chatgpt, etc.) --> add watermark
@app.post("/process/")
async def image_processing(file: UploadFile = File(...), signature: str = Form(...)):
    print("Received request")
    contents = await file.read()
    image = Image.open(BytesIO(contents))
    print(image)

    if len(signature) != 0:
        watermarked_image = embed_watermark(image, signature)
        watermarked_image = watermarked_image[..., ::-1]
        pil_image = Image.fromarray(watermarked_image)
        buf = BytesIO()
        pil_image.save(buf, format="PNG")
        buf.seek(0)

        return StreamingResponse(buf, media_type="image/png")
    else:
        raise HTTPException(status_code=400, detail="no signature")


#image from popup --> extract and identify watermark if present
@app.post("/analyze/")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(BytesIO(contents))

    result = detect_watermark(image)
    #detect_watermark(image)
    return JSONResponse(content=result)
