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
            updateDropZoneText(files[0].name);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if(e.target.files.length > 0) {
            updateDropZoneText(e.target.files[0].name);
        }
    });

    function updateDropZoneText(name) {
        const p = dropZone.querySelector('p');
        p.textContent = `Selected: ${name}`;
        p.style.color = 'var(--primary)';
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if(fileInput.files.length === 0) {
            alert('Please select an image file first.');
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
                displayResults(result.data);
            } else {
                alert('Error processing image: ' + result.message);
            }
        } catch(error) {
            alert('An error occurred. Make sure the backend is running.');
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
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
