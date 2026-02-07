(async function () {

  console.log("Examio widget loaded");

  const scriptTag = document.currentScript;

  console.log("Script tag:", scriptTag);

  const embedToken = scriptTag?.getAttribute("data-embed-token");
  const batchToken = scriptTag?.getAttribute("data-batch-token");

  console.log("Embed token:", embedToken);
  console.log("Batch token:", batchToken);

  const referrer = document.referrer;

  console.log("Referrer:", referrer);

  if (!embedToken || !batchToken || !referrer) {
    console.error("Examio: Access denied early");
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

  console.log("Verify result:", data);

  if (!data.allow) {
    console.error("Examio: Embed not allowed");
    return;
  }

  console.log("Creating iframe...");

  const iframe = document.createElement("iframe");

  iframe.src = `https://www.examio.xyz/?batch_token=${batchToken}&embed=true`;

  iframe.style.width = "100%";
  iframe.style.height = "700px";
  iframe.style.border = "none";

  document.body.appendChild(iframe);

})();
