# Pattern Synth

A modern web application that seamlessly reconstructs infinite geometric textures from a single image using lattice detection.

Link : https://huggingface.co/spaces/saikumar277/pattern

## Features
- **Geometric Pattern Recognition**: Analyzes an uploaded image to find repeating structural patterns.
- **Autocorrelation Analysis**: Computes the autocorrelation map and extracts the base unit tile.
- **Seamless Reconstruction**: Reconstructs a seamless HD texture map of any size using the extracted geometric vectors.
- **Modern Web Interface**: A sleek, dark-mode frontend featuring geometric background animations and glassmorphism.

## Running Locally

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Start the FastAPI backend:
```bash
python -m uvicorn main:app --reload
```

3. Open your browser and navigate to `http://localhost:8000`.
