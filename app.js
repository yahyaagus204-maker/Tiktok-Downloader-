const BASE_URL = "https://web-production-1dbae.up.railway.app";

const input = document.getElementById("url");
const box = document.getElementById("previewBox");
const result = document.getElementById("result");

let timeout;

// =======================
// AUTO PREVIEW (ANTI SPAM)
// =======================
input.addEventListener("input", () => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    const url = input.value.trim();

    if (!url) {
      box.innerHTML = "";
      return;
    }

    if (!url.includes("tiktok")) return;

    preview(url);
  }, 700);
});

// =======================
// PREVIEW FUNCTION
// =======================
async function preview(url) {

  box.innerHTML = `
    <div class="card" style="padding:20px; opacity:.7;">
      ⚡ Loading preview...
    </div>
  `;

  try {
    const res = await fetch(`${BASE_URL}/info?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (data.error) {
      box.innerHTML = `<p style="color:red;">❌ ${data.error}</p>`;
      return;
    }

    box.innerHTML = `
      <div class="card" style="margin-top:20px; overflow:hidden;">
        <img src="${data.thumbnail}" style="width:100%; border-radius:12px;">

        <div style="padding:15px; text-align:left;">
          <h3 style="font-size:16px;">${data.title}</h3>
          <p style="opacity:.7; margin-top:5px;">👤 ${data.author}</p>
          <p style="opacity:.7;">⏱ ${data.duration}s</p>
        </div>
      </div>
    `;

  } catch (err) {
    box.innerHTML = `<p style="color:red;">❌ Preview gagal</p>`;
  }
}

// =======================
// DOWNLOAD FUNCTION
// =======================
function download(type) {

  const url = input.value.trim();

  if (!url) {
    result.innerHTML = "❌ Masukkan link dulu";
    return;
  }

  const endpoint =
    type === "mp4"
      ? `${BASE_URL}/download`
      : `${BASE_URL}/audio`;

  result.innerHTML = "⚡ Processing download...";

  window.location.href = `${endpoint}?url=${encodeURIComponent(url)}`;
}
