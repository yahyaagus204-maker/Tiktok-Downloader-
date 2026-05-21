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
async function preview() {
  const url = document.getElementById("url").value;
  const box = document.getElementById("previewBox");

  if (!url) {
    box.innerHTML = "❌ Masukkan link dulu";
    return;
  }

  box.innerHTML = `<div class="card">⚡ Loading...</div>`;

  try {
    const res = await fetch(`${BASE_URL}/info?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (data.error) {
      box.innerHTML = `<p style="color:red;">❌ ${data.error}</p>`;
      return;
    }

    // SLIDESHOW HANDLER
    if (data.images && data.images.length > 1) {

      box.innerHTML = `
        <div class="card">
          <h3>${data.title}</h3>
          <p>${data.author}</p>

          <div id="slider" style="overflow-x:auto; display:flex; gap:10px; margin-top:10px;">
            ${data.images.map(img => `
              <img src="${img}" style="width:200px; border-radius:10px;">
            `).join("")}
          </div>

          <p style="margin-top:10px; opacity:.7;">
            👉 Geser kanan kiri untuk pilih gambar
          </p>
        </div>
      `;

    } else {

      box.innerHTML = `
        <div class="card">
          <img src="${data.thumbnail}" style="width:100%; border-radius:10px;">
          <h3>${data.title}</h3>
          <p>${data.author}</p>
        </div>
      `;
    }

  } catch (e) {
    box.innerHTML = "❌ Preview gagal";
  }
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
