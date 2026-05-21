const BASE_URL = "https://web-production-1dbae.up.railway.app";

// DOWNLOAD
function download(type) {
  const url = document.getElementById("url").value;

  if (!url) return alert("Masukkan link dulu");

  window.location.href =
    `${BASE_URL}/download?url=${encodeURIComponent(url)}&type=${type}`;
}

// PREVIEW
async function preview() {
  const url = document.getElementById("url").value;
  const box = document.getElementById("previewBox");

  if (!url) {
    box.innerHTML = "❌ Masukkan link dulu";
    return;
  }

  box.innerHTML = "⚡ Loading...";

  try {
    const res = await fetch(`${BASE_URL}/info?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (data.error) {
      box.innerHTML = `<p style="color:red;">❌ ${data.error}</p>`;
      return;
    }

    // SLIDESHOW
    if (data.images && data.images.length > 1) {
      box.innerHTML = `
        <div class="previewCard">
          <h3>${data.title}</h3>
          <p>${data.author}</p>

          <div style="display:flex; overflow-x:auto; gap:10px;">
            ${data.images.map(img => `
              <img src="${img}" style="width:200px; border-radius:10px;">
            `).join("")}
          </div>

          <p style="opacity:.6;">👉 Geser kanan kiri</p>
        </div>
      `;
    }

    // VIDEO
    else {
      box.innerHTML = `
        <div class="previewCard">
          <img src="${data.thumbnail}">
          <h3>${data.title}</h3>
          <p>${data.author}</p>
        </div>
      `;
    }

  } catch (e) {
    box.innerHTML = "❌ Preview gagal";
  }
}

// AUTO PREVIEW
const input = document.getElementById("url");

let t;
input.addEventListener("input", () => {
  clearTimeout(t);
  t = setTimeout(() => {
    if (input.value.includes("tiktok")) {
      preview();
    }
  }, 800);
});
