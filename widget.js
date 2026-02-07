(async function () {

  const scripts = document.getElementsByTagName("script");
  const scriptTag = scripts[scripts.length - 1];

  const embedToken = scriptTag.getAttribute("data-embed-token");
  const batchToken = scriptTag.getAttribute("data-batch-token");

  const referrer = document.referrer;

  if (!embedToken || !batchToken || !referrer) {
    console.error("Examio: Access denied");
    return;
  }

  const res = await fetch(
    "https://lvjtqqnxtrbxeozjrsku.supabase.co/functions/v1/verify-embed",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: embedToken,
        referrer,
      }),
    }
  );

  const data = await res.json();

  if (!data.allow) {
    console.error("Examio: Embed not allowed");
    return;
  }

  const iframe = document.createElement("iframe");

  iframe.src = `https://www.examio.xyz/?batch_token=${batchToken}&embed=true`;

  iframe.style.width = "100%";
  iframe.style.height = "700px";
  iframe.style.border = "none";

  scriptTag.parentNode.insertBefore(iframe, scriptTag);

})();
