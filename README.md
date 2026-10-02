# 🌟 Pattern Synth

> **Infinite Geometric Textures from a Single Image**

A modern web application that seamlessly reconstructs infinite geometric textures from a single image using lattice detection.

---

## 📖 Why We Built This

Ever found a beautiful repeating pattern in a photo but needed it as a seamless, infinite texture for a background, game asset, or design project? 

Extracting repeating tiles manually is tedious, prone to misalignment, and often leaves visible seams. 

**Pattern Synth changes that.**

We wanted a tool that leverages mathematical precision to understand the underlying geometry of an image. By using autocorrelation analysis and lattice detection, Pattern Synth effortlessly transforms an image of a pattern into a perfectly seamless HD texture map of any size.

The problems we solved:
- ✂️ **Manual Cropping**: No more guessing where the pattern repeats.
- 📐 **Misaligned Seams**: Mathematically perfect lattice detection.
- 🖼️ **Resolution Limits**: Generate textures as large as you need.
- 🎨 **Workflow Friction**: A sleek, instant web interface to get the job done.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Modern Web Interface (HTML, CSS, Vanilla JS)             │   │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────┐     │   │
│  │  │   Image    │  │  Texture   │  │   Interactive   │     │   │
│  │  │  Upload    │  │  Settings  │  │   Preview       │     │   │
│  │  └────────────┘  └────────────┘  └─────────────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API (Multipart Form Data)
┌───────────────────────────▼─────────────────────────────────────┐
│                        SERVER SIDE                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FastAPI Backend (Python)                                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │   │
│  │  │  Image   │  │ Lattice  │  │ Seamless │               │   │
│  │  │ Analysis │  │Detection │  │ Synth    │               │   │
│  │  └──────────┘  └──────────┘  └──────────┘               │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│                 Core Processing Engine                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ NumPy & SciPy: Autocorrelation & Peak Finding     │  │
│  │ Pillow (PIL): Image Processing & Generation       │  │
│  │ Matplotlib: Visual Diagnostics (Optional)         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features Walkthrough

### 📐 Geometric Pattern Recognition
**Understanding the Math Behind the Art**

Upload any image containing a repeating structural pattern. The engine analyzes it to find the repeating basis vectors:
- **Lattice Detection**: Mathematically identifies the underlying 2D grid of the pattern.
- **Autocorrelation Analysis**: Computes the autocorrelation map to extract the most accurate base unit tile.

*Tech:* Python with NumPy and SciPy for heavy matrix operations and peak finding algorithms.

### 🖼️ Seamless Reconstruction
**Infinite Textures at Your Fingertips**

Once the base tile is found, it's used to build an infinite canvas.
- **Flawless Tiling**: Reconstructs a seamless HD texture map.
- **Custom Sizing**: Choose the output dimensions that fit your project perfectly.

*Tech:* Pillow (PIL) for high-performance image manipulation and seamless stitching.

### 🎨 Modern Web Interface
**A Joy to Use**

A sleek, intuitive frontend designed for creators.
- **Glassmorphism UI**: Beautiful, frosted glass design elements.
- **Dynamic Backgrounds**: Geometric background animations that react to the interface.
- **Instant Previews**: See your generated textures immediately in the browser.

*Tech:* Vanilla JavaScript, HTML5, and pure CSS3 styling.

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required installed software:
- Python 3.8+
- pip (Python package installer)
```

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/sai-kumar-277/Image-Pattern.git
cd Image-Pattern
```

**2. Install Dependencies**
```bash
pip install -r requirements.txt
```

**3. Start the Backend Server**
```bash
python -m uvicorn main:app --reload
```

**4. Open in Browser**
```
Navigate to http://localhost:8000
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5 & CSS3** | Core structure and layout |
| **Vanilla JavaScript** | DOM manipulation and API requests |
| **Glassmorphism UI** | Modern aesthetic styling |

### Backend
| Technology | Purpose |
|------------|---------|
| **Python** | Core runtime |
| **FastAPI** | High-performance async REST API |
| **NumPy & SciPy** | Matrix math and autocorrelation analysis |
| **Pillow (PIL)** | Image processing and manipulation |
| **Uvicorn** | ASGI web server |

---

## 📁 Project Structure

```text
Image-Pattern/
│
├── static/                        # Frontend assets served by FastAPI
│   ├── index.html                 # Main interface structure
│   ├── styles.css                 # Glassmorphism styling and animations
│   └── script.js                  # API interaction and UI logic
│
├── main.py                        # FastAPI application entry point
├── texture.py                     # Core lattice detection and synthesis logic
├── requirements.txt               # Python dependency list
├── Dockerfile                     # Docker container configuration
│
└── README.md                      # You are here!
```

---

## 🚀 Deployment

### Live Demo (Hugging Face Spaces)

**Current Production**: [Pattern Synth on Hugging Face](https://huggingface.co/spaces/saikumar277/pattern)

The application is fully dockerized and ready to be deployed on platforms like Hugging Face Spaces, Render, or Railway.

**Docker Build & Run:**
```bash
docker build -t pattern-synth .
docker run -p 8000:8000 pattern-synth
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and free to use. 

---

## 👥 Team

Built with ❤️ by a passionate developer.

### **Sai Kumar**
🔧 **Focus**: Full-Stack Development, Math & Image Processing Algorithms  
📧 **GitHub**: [@sai-kumar-277](https://github.com/sai-kumar-277)  
💡 *"Transforming pixels into infinite mathematical beauty."*

---

## 🙏 Acknowledgments

- **FastAPI** for an incredibly fast and developer-friendly backend framework.
- **NumPy & SciPy** for making complex autocorrelation algorithms accessible.
- The open-source community for amazing tools.

---

## 📞 Support

Found a bug? Have a feature request? Want to say hi?

- **Issues**: Open an issue on GitHub

---

<div align="center">

**⭐ Star this repo if Pattern Synth helped you create seamless textures! ⭐**

*Made with 📐 and 🖼️*

</div>
