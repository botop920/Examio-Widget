(function() {
    // Configuration
    // Update this to your project URL. Using 'smooth-worker' based on your prompt.
    // Ensure YOUR_SUPABASE_PROJECT_ID is replaced with your actual project ref (e.g. 'abcdefghijklm')
    // If you are running locally, use localhost. If deployed, use your project url.
    // Example: 'https://PROJECT_REF.supabase.co/functions/v1/smooth-worker'
    const VALIDATION_ENDPOINT = 'https://lvjtqqnxtrbxeozjrsku.supabase.co/functions/v1/smooth-worker';
    
    // DOM Elements
    const container = document.getElementById('examio-widget');
    if (!container) {
        console.error('EXAMiO Widget: Container element #examio-widget not found.');
        return;
    }

    const apiKey = container.getAttribute('data-key');
    if (!apiKey) {
        renderError('Configuration Error: Missing data-key attribute.');
        return;
    }

    // Styles
    const style = document.createElement('style');
    style.textContent = `
        #examio-widget {
            width: 100%;
            min-height: 600px;
            position: relative;
            background: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
            font-family: sans-serif;
        }
        .examio-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            color: #666;
        }
        .examio-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #e2e8f0;
            border-top: 3px solid #0071E3;
            border-radius: 50%;
            animation: examio-spin 1s linear infinite;
            margin-bottom: 15px;
        }
        .examio-error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #e53e3e;
            padding: 20px;
            text-align: center;
            background: #fff5f5;
        }
        @keyframes examio-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        #examio-frame {
            width: 100%;
            height: 100%;
            min-height: 600px;
            border: none;
            display: none; /* Hidden until loaded */
        }
    `;
    document.head.appendChild(style);

    // Initial Loading State
    renderLoading();

    // Validate and Load
    validateAndLoad();

    function validateAndLoad() {
        const payload = {
            key: apiKey,
            domain: window.location.hostname,
            userAgent: navigator.userAgent
        };

        // Debug Log
        console.log("EXAMiO Widget: Sending payload", payload);

        fetch(VALIDATION_ENDPOINT, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(async response => {
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                // Handle non-200 responses
                const errorMsg = (data && data.error) || response.statusText || 'Validation Failed';
                throw new Error(errorMsg);
            }

            return data;
        })
        .then(data => {
            if (data && data.success && data.examUrl) {
                renderIframe(data.examUrl);
            } else {
                renderError((data && data.error) || 'Access Denied');
            }
        })
        .catch(err => {
            console.error('EXAMiO Widget Error:', err);
            renderError(`Connection Error: ${err.message}`);
        });
    }

    function renderLoading() {
        container.innerHTML = `
            <div class="examio-loading">
                <div class="examio-spinner"></div>
                <span>Loading Exam...</span>
            </div>
        `;
    }

    function renderError(message) {
        container.innerHTML = `
            <div class="examio-error">
                <div>
                    <strong>EXAMiO Error</strong><br/>
                    <span style="font-size: 0.9em; opacity: 0.8">${message}</span>
                </div>
            </div>
        `;
    }

    function renderIframe(url) {
        container.innerHTML = ''; // Clear loading
        
        const iframe = document.createElement('iframe');
        iframe.id = 'examio-frame';
        iframe.src = url;
        iframe.setAttribute('allow', 'camera; microphone');
        iframe.setAttribute('loading', 'lazy');
        
        // Handle iframe load
        iframe.onload = () => {
            iframe.style.display = 'block';
        };

        container.appendChild(iframe);
    }
})();
