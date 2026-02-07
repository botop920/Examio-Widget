
// ============================================================
// EXAMIO.XYZ - Exam Widget v2.0
// Hosted at: https://examio-widget.vercel.app/widget.js
//
// Usage on client website:
// <div id="examio-widget" data-batch="BATCH_TOKEN_HERE"></div>
// <script src="https://examio-widget.vercel.app/widget.js"></script>
//
// Options (data attributes):
//   data-batch     = batch token (REQUIRED)
//   data-height    = iframe height (default: 650px)
//   data-radius    = border radius (default: 12px)
//   data-theme     = light | dark (default: light)
//   data-id        = custom container id (default: examio-widget)
// ============================================================

(function () {
  "use strict";

  // ========== CONFIG ==========
  // Main app URL (where the exam actually runs)
  var EXAMIO_APP = "https://www.examio.xyz";

  // Container ID
  var CONTAINER_ID = "examio-widget";

  // ========== FIND CONTAINER ==========
  var container = document.getElementById(CONTAINER_ID);

  // If default id not found, try all elements with data-batch
  if (!container) {
    var allDivs = document.querySelectorAll("[data-batch]");
    for (var i = 0; i < allDivs.length; i++) {
      if (allDivs[i].getAttribute("data-batch")) {
        container = allDivs[i];
        break;
      }
    }
  }

  if (!container) {
    console.error(
      "[Examio] ❌ Widget container not found! Add: <div id=\"examio-widget\" data-batch=\"YOUR_TOKEN\"></div>"
    );
    return;
  }

  // ========== READ OPTIONS ==========
  var batchToken = container.getAttribute("data-batch");
  var height = container.getAttribute("data-height") || "650px";
  var radius = container.getAttribute("data-radius") || "12px";
  var theme = container.getAttribute("data-theme") || "light";

  if (!batchToken) {
    container.innerHTML =
      '<div style="padding:24px;text-align:center;color:#e74c3c;' +
      'font-family:-apple-system,sans-serif;background:#fff5f5;' +
      'border-radius:12px;border:1px solid #fed7d7;">' +
      '<div style="font-size:28px;margin-bottom:8px;">⚠️</div>' +
      "<strong>Examio Widget Error</strong><br>" +
      '<span style="font-size:13px;color:#888;">Missing <code>data-batch</code> attribute</span>' +
      "</div>";
    return;
  }

  // ========== BUILD EMBED URL ==========
  // Current website's hostname (the client's domain)
  var currentHost = window.location.hostname || "";
  var currentOrigin = window.location.origin || "";

  var embedUrl =
    EXAMIO_APP +
    "/?batch_token=" + encodeURIComponent(batchToken) +
    "&embed=true" +
    "&theme=" + encodeURIComponent(theme) +
    "&host=" + encodeURIComponent(currentHost) +
    "&origin=" + encodeURIComponent(currentOrigin) +
    "&t=" + Date.now(); // cache bust

  // ========== INJECT STYLES ==========
  var styleEl = document.createElement("style");
  styleEl.textContent =
    "@keyframes examio-spin{to{transform:rotate(360deg)}}" +
    "@keyframes examio-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}" +
    ".examio-container{position:relative;width:100%;max-width:100%;}" +
    ".examio-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "height:" + height + ";background:#f8f9fa;border-radius:" + radius + ";" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
    "animation:examio-fade 0.3s ease;}" +
    ".examio-spinner{width:28px;height:28px;border:3px solid #e8e8e8;" +
    "border-top-color:#6c5ce7;border-radius:50%;" +
    "animation:examio-spin 0.7s linear infinite;margin-bottom:12px;}" +
    ".examio-iframe{width:100%;border:none;border-radius:" + radius + ";" +
    "box-shadow:0 2px 16px rgba(0,0,0,0.08);display:none;" +
    "animation:examio-fade 0.4s ease;}" +
    ".examio-brand{text-align:center;padding:8px 0;font-size:11px;color:#bbb;" +
    "font-family:-apple-system,sans-serif;}" +
    ".examio-brand a{color:#6c5ce7;text-decoration:none;font-weight:600;}" +
    ".examio-brand a:hover{text-decoration:underline;}" +
    ".examio-error{padding:40px 20px;text-align:center;font-family:-apple-system,sans-serif;" +
    "background:#fff5f5;border-radius:" + radius + ";border:1px solid #fed7d7;" +
    "animation:examio-fade 0.3s ease;}";
  document.head.appendChild(styleEl);

  // ========== CREATE LOADING STATE ==========
  container.innerHTML = "";
  container.className = "examio-container";

  var loader = document.createElement("div");
  loader.className = "examio-loader";
  loader.setAttribute("id", "examio-loader-" + batchToken);

  var spinner = document.createElement("div");
  spinner.className = "examio-spinner";
  loader.appendChild(spinner);

  var loadText = document.createElement("div");
  loadText.style.cssText = "color:#6c5ce7;font-size:14px;font-weight:500;";
  loadText.textContent = "Loading Exam...";
  loader.appendChild(loadText);

  var loadSub = document.createElement("div");
  loadSub.style.cssText = "color:#aaa;font-size:11px;margin-top:4px;";
  loadSub.textContent = "Verifying access...";
  loader.appendChild(loadSub);

  container.appendChild(loader);

  // ========== CREATE IFRAME ==========
  var iframe = document.createElement("iframe");
  iframe.src = embedUrl;
  iframe.className = "examio-iframe";
  iframe.style.height = height;
  iframe.setAttribute("allow", "clipboard-write; autoplay");
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("title", "Online Exam - Powered by Examio.xyz");
  iframe.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
  );

  // Timeout - if iframe doesn't load in 15s
  var loadTimeout = setTimeout(function () {
    showError("Connection timeout. Please refresh the page.");
  }, 15000);

  // When iframe loads
  iframe.onload = function () {
    clearTimeout(loadTimeout);
    // Don't hide loader yet - wait for EXAMIO_READY message
    // (gives time for security check inside iframe)
    loadSub.textContent = "Almost ready...";
  };

  iframe.onerror = function () {
    clearTimeout(loadTimeout);
    showError("Failed to load exam. Please try again.");
  };

  container.appendChild(iframe);

  // ========== ERROR DISPLAY ==========
  function showError(msg) {
    loader.style.display = "none";
    iframe.style.display = "none";

    var errDiv = document.createElement("div");
    errDiv.className = "examio-error";
    errDiv.innerHTML =
      '<div style="font-size:36px;margin-bottom:12px;">🛡️</div>' +
      '<div style="font-size:16px;font-weight:600;color:#e53e3e;margin-bottom:8px;">' +
      "Access Denied</div>" +
      '<div style="font-size:13px;color:#666;max-width:350px;margin:0 auto;line-height:1.5;">' +
      msg +
      "</div>" +
      '<div style="font-size:11px;color:#aaa;margin-top:16px;">Protected by Examio.xyz</div>';
    container.appendChild(errDiv);
  }

  // ========== LISTEN FOR MESSAGES FROM IFRAME ==========
  window.addEventListener("message", function (event) {
    // SECURITY: Only accept messages from examio.xyz
    try {
      var eventOrigin = event.origin || "";
      if (eventOrigin.indexOf("examio.xyz") === -1) return;
    } catch (e) {
      return;
    }

    var data = event.data;
    if (!data || typeof data !== "object" || !data.type) return;

    // Make sure it's for this batch
    if (data.batchToken && data.batchToken !== batchToken) return;

    switch (data.type) {
      case "EXAMIO_READY":
        // Exam loaded & verified successfully
        clearTimeout(loadTimeout);
        loader.style.display = "none";
        iframe.style.display = "block";
        console.log("[Examio] ✅ Exam loaded successfully");
        break;

      case "EXAMIO_BLOCKED":
        // Access denied by security check
        clearTimeout(loadTimeout);
        var reason = data.reason || "This website is not authorized.";
        var reasonMsg = {
          NO_LICENSE:
            "এই ওয়েবসাইট থেকে exam access এর অনুমতি নেই।\nলাইসেন্স নিতে examio.xyz এ যোগাযোগ করুন।",
          INACTIVE:
            "এই ওয়েবসাইটের লাইসেন্স নিষ্ক্রিয় করা হয়েছে।",
          EXPIRED:
            "এই ওয়েবসাইটের লাইসেন্সের মেয়াদ শেষ।\nরিনিউ করতে examio.xyz এ যোগাযোগ করুন।",
          DIRECT_ACCESS:
            "সরাসরি access অনুমোদিত নয়।",
          NO_REFERRER:
            "আপনার ব্রাউজার থেকে verify করা যায়নি।",
        };
        showError(reasonMsg[reason] || reason);
        console.warn("[Examio] 🚫 Blocked:", reason);
        break;

      case "EXAMIO_RESIZE":
        // Auto resize iframe
        if (data.height && typeof data.height === "number") {
          iframe.style.height = Math.max(400, Math.min(data.height, 5000)) + "px";
        }
        break;

      case "EXAMIO_EXAM_SUBMITTED":
        // Exam submitted by student
        console.log("[Examio] 📝 Exam submitted");
        // Dispatch custom event so client website can listen
        try {
          var customEvent = new CustomEvent("examio:submitted", {
            detail: data.payload || {},
          });
          window.dispatchEvent(customEvent);
        } catch (e) {
          // IE fallback
        }
        break;

      case "EXAMIO_THEME":
        // Theme update from iframe
        if (data.background) {
          container.style.background = data.background;
        }
        break;
    }
  });

  // ========== BRANDING ==========
  var branding = document.createElement("div");
  branding.className = "examio-brand";
  branding.innerHTML =
    'Powered by <a href="https://www.examio.xyz" target="_blank" rel="noopener">Examio.xyz</a>';
  container.appendChild(branding);

  // ========== DONE ==========
  console.log(
    "[Examio] 🚀 Widget v2.0 initialized" +
    "\n  Batch: " + batchToken +
    "\n  Host: " + currentHost +
    "\n  App: " + EXAMIO_APP
  );
})();
