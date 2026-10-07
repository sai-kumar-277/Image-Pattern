document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const form = document.getElementById('upload-form');
    const loader = document.getElementById('loader');
    const resultsSection = document.getElementById('results');

    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        let files = dt.files;
        if(files.length > 0) {
            fileInput.files = files;
            showPreview(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if(e.target.files.length > 0) {
            showPreview(e.target.files[0]);
        }
    });

    function showPreview(file) {
        // Revoke any previous object URL to free memory
        const existing = dropZone.querySelector('#drop-preview');
        if (existing && existing.dataset.url) {
            URL.revokeObjectURL(existing.dataset.url);
        }

        const objectUrl = URL.createObjectURL(file);

        dropZone.innerHTML = `
            <img id="drop-preview" src="${objectUrl}" data-url="${objectUrl}"
                 alt="Preview" style="
                     max-width: 100%; max-height: 220px;
                     border-radius: 10px;
                     object-fit: contain;
                     box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                     margin-bottom: 0.75rem;
                 ">
            <p style="color: var(--primary); font-size: 0.95rem; margin-bottom: 0.5rem;">
                ${file.name}
            </p>
            <label for="file-input" class="btn" style="font-size:0.85rem; padding: 0.5rem 1.2rem;">
                Change Image
            </label>
        `;
    }

    // Form submission
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

        // UI states
        resultsSection.classList.add('hidden');
        loader.classList.remove('hidden');
        
        try {
            const response = await fetch('/process', {
                method: 'POST',
                body: formData
            });
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
            banner.style.cssText = `
                margin-top: 1rem; padding: 1rem 1.5rem; border-radius: 12px;
                background: rgba(255,80,80,0.15); border: 1px solid rgba(255,80,80,0.4);
                color: #ff8080; font-size: 0.95rem; text-align: center;
            `;
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
