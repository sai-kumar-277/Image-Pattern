document.addEventListener('DOMContentLoaded', () => {
    
    // --- TABS LOGIC ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    // --- DESIGN STUDIO LOGIC ---
    const canvas = document.getElementById('design-canvas');
    const ctx = canvas.getContext('2d');
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');

    // State
    let currentTool = 'rect';
    let isDrawing = false;
    let startX = 0;
    let startY = 0;
    let snapshot;
    let history = [];

    // UI Elements
    const toolBtns = document.querySelectorAll('.tool-btn');
    const fillColor = document.getElementById('fill-color');
    const strokeColor = document.getElementById('stroke-color');
    const strokeWidth = document.getElementById('stroke-width');
    const strokeWidthVal = document.getElementById('stroke-width-val');
    const filledToggle = document.getElementById('filled-toggle');
    const bgColor = document.getElementById('bg-color');
    const gridToggle = document.getElementById('grid-toggle');
    const undoBtn = document.getElementById('undo-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Init canvas
    function initCanvas() {
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveHistory();
        updatePreview();
    }

    // Tools setup
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });

    strokeWidth.addEventListener('input', (e) => {
        strokeWidthVal.textContent = e.target.value;
    });

    bgColor.addEventListener('input', () => {
        // Redraw background without clearing shapes (simplification: clear all for now on bg change, or just fill behind)
        // Better: we could keep paths, but bitmap canvas is destructive. 
        // We'll just set it for new clears, or composite behind.
        const temp = ctx.getImageData(0,0, canvas.width, canvas.height);
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // We need a proper layering system or just accept BG changes wipe/paint over.
        // For simplicity: redraw history
        redrawHistory();
    });

    gridToggle.addEventListener('change', updatePreview);

    // Drawing functions
    function saveHistory() {
        history.push(canvas.toDataURL());
        if (history.length > 20) history.shift();
    }

    function redrawHistory() {
        if (history.length === 0) return;
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = bgColor.value;
            ctx.fillRect(0,0,canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            updatePreview();
        };
        img.src = history[history.length - 1];
    }

    undoBtn.addEventListener('click', () => {
        if (history.length > 1) {
            history.pop();
            redrawHistory();
        } else if (history.length === 1) {
            initCanvas();
        }
    });

    clearBtn.addEventListener('click', () => {
        initCanvas();
    });

    // Drawing events
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        startX = e.offsetX;
        startY = e.offsetY;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        ctx.putImageData(snapshot, 0, 0);
        drawShape(e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        drawShape(e.offsetX, e.offsetY);
        saveHistory();
        updatePreview();
    });

    canvas.addEventListener('mouseleave', () => {
        if (isDrawing) {
            isDrawing = false;
            saveHistory();
            updatePreview();
        }
    });

    function drawShape(x, y) {
        ctx.beginPath();
        ctx.lineWidth = strokeWidth.value;
        ctx.strokeStyle = strokeColor.value;
        ctx.fillStyle = fillColor.value;

        if (currentTool === 'rect') {
            ctx.rect(startX, startY, x - startX, y - startY);
        } else if (currentTool === 'circle') {
            const rx = Math.abs(x - startX) / 2;
            const ry = Math.abs(y - startY) / 2;
            const cx = startX + (x - startX) / 2;
            const cy = startY + (y - startY) / 2;
            ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        } else if (currentTool === 'triangle') {
            ctx.moveTo(startX + (x - startX) / 2, startY);
            ctx.lineTo(x, y);
            ctx.lineTo(startX, y);
            ctx.closePath();
        } else if (currentTool === 'diamond') {
            ctx.moveTo(startX + (x - startX) / 2, startY);
            ctx.lineTo(x, startY + (y - startY) / 2);
            ctx.lineTo(startX + (x - startX) / 2, y);
            ctx.lineTo(startX, startY + (y - startY) / 2);
            ctx.closePath();
        } else if (currentTool === 'hexagon') {
            const width = x - startX;
            const height = y - startY;
            ctx.moveTo(startX + width * 0.25, startY);
            ctx.lineTo(startX + width * 0.75, startY);
            ctx.lineTo(startX + width, startY + height * 0.5);
            ctx.lineTo(startX + width * 0.75, startY + height);
            ctx.lineTo(startX + width * 0.25, startY + height);
            ctx.lineTo(startX, startY + height * 0.5);
            ctx.closePath();
        } else if (currentTool === 'star') {
            const cx = startX + (x - startX) / 2;
            const cy = startY + (y - startY) / 2;
            const outerRadius = Math.min(Math.abs(x - startX), Math.abs(y - startY)) / 2;
            const innerRadius = outerRadius / 2.5;
            for (let i = 0; i < 10; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / 5 - Math.PI / 2;
                ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
            }
            ctx.closePath();
        } else if (currentTool === 'line') {
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
        }

        if (filledToggle.checked && currentTool !== 'line') ctx.fill();
        if (strokeWidth.value > 0) ctx.stroke();
    }

    // Preview
    function updatePreview() {
        const w = previewCanvas.width;
        const h = previewCanvas.height;
        previewCtx.clearRect(0, 0, w, h);
        
        // Draw 3x3 grid
        const tileW = w / 3;
        const tileH = h / 3;

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                previewCtx.drawImage(canvas, c * tileW, r * tileH, tileW, tileH);
            }
        }

        if (gridToggle.checked) {
            previewCtx.strokeStyle = 'rgba(102, 252, 241, 0.5)';
            previewCtx.lineWidth = 1;
            previewCtx.beginPath();
            for (let i = 1; i < 3; i++) {
                previewCtx.moveTo(i * tileW, 0); previewCtx.lineTo(i * tileW, h);
                previewCtx.moveTo(0, i * tileH); previewCtx.lineTo(w, i * tileH);
            }
            previewCtx.stroke();
        }
    }

    initCanvas();

    // Presets
    const presetBtns = document.querySelectorAll('.preset-btn');
    const outWInput = document.getElementById('design-out-w');
    const outHInput = document.getElementById('design-out-h');

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            outWInput.value = btn.dataset.w;
            outHInput.value = btn.dataset.h;
        });
    });

    [outWInput, outHInput].forEach(inp => {
        inp.addEventListener('input', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
        });
    });

    // Synthesize Design
    const synthesizeBtn = document.getElementById('synthesize-btn');
    const designLoader = document.getElementById('design-loader');
    const designResult = document.getElementById('design-result');

    synthesizeBtn.addEventListener('click', async () => {
        designResult.classList.add('hidden');
        designLoader.classList.remove('hidden');

        try {
            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('file', blob, 'tile.png');
                formData.append('out_w', outWInput.value);
                formData.append('out_h', outHInput.value);

                const response = await fetch('/synthesize', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.status === 'success') {
                    document.getElementById('design-res-img').src = result.data.reconstructed;
                    document.getElementById('design-download-btn').href = result.data.reconstructed;
                    designResult.classList.remove('hidden');
                    designResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    alert('Error: ' + result.message);
                }
                designLoader.classList.add('hidden');
            }, 'image/png');
        } catch (err) {
            console.error(err);
            alert('Failed to synthesize pattern.');
            designLoader.classList.add('hidden');
        }
    });

    // --- ANALYZE LOGIC (EXISTING) ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const form = document.getElementById('upload-form');
    const loader = document.getElementById('loader');
    const resultsSection = document.getElementById('results');

    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, e => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('drop', (e) => {
            let files = e.dataTransfer.files;
            if(files.length > 0) {
                fileInput.files = files;
                showPreview(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if(e.target.files.length > 0) showPreview(e.target.files[0]);
        });
    }

    function showPreview(file) {
        const existing = dropZone.querySelector('#drop-preview');
        if (existing && existing.dataset.url) URL.revokeObjectURL(existing.dataset.url);

        const objectUrl = URL.createObjectURL(file);
        dropZone.innerHTML = `
            <img id="drop-preview" src="${objectUrl}" data-url="${objectUrl}"
                 alt="Preview" style="max-width: 100%; max-height: 220px; border-radius: 10px; object-fit: contain; box-shadow: 0 4px 20px rgba(0,0,0,0.5); margin-bottom: 0.75rem;">
            <p style="color: var(--primary); font-size: 0.95rem; margin-bottom: 0.5rem;">${file.name}</p>
            <label for="file-input" class="btn" style="font-size:0.85rem; padding: 0.5rem 1.2rem;">Change Image</label>
        `;
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(fileInput.files.length === 0) {
                showError('⚠️ Please select an image file first.');
                return;
            }

            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('out_w', document.getElementById('out-w').value);
            formData.append('out_h', document.getElementById('out-h').value);

            resultsSection.classList.add('hidden');
            loader.classList.remove('hidden');
            
            try {
                const response = await fetch('/process', { method: 'POST', body: formData });
                const result = await response.json();

                if(result.status === 'success') {
                    hideError();
                    displayResults(result.data);
                } else {
                    showError('⚠️ ' + result.message);
                }
            } catch(error) {
                showError('⚠️ Could not connect to the server. Please try again in a moment.');
                console.error(error);
            } finally {
                loader.classList.add('hidden');
            }
        });
    }

    function displayResults(data) {
        document.getElementById('res-original').src = data.original;
        document.getElementById('res-autocorr').src = data.autocorr;
        document.getElementById('res-tile').src = data.tile;
        document.getElementById('res-reconstructed').src = data.reconstructed;
        document.getElementById('download-btn').href = data.reconstructed;
        
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showError(msg) {
        let banner = document.getElementById('error-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'error-banner';
            banner.style.cssText = `margin-top: 1rem; padding: 1rem 1.5rem; border-radius: 12px; background: rgba(255,80,80,0.15); border: 1px solid rgba(255,80,80,0.4); color: #ff8080; font-size: 0.95rem; text-align: center;`;
            document.querySelector('.upload-section').appendChild(banner);
        }
        banner.textContent = msg;
        banner.style.display = 'block';
    }

    function hideError() {
        const banner = document.getElementById('error-banner');
        if (banner) banner.style.display = 'none';
    }
});
