(function() {
    const VALIDATION_ENDPOINT = 'https://lvjtqqnxtrbxeozjrsku.supabase.co/functions/v1/smooth-worker';
    const container = document.getElementById('examio-widget');
    if (!container) return;

    const apiKey = container.getAttribute('data-key');
    if (!apiKey) {
        container.innerHTML = "Error: Missing data-key";
        return;
    }

    // স্টাইল লোড করা
    container.innerHTML = "<div style='text-align:center; padding:20px;'>Examio Loading...</div>";

    // ডাটা প্যারামিটার হিসেবে সাজানো
    const params = new URLSearchParams({
        key: apiKey,
        domain: window.location.hostname
    }).toString();

    // GET মেথড ব্যবহার করা (সবচেয়ে সেফ পদ্ধতি)
    fetch(`${VALIDATION_ENDPOINT}?${params}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.examUrl) {
            container.innerHTML = `<iframe src="${data.examUrl}" width="100%" height="600px" frameborder="0" style="border-radius:8px; border:1px solid #eee;"></iframe>`;
        } else {
            container.innerHTML = `<div style="color:red; padding:20px;">${data.error || 'Access Denied'}</div>`;
        }
    })
    .catch(err => {
        container.innerHTML = "<div style='color:red; padding:20px;'>Connection Failed</div>";
    });
})();
