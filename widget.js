(async () => {

  const scripts = document.getElementsByTagName("script");
  const script = scripts[scripts.length - 1];

  const embedToken = script.getAttribute("data-embed-token");
  const batchToken = script.getAttribute("data-batch-token");

  if (!embedToken || !batchToken) {
    console.error("Missing embed configuration ❌");
    return;
  }

  try {

    const res = await fetch(
      "https://lvjtqqnxtrbxeozjrsku.supabase.co/functions/v1/verify-embed",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: embedToken,
          batch_token: batchToken,
          referrer: window.location.href
        })
      }
    );

    const data = await res.json();

    if (!data.success) {
      console.error("Access denied ❌");
      return;
    }

    const iframe = document.createElement("iframe");

    iframe.src =
      `https://www.examio.xyz/?batch_token=${batchToken}&embed=true`;

    iframe.style.width = "100%";
    iframe.style.height = "800px";
    iframe.style.border = "none";

    script.parentNode.insertBefore(iframe, script);

  } catch {
    console.error("Widget load error ❌");
  }

})();
