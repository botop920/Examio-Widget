(function() {
    // ১. আপনার নতুন ফাংশন URL
    const VALIDATION_ENDPOINT = 'https://lvjtqqnxtrbxeozjrsku.supabase.co/functions/v1/smooth-worker';

    const init = () => {
        const container = document.getElementById('examio-widget');
        if (!container) return;

        const apiKey = container.getAttribute('data-key');
        if (!apiKey) {
            container.innerHTML = "<p style='color:red'>Error: Missing API Key</p>";
            return;
        }

        container.innerHTML = "<div style='text-align:center; padding:20px; font-family:sans-serif;'>Loading Exam...</div>";

        // ২. অবশ্যই POST মেথড ব্যবহার করতে হবে
        fetch(VALIDATION_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                key: apiKey, 
                domain: window.location.hostname,
                userAgent: navigator.userAgent
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.examUrl) {
                container.innerHTML = `<iframe src="${data.examUrl}" width="100%" height="600px" frameborder="0" style="border-radius:8px; border:1px solid #eee;"></iframe>`;
            } else {
                container.innerHTML = `<div style="color:red; padding:20px; border:1px solid red; border-radius:8px;">${data.error || 'Access Denied'}</div>`;
            }
        })
        .catch(err => {
            console.error("EXAMio Error:", err);
            container.innerHTML = "<div style='color:red; padding:20px;'>Connection Error. Please check console.</div>";
        });
    };

    // DOM লোড হওয়ার পর রান হবে
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
