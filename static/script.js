document.addEventListener('DOMContentLoaded', () => {
    
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
    let showGrid = true; // Live preview grid default

    // UI Elements
    const toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
    const fillColor = document.getElementById('fill-color');
    const fillHex = document.getElementById('fill-hex');
    const strokeColor = document.getElementById('stroke-color');
    const strokeHex = document.getElementById('stroke-hex');
    const strokeWidth = document.getElementById('stroke-width');
    const strokeWidthVal = document.getElementById('stroke-width-val');
    const filledToggle = document.getElementById('filled-toggle');
    const bgColor = document.getElementById('bg-color');
    const bgHex = document.getElementById('bg-hex');
    const gridToggleBtn = document.getElementById('grid-toggle-btn');
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

    // Sync sliders and hex values
    strokeWidth.addEventListener('input', (e) => { strokeWidthVal.value = e.target.value; });
    strokeWidthVal.addEventListener('input', (e) => { strokeWidth.value = e.target.value; });

    fillColor.addEventListener('input', (e) => { fillHex.textContent = e.target.value.toUpperCase(); });
    strokeColor.addEventListener('input', (e) => { strokeHex.textContent = e.target.value.toUpperCase(); });

    bgColor.addEventListener('input', (e) => {
        bgHex.textContent = e.target.value.toUpperCase();
        // Redraw canvas with new background
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        redrawHistory();
    });

    gridToggleBtn.addEventListener('click', () => {
        showGrid = !showGrid;
        gridToggleBtn.style.opacity = showGrid ? '1' : '0.5';
        updatePreview();
    });

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

    // Drawing events - precise mouse mapping
    function getMousePos(evt) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (evt.clientX - rect.left) * scaleX,
            y: (evt.clientY - rect.top) * scaleY
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const pos = getMousePos(e);
        startX = pos.x;
        startY = pos.y;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        ctx.putImageData(snapshot, 0, 0);
        const pos = getMousePos(e);
        drawShape(pos.x, pos.y);
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        const pos = getMousePos(e);
        drawShape(pos.x, pos.y);
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
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

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

        if (showGrid) {
            previewCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
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

    // Export Presets
    const presetBtns = document.querySelectorAll('.export-preset');
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

    // Modals & Synthesis
    const analyzeModal = document.getElementById('analyze-modal');
    const resultModal = document.getElementById('result-modal');
    
    document.getElementById('btn-open-analyze').addEventListener('click', () => analyzeModal.classList.remove('hidden'));
    document.getElementById('close-analyze-modal').addEventListener('click', () => analyzeModal.classList.add('hidden'));
    document.getElementById('close-result-modal').addEventListener('click', () => resultModal.classList.add('hidden'));

    const synthesizeBtn = document.getElementById('header-synthesize-btn');
    const designLoader = document.getElementById('design-loader');
    const designResult = document.getElementById('design-result');

    synthesizeBtn.addEventListener('click', async () => {
        resultModal.classList.remove('hidden');
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
                } else {
                    alert('Error: ' + result.message);
                    resultModal.classList.add('hidden');
                }
                designLoader.classList.add('hidden');
            }, 'image/png');
        } catch (err) {
            console.error(err);
            alert('Failed to synthesize pattern.');
            designLoader.classList.add('hidden');
            resultModal.classList.add('hidden');
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
                e.preventDefault(); e.stopPropagation();
            }, false);
        });
        dropZone.addEventListener('drop', (e) => {
            let files = e.dataTransfer.files;
            if(files.length > 0) { fileInput.files = files; updateDropZoneText(files[0].name); }
        });
        fileInput.addEventListener('change', (e) => {
            if(e.target.files.length > 0) updateDropZoneText(e.target.files[0].name);
        });
    }

    function updateDropZoneText(name) {
        dropZone.innerHTML = `<p style="color:var(--primary)">Selected: ${name}</p>`;
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(fileInput.files.length === 0) { alert('Please select an image file first.'); return; }

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
                    document.getElementById('res-original').src = result.data.original;
                    document.getElementById('res-autocorr').src = result.data.autocorr;
                    document.getElementById('res-tile').src = result.data.tile;
                    document.getElementById('res-reconstructed').src = result.data.reconstructed;
                    document.getElementById('download-btn').href = result.data.reconstructed;
                    resultsSection.classList.remove('hidden');
                } else {
                    alert('Error: ' + result.message);
                }
            } catch(error) {
                alert('Could not connect to the server.');
            } finally {
                loader.classList.add('hidden');
            }
        });
    }
});
