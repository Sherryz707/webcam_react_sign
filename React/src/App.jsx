import React, { useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const App = () => {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);

  const webcamRef = React.useRef(null);

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result);  // Base64 string
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  // Capture image from webcam
  const captureImage = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImage(screenshot); // This is a base64 string
    sendImageForPrediction(screenshot);  // Directly send it as base64
  };

  // Send image to FastAPI for prediction
  const sendImageForPrediction = async (base64Image) => {
    try {
      const response = await axios.post('http://localhost:8000/predict/', {
        image: base64Image
      });

      setPrediction(response.data.prediction);
      setConfidence(response.data.confidence);
    } catch (error) {
      console.error("Error while sending image:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-4">Upload Image or Capture from Webcam</h2>

      {/* File Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {/* Webcam */}
      <div className="mb-4">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
          videoConstraints={{
            facingMode: "user"
          }}
        />
      </div>

      {/* Capture Button */}
      <button onClick={captureImage} className="p-2 bg-blue-500 text-white mb-4">
        Capture Image from Webcam
      </button>

      {/* Display image from file upload or webcam */}
      {(file || image) && (
        <div className="mt-4">
          <h3>Preview:</h3>
          <img
            src={file || image}
            alt="Preview"
            className="mt-2"
            style={{ maxWidth: '300px', maxHeight: '300px' }}
          />
        </div>
      )}

      {/* Button to send image for prediction */}
      {(file || image) && (
        <button
          onClick={() => sendImageForPrediction(file || image)}
          className="p-2 bg-green-500 text-white mt-4"
        >
          Get Prediction
        </button>
      )}

      {/* Display Prediction */}
      {prediction && (
        <div className="mt-4">
          <h3>Prediction: {prediction}</h3>
          <p>Confidence: {confidence}%</p>
        </div>
      )}
    </div>
  );
};

export default App;
