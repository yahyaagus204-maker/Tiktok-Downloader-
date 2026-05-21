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

    // =========================
    // SLIDESHOW MODE
    // =========================
    if (data.type === "slideshow") {

      box.innerHTML = `
        <div class="previewCard">
          <h3 style="padding:10px;">🖼️ Slideshow Detected</h3>

          <div class="slider" id="slider"></div>
        </div>
      `;

      const slider = document.getElementById("slider");

      data.images.forEach((img, i) => {

        const item = document.createElement("div");
        item.className = "slide-item";

        item.innerHTML = `
          <img src="${img}" />
          <button onclick="downloadImage('${img}', ${i})">
            ⬇ Download
          </button>
        `;

        slider.appendChild(item);
      });

      return;
    }

    // =========================
    // VIDEO MODE (NORMAL TIKTOK)
    // =========================
    box.innerHTML = `
      <div class="previewCard">

        <img src="${data.thumbnail}" class="thumb" />

        <div style="padding:15px; text-align:left;">
          <h3 style="font-size:16px;">${data.title}</h3>

          <p class="meta">👤 ${data.author}</p>
          <p class="meta">⏱ ${data.duration}s</p>
        </div>

      </div>
    `;

  } catch (err) {
    console.log(err);
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


function downloadImage(url, i){
  const a = document.createElement("a");
  a.href = url;
  a.download = `toksnap_${i}.jpg`;
  a.click();
}
