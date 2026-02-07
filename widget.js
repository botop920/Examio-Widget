
// ============================================================
// EXAMIO.XYZ - Exam Widget v1.0
// 
// Usage:
// <div id="examio-widget" data-batch="BATCH_TOKEN_HERE"></div>
// <script src="https://www.examio.xyz/widget.js"></script>
//
// Options (data attributes):
//   data-batch     = batch token (required)
//   data-height    = iframe height (default: 650px)
//   data-radius    = border radius (default: 12px)
//   data-theme     = light | dark (default: light)
// ============================================================

(function () {
  "use strict";

  // ---------- Config ----------
  var EXAMIO_BASE = "https://www.examio.xyz";
  var CONTAINER_ID = "examio-widget";

  // ---------- Find Container ----------
  var container = document.getElementById(CONTAINER_ID);

  if (!container) {
    console.error("[Examio] ❌ Element with id='examio-widget' not found!");
    return;
  }

  // ---------- Read Options ----------
  var batchToken = container.getAttribute("data-batch");
  var height = container.getAttribute("data-height") || "650px";
  var radius = container.getAttribute("data-radius") || "12px";
  var theme = container.getAttribute("data-theme") || "light";

  if (!batchToken) {
    container.innerHTML =
      '<div style="padding:20px;text-align:center;color:#e74c3c;font-family:sans-serif;">' +
      '❌ Examio Widget Error: <code>data-batch</code> attribute is missing!' +
      "</div>";
    return;
  }

  // ---------- Build URL ----------
  var embedUrl =
    EXAMIO_BASE +
    "/?batch_token=" + encodeURIComponent(batchToken) +
    "&embed=true" +
    "&theme=" + encodeURIComponent(theme) +
    "&origin=" + encodeURIComponent(window.location.hostname);

  // ---------- Create Loading State ----------
  container.innerHTML = "";
  container.style.position = "relative";
  container.style.width = "100%";
  container.style.maxWidth = "100%";

  var loader = document.createElement("div");
  loader.setAttribute("id", "examio-loader");
  loader.style.cssText =
    "display:flex;align-items:center;justify-content:center;" +
    "height:" + height + ";background:#f8f9fa;border-radius:" + radius + ";" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
    "color:#6c5ce7;font-size:15px;gap:10px;";

  // Spinner
  var spinner = document.createElement("div");
  spinner.style.cssText =
    "width:24px;height:24px;border:3px solid #e0e0e0;" +
    "border-top-color:#6c5ce7;border-radius:50%;" +
    "animation:examio-spin 0.7s linear infinite;";
  loader.appendChild(spinner);

  var loadText = document.createElement("span");
  loadText.textContent = "Loading Exam...";
  loader.appendChild(loadText);

  container.appendChild(loader);

  // Spinner animation
  var style = document.createElement("style");
  style.textContent =
    "@keyframes examio-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(style);

  // ---------- Create Iframe ----------
  var iframe = document.createElement("iframe");
  iframe.src = embedUrl;
  iframe.style.cssText =
    "width:100%;height:" + height + ";border:none;" +
    "border-radius:" + radius + ";" +
    "box-shadow:0 2px 12px rgba(0,0,0,0.08);" +
    "display:none;"; // initially hidden
  iframe.setAttribute("allow", "clipboard-write");
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("title", "Online Exam - Powered by Examio");
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");

  // When iframe loads, hide loader and show iframe
  iframe.onload = function () {
    var loaderEl = document.getElementById("examio-loader");
    if (loaderEl) loaderEl.style.display = "none";
    iframe.style.display = "block";
  };

  container.appendChild(iframe);

  // ---------- Listen for messages from iframe ----------
  window.addEventListener("message", function (event) {
    // Only accept messages from examio
    if (event.origin !== EXAMIO_BASE) return;

    var data = event.data;

    if (!data || !data.type) return;

    switch (data.type) {
      case "EXAMIO_RESIZE":
        // Auto-resize iframe height
        if (data.height) {
          iframe.style.height = data.height + "px";
        }
        break;

      case "EXAMIO_BLOCKED":
        // Access blocked
        container.innerHTML =
          '<div style="padding:40px 20px;text-align:center;font-family:sans-serif;' +
          "background:#fff5f5;border-radius:" + radius + ";border:1px solid #fed7d7;\">" +
          '<div style="font-size:40px;margin-bottom:12px;">🛡️</div>' +
          '<div style="font-size:16px;font-weight:600;color:#e53e3e;margin-bottom:8px;">' +
          "Access Denied</div>" +
          '<div style="font-size:13px;color:#888;">This exam is not authorized for this website.</div>' +
          '<div style="font-size:11px;color:#aaa;margin-top:12px;">Powered by Examio.xyz</div>' +
          "</div>";
        break;

      case "EXAMIO_READY":
        // Exam loaded successfully
        console.log("[Examio] ✅ Exam widget loaded successfully");
        break;

      case "EXAMIO_EXAM_SUBMITTED":
        // Student submitted exam
        console.log("[Examio] 📝 Exam submitted:", data.payload);
        // Client can listen: window.addEventListener('message', ...)
        break;
    }
  });

  // ---------- Watermark / Branding ----------
  var branding = document.createElement("div");
  branding.style.cssText =
    "text-align:center;padding:6px 0;font-size:11px;color:#bbb;" +
    "font-family:-apple-system,sans-serif;";
  branding.innerHTML =
    'Powered by <a href="https://www.examio.xyz" target="_blank" ' +
    'style="color:#6c5ce7;text-decoration:none;font-weight:500;">Examio.xyz</a>';
  container.appendChild(branding);

  console.log("[Examio] 🚀 Widget initialized for batch:", batchToken);
})();
