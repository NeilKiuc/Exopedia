# AI Model Server Examples

This directory contains example implementations for connecting your trained AI model to the Exoplanet Scout application.

## Option 1: FastAPI Server (Python)

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
import joblib  # or pickle, torch, tensorflow, etc.
from datetime import datetime
import time

app = FastAPI(title="Exoplanet AI Model API", version="1.0.0")

# Enable CORS for web browser requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your trained model (replace with your actual model loading)
# model = joblib.load('path/to/your/model.pkl')
# or
# model = torch.load('path/to/your/model.pth')
# or
# model = tf.keras.models.load_model('path/to/your/model')

class ExoplanetData(BaseModel):
    name: str
    orbital_period: float
    transit_depth: float
    transit_duration: float
    signal_to_noise_ratio: float
    stellar_radius: float
    stellar_temperature: float
    stellar_magnitude: float
    date_added: str
    notes: str

class AnalysisRequest(BaseModel):
    data: List[ExoplanetData]
    analysis_type: str
    parameters: Optional[Dict[str, Any]] = {}
    model_name: Optional[str] = None

class AnalysisResponse(BaseModel):
    success: bool
    predictions: Optional[List[Dict[str, Any]]] = []
    insights: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    anomalies: Optional[List[Dict[str, Any]]] = []
    model_version: str = "1.0.0"
    timestamp: str
    processing_time: int

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/info")
async def model_info():
    return {
        "name": "Exoplanet Classification Model",
        "version": "1.0.0",
        "description": "AI model for exoplanet analysis",
        "inputFeatures": [
            "orbital_period", "transit_depth", "transit_duration",
            "signal_to_noise_ratio", "stellar_radius", 
            "stellar_temperature", "stellar_magnitude"
        ],
        "outputTypes": ["classification", "probability", "insights"]
    }

@app.post("/api/analyze")
async def analyze_exoplanets(request: AnalysisRequest):
    start_time = time.time()
    
    try:
        # Extract features from the request data
        features = []
        for planet in request.data:
            features.append([
                planet.orbital_period,
                planet.transit_depth,
                planet.transit_duration,
                planet.signal_to_noise_ratio,
                planet.stellar_radius,
                planet.stellar_temperature,
                planet.stellar_magnitude
            ])
        
        features_array = np.array(features)
        
        # Run your model inference here
        # predictions = model.predict(features_array)
        # probabilities = model.predict_proba(features_array)
        
        # For demo purposes, we'll create mock results
        predictions = []
        insights = []
        recommendations = []
        anomalies = []
        
        for i, planet in enumerate(request.data):
            # Mock classification results
            predictions.append({
                "planetId": planet.name,
                "prediction": "potentially_habitable" if planet.stellar_temperature > 4000 and planet.stellar_temperature < 7000 else "not_habitable",
                "confidence": 0.85 + 0.1 * np.random.random(),
                "explanation": f"Based on stellar temperature ({planet.stellar_temperature}K) and orbital characteristics"
            })
            
            # Check for anomalies
            if planet.signal_to_noise_ratio < 5:
                anomalies.append({
                    "planetId": planet.name,
                    "anomalyType": "low_snr",
                    "severity": 0.7,
                    "description": f"Low signal-to-noise ratio ({planet.signal_to_noise_ratio}) may indicate poor data quality"
                })
        
        # Generate insights based on the dataset
        avg_period = np.mean([p.orbital_period for p in request.data])
        insights.append(f"Average orbital period: {avg_period:.2f} days")
        
        if avg_period > 365:
            insights.append("Most planets have long orbital periods, suggesting they orbit far from their stars")
            recommendations.append("Consider focusing on shorter-period planets for follow-up observations")
        
        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)
        
        return AnalysisResponse(
            success=True,
            predictions=predictions,
            insights=insights,
            recommendations=recommendations,
            anomalies=anomalies,
            timestamp=datetime.now().isoformat(),
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Option 2: Flask Server (Python)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for web requests

# Load your model here
# model = joblib.load('your_model.pkl')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/api/analyze', methods=['POST'])
def analyze():
    start_time = time.time()
    
    try:
        data = request.json
        exoplanet_data = data['data']
        analysis_type = data['analysis_type']
        
        # Process your data and run inference
        results = {
            "success": True,
            "predictions": [],
            "insights": [f"Analyzed {len(exoplanet_data)} exoplanets"],
            "recommendations": ["Consider additional observations"],
            "model_version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "processing_time": int((time.time() - start_time) * 1000)
        }
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
```

## Option 3: Node.js/Express Server

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Load your model (if using TensorFlow.js)
// const tf = require('@tensorflow/tfjs-node');
// const model = await tf.loadLayersModel('file://path/to/model.json');

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/analyze', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { data, analysis_type, parameters } = req.body;
        
        // Run your model inference here
        // const predictions = await model.predict(inputTensor);
        
        const results = {
            success: true,
            predictions: [],
            insights: [`Analyzed ${data.length} exoplanets`],
            recommendations: ['Consider additional observations'],
            model_version: '1.0.0',
            timestamp: new Date().toISOString(),
            processing_time: Date.now() - startTime
        };
        
        res.json(results);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(8000, () => {
    console.log('AI Model server running on port 8000');
});
```

## Deployment Options

### 1. Local Development
```bash
# Python FastAPI
pip install fastapi uvicorn numpy
python server.py

# Python Flask
pip install flask flask-cors numpy
python app.py

# Node.js
npm install express cors
node server.js
```

### 2. Cloud Deployment

#### AWS SageMaker
- Deploy your model as a SageMaker endpoint
- Use the endpoint URL in the AI configuration

#### Google Cloud AI Platform
- Deploy your model to AI Platform
- Use the prediction API endpoint

#### Azure Machine Learning
- Deploy as a web service
- Use the scoring endpoint

#### Hugging Face Spaces
- Deploy your model on Hugging Face
- Use the API endpoint

### 3. Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Integration Steps

1. **Train your model** using your preferred ML framework
2. **Choose a deployment method** (local server, cloud service, etc.)
3. **Implement the API endpoints** following the expected format
4. **Configure the endpoint** in the Exoplanet Scout AI tab
5. **Test the connection** and run analysis

## Expected API Format

The Exoplanet Scout app expects your API to:

- Accept POST requests at `/api/analyze`
- Receive exoplanet data in the specified format
- Return predictions, insights, and recommendations
- Include metadata about the analysis

## Authentication

If your model requires authentication:
- Add API key validation in your server
- Configure the API key in the Exoplanet Scout interface
- Use Bearer token authentication or custom headers