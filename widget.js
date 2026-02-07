(async function () {

  const scriptTag = document.currentScript;
  const token = scriptTag.getAttribute("data-token");

  const referrer = document.referrer;

  if (!token || !referrer) {
    console.error("Access denied");
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
        token,
        referrer,
      }),
    }
  );

  const data = await res.json();

  if (!data.allow) {
    console.error("Embed not allowed");
    return;
  }

  // ✅ Allowed হলে widget load করো
  const iframe = document.createElement("iframe");
  iframe.src = "https://examio.xyz/embed-exam";
  iframe.style.width = "100%";
  iframe.style.height = "600px";
  iframe.style.border = "none";

  scriptTag.parentNode.insertBefore(iframe, scriptTag);

})();
