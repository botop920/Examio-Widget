
(function() {
    // Configuration: Replace with your deployed Edge Function URL
    const SUPABASE_FUNCTION_URL = 'https://lvjtqqnxtrbxeozjrsku.supabase.co/functions/v1/validate';

    // 1. Find the container
    const container = document.getElementById('examio-widget');
    if (!container) {
        console.error('Examio Widget: Container element #examio-widget not found.');
        return;
    }

    // 2. Extract Configuration
    const apiKey = container.getAttribute('data-key');
    if (!apiKey) {
        renderError('Configuration Error: Missing data-key attribute.');
        return;
    }

    // 3. Set Initial Loading State
    container.innerHTML = `
        <div style="font-family: sans-serif; text-align: center; padding: 40px; color: #666;">
            <div style="margin-bottom: 10px;">Loading Examio...</div>
            <div style="width: 20px; height: 20px; border: 2px solid #ccc; border-top-color: #0071E3; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
    `;

    // 4. Validate and Load
    validateAndFetch();

    async function validateAndFetch() {
        try {
            const currentDomain = window.location.hostname;

            const response = await fetch(SUPABASE_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiKey: apiKey,
                    domain: currentDomain
                })
            });

            const data = await response.json();

            if (data.success === true && data.examUrl) {
                renderIframe(data.examUrl);
            } else {
                renderError(data.error || 'Unauthorized Access');
            }

        } catch (error) {
            console.error('Examio Widget Error:', error);
            renderError('Connection failed. Please try again later.');
        }
    }

    function renderIframe(url) {
        // Clear loading state
        container.innerHTML = '';

        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        iframe.setAttribute('allow', 'camera; microphone; fullscreen');
        
        container.appendChild(iframe);
    }

    function renderError(msg) {
        container.innerHTML = `
            <div style="
                font-family: sans-serif; 
                text-align: center; 
                padding: 30px; 
                background: #FFF5F5; 
                border: 1px solid #FEB2B2; 
                border-radius: 8px; 
                color: #C53030;
            ">
                <strong>Examio Widget Error</strong><br/>
                <span style="font-size: 0.9em;">${msg}</span>
            </div>
        `;
    }
})();
