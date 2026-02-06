(function() {
    const VALIDATION_ENDPOINT = 'https://lvjtqqnxtrbxeozjrsku.supabase.co/functions/v1/smooth-worker';
    
    // পেজ এবং DOM পুরোপুরি তৈরি হওয়ার অপেক্ষা করা
    const init = () => {
        const container = document.getElementById('examio-widget');
        
        if (!container) {
            console.warn('EXAMiO Widget: #examio-widget element ti ekhono pawa jayni. Re-trying...');
            return;
        }

        const apiKey = container.getAttribute('data-key');
        if (!apiKey) {
            container.innerHTML = "<div style='color:red; padding:20px; border:1px solid red;'>Configuration Error: Missing data-key attribute.</div>";
            return;
        }

        // স্টাইল ইনজেক্ট করা
        injectStyles();
        
        // লোডিং দেখানো
        container.innerHTML = `
            <div class="examio-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px;">
                <div class="examio-spinner"></div>
                <span style="margin-top: 10px; font-family: sans-serif;">Examio Loading...</span>
            </div>
        `;

        // ভ্যালিডেশন কল
        validateAndLoad(container, apiKey);
    };

    function validateAndLoad(container, apiKey) {
        fetch(VALIDATION_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: apiKey,
                domain: window.location.hostname
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.success && data.examUrl) {
                container.innerHTML = `<iframe id="examio-frame" src="${data.examUrl}" style="width:100%; height:600px; border:none;" allow="camera; microphone"></iframe>`;
            } else {
                showError(container, data.error || 'Access Denied');
            }
        })
        .catch(err => {
            console.error("EXAMio Fetch Error:", err);
            showError(container, 'Connection Error: Unable to contact validation server.');
        });
    }

    function showError(container, msg) {
        container.innerHTML = `<div style="color: #e53e3e; padding: 20px; text-align: center; background: #fff5f5; border-radius: 8px; font-family: sans-serif;"><strong>EXAMiO Error</strong><br/>${msg}</div>`;
    }

    function injectStyles() {
        if (document.getElementById('examio-styles')) return;
        const style = document.createElement('style');
        style.id = 'examio-styles';
        style.textContent = `
            .examio-spinner {
                width: 40px; height: 40px;
                border: 4px solid #f3f3f3; border-top: 4px solid #3498db;
                border-radius: 50%; animation: spin 1s linear infinite;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }

    // কোডটি সঠিক সময়ে রান করার লজিক
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
