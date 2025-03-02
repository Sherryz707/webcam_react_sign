import pathlib

temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from PIL import Image
from fastai.learner import load_learner
import io
import base64
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# Allow CORS for your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React app's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
# Load the trained FastAI model
learn = load_learner(r'.\model.pkl')  # Use raw string for Windows paths

@app.post("/predict/")
async def predict_image(request: dict):
    try:
        # Get the base64 image from the request
        base64_image = request.get('image')
        if not base64_image:
            return JSONResponse(content={"error": "No image provided"}, status_code=400)

        # Decode the base64 string into bytes
        image_data = base64.b64decode(base64_image.split(',')[1])  # Strip off the 'data:image/jpeg;base64,' part
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Resize image to match model input
        image = image.resize((224, 224))
        
        # Get prediction
        pred, pred_idx, probs = learn.predict(image)
        
        # Get prediction confidence percentage
        confidence = probs[pred_idx].item() * 100
        
        # Return prediction and confidence
        return JSONResponse(content={"prediction": pred, "confidence": confidence})
    
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)

# To run: uvicorn app:app --reload
