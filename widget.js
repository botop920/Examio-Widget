// ============================================================
// EXAMIO.XYZ - Exam Widget v2.0
// Hosted at: https://examio-widget.vercel.app/widget.js
//
// Usage:
// <div id="examio-widget"
//      data-key="pk_live_12345sample"
//      data-batch="BATCH_TOKEN">
// </div>
// <script src="https://examio-widget.vercel.app/widget.js"></script>
// ============================================================

(function () {
  "use strict";

  var EXAMIO_APP = "https://www.examio.xyz";
  var CONTAINER_ID = "examio-widget";

  // ===== FIND CONTAINER =====
  var container = document.getElementById(CONTAINER_ID);

  if (!container) {
    var allDivs = document.querySelectorAll("[data-key]");
    for (var i = 0; i < allDivs.length; i++) {
      if (allDivs[i].getAttribute("data-key")) {
        container = allDivs[i];
        break;
      }
    }
  }

  if (!container) {
    console.error(
      '[Examio] Container not found. Add: <div id="examio-widget" data-key="YOUR_KEY" data-batch="YOUR_TOKEN"></div>'
    );
    return;
  }

  // ===== READ CONFIG =====
  var apiKey = container.getAttribute("data-key");
  var batchToken = container.getAttribute("data-batch");
  var height = container.getAttribute("data-height") || "650px";
  var radius = container.getAttribute("data-radius") || "12px";
  var theme = container.getAttribute("data-theme") || "light";

  if (!apiKey || !batchToken) {
    container.innerHTML =
      '<div style="padding:24px;text-align:center;color:#e74c3c;' +
      "font-family:-apple-system,sans-serif;background:#fff5f5;" +
      'border-radius:12px;border:1px solid #fed7d7;">' +
      '<div style="font-size:28px;margin-bottom:8px;">⚠️</div>' +
      "<strong>Examio Widget Error</strong><br>" +
      '<span style="font-size:13px;color:#888;">' +
      (!apiKey
        ? "Missing <code>data-key</code>"
        : "Missing <code>data-batch</code>") +
      " attribute</span></div>";
    return;
  }

  // ===== BUILD EMBED URL =====
  var currentHost = window.location.hostname || "";
  var currentOrigin = window.location.origin || "";

  var embedUrl =
    EXAMIO_APP +
    "/?batch_token=" +
    encodeURIComponent(batchToken) +
    "&api_key=" +
    encodeURIComponent(apiKey) +
    "&embed=true" +
    "&theme=" +
    encodeURIComponent(theme) +
    "&host=" +
    encodeURIComponent(currentHost) +
    "&origin=" +
    encodeURIComponent(currentOrigin) +
    "&t=" +
    Date.now();

  // ===== STYLES =====
  var styleEl = document.createElement("style");
  styleEl.textContent =
    "@keyframes examio-spin{to{transform:rotate(360deg)}}" +
    "@keyframes examio-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}";
  document.head.appendChild(styleEl);

  // ===== LOADER =====
  container.innerHTML = "";
  container.style.cssText = "position:relative;width:100%;max-width:100%;";

  var loader = document.createElement("div");
  loader.setAttribute("id", "examio-loader");
  loader.style.cssText =
    "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "height:" +
    height +
    ";background:#f8f9fa;border-radius:" +
    radius +
    ";" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
    "animation:examio-fade 0.3s ease;";

  var spinner = document.createElement("div");
  spinner.style.cssText =
    "width:28px;height:28px;border:3px solid #e8e8e8;" +
    "border-top-color:#6c5ce7;border-radius:50%;" +
    "animation:examio-spin 0.7s linear infinite;margin-bottom:12px;";
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

  // ===== IFRAME =====
  var iframe = document.createElement("iframe");
  iframe.src = embedUrl;
  iframe.style.cssText =
    "width:100%;height:" +
    height +
    ";border:none;" +
    "border-radius:" +
    radius +
    ";" +
    "box-shadow:0 2px 16px rgba(0,0,0,0.08);" +
    "display:none;animation:examio-fade 0.4s ease;";
  iframe.setAttribute("allow", "clipboard-write; autoplay");
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("title", "Online Exam - Powered by Examio.xyz");
  iframe.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
  );

  var loadTimeout = setTimeout(function () {
    showError("Connection timeout. Please refresh the page.");
  }, 15000);

  iframe.onload = function () {
    clearTimeout(loadTimeout);
    loadSub.textContent = "Almost ready...";
  };

  iframe.onerror = function () {
    clearTimeout(loadTimeout);
    showError("Failed to load exam. Please try again.");
  };

  container.appendChild(iframe);

  // ===== ERROR SCREEN =====
  function showError(msg) {
    loader.style.display = "none";
    iframe.style.display = "none";

    var existing = container.querySelector(".examio-err");
    if (existing) existing.remove();

    var errDiv = document.createElement("div");
    errDiv.className = "examio-err";
    errDiv.style.cssText =
      "padding:40px 20px;text-align:center;font-family:-apple-system,sans-serif;" +
      "background:#fff5f5;border-radius:" +
      radius +
      ";border:1px solid #fed7d7;" +
      "animation:examio-fade 0.3s ease;";
    errDiv.innerHTML =
      '<div style="font-size:36px;margin-bottom:12px;">🛡️</div>' +
      '<div style="font-size:16px;font-weight:600;color:#e53e3e;margin-bottom:8px;">Access Denied</div>' +
      '<div style="font-size:13px;color:#666;max-width:350px;margin:0 auto;line-height:1.6;white-space:pre-line;">' +
      msg +
      "</div>" +
      '<div style="font-size:11px;color:#aaa;margin-top:16px;">Protected by Examio.xyz</div>';
    container.appendChild(errDiv);
  }

  // ===== LISTEN FOR MESSAGES FROM IFRAME =====
  window.addEventListener("message", function (event) {
    try {
      if (event.origin.indexOf("examio.xyz") === -1) return;
    } catch (e) {
      return;
    }

    var data = event.data;
    if (!data || typeof data !== "object" || !data.type) return;

    switch (data.type) {
      case "EXAMIO_READY":
        clearTimeout(loadTimeout);
        loader.style.display = "none";
        iframe.style.display = "block";
        console.log("[Examio] ✅ Exam loaded successfully");
        break;

      case "EXAMIO_BLOCKED":
        clearTimeout(loadTimeout);
        var reasonMessages = {
          NO_LICENSE:
            "এই ওয়েবসাইট থেকে exam access এর অনুমতি নেই।\nলাইসেন্স নিতে examio.xyz এ যোগাযোগ করুন।",
          INACTIVE: "এই ওয়েবসাইটের লাইসেন্স নিষ্ক্রিয় করা হয়েছে।",
          EXPIRED:
            "এই ওয়েবসাইটের লাইসেন্সের মেয়াদ শেষ।\nরিনিউ করতে examio.xyz এ যোগাযোগ করুন।",
          BATCH_NOT_ALLOWED:
            "এই exam টি আপনার লাইসেন্সে অন্তর্ভুক্ত নয়।",
          DIRECT_ACCESS: "সরাসরি access অনুমোদিত নয়।",
          NO_REFERRER: "আপনার ব্রাউজার থেকে verify করা যায়নি।",
          INVALID_KEY: "API key সঠিক নয়।",
        };
        var msg =
          reasonMessages[data.reason] || data.reason || "Access denied.";
        showError(msg);
        console.warn("[Examio] 🚫 Blocked:", data.reason);
        break;

      case "EXAMIO_RESIZE":
        if (data.height && typeof data.height === "number") {
          iframe.style.height =
            Math.max(400, Math.min(data.height, 5000)) + "px";
        }
        break;

      case "EXAMIO_EXAM_SUBMITTED":
        console.log("[Examio] 📝 Exam submitted");
        try {
          window.dispatchEvent(
            new CustomEvent("examio:submitted", {
              detail: data.payload || {},
            })
          );
        } catch (e) {}
        break;
    }
  });

  // ===== BRANDING =====
  var branding = document.createElement("div");
  branding.style.cssText =
    "text-align:center;padding:8px 0;font-size:11px;color:#bbb;font-family:-apple-system,sans-serif;";
  branding.innerHTML =
    'Powered by <a href="https://www.examio.xyz" target="_blank" rel="noopener" style="color:#6c5ce7;text-decoration:none;font-weight:600;">Examio.xyz</a>';
  container.appendChild(branding);

  console.log(
    "[Examio] 🚀 Widget v2.0 | Key: " +
      apiKey.substring(0, 10) +
      "... | Host: " +
      currentHost
  );
})();
