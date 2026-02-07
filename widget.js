(function() {
    const API_URL = 'https://lvjtqqnxtrbxeozjrsku.supabase.co/functions/v1/validate';
    
    const container = document.getElementById('examio-widget');
    if (!container) return;

    const apiKey = container.getAttribute('data-key');
    if (!apiKey) {
        container.innerHTML = '<div style="color:red;padding:20px;">Missing API key</div>';
        return;
    }

    container.innerHTML = '<div style="text-align:center;padding:40px;">Loading...</div>';

    fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            apiKey: apiKey,
            domain: window.location.hostname
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            container.innerHTML = '<iframe src="' + data.examUrl + '" style="width:100%;height:600px;border:none;"></iframe>';
        } else {
            container.innerHTML = '<div style="color:red;padding:20px;">' + data.error + '</div>';
        }
    })
    .catch(err => {
        container.innerHTML = '<div style="color:red;padding:20px;">Connection failed</div>';
    });
})();

