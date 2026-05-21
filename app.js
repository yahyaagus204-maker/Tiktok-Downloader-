const BASE_URL = "https://web-production-1dbae.up.railway.app";

async function download(type) {
  const url = document.getElementById("url").value;
  const result = document.getElementById("result");

  if (!url) {
    result.innerHTML = "❌ Masukkan link dulu";
    return;
  }

  result.innerHTML = "⚡ Processing...";

  const endpoint =
    type === "mp4"
      ? `${BASE_URL}/download`
      : `${BASE_URL}/audio`;

  window.location.href =
    `${endpoint}?url=${encodeURIComponent(url)}`;
}


// PREVIEW
async function preview() {

  const url = document.getElementById("url").value;
  const box = document.getElementById("previewBox");

  if (!url) {
    box.innerHTML = "❌ Masukkan link dulu";
    return;
  }

  box.innerHTML = `
  <div class="previewCard">
    <div style="padding:30px">
      ⚡ Fetching TikTok preview...
    </div>
  </div>
`;

  try {

    const res = await fetch(
      `${BASE_URL}/info?url=${encodeURIComponent(url)}`
    );

    const data = await res.json();

    if (data.error) {
      box.innerHTML = `❌ ${data.error}`;
      return;
    }

    box.innerHTML = `
      <div class="previewCard">
        <img src="${data.thumbnail}" class="thumb">

        <h3>${data.title}</h3>

        <p class="meta">👤 ${data.author}</p>

        <p class="meta">⏱ ${data.duration}s</p>
      </div>
    `;
    
    box.scrollIntoView({
  behavior: "smooth"
});

  } catch (e) {

    console.log(e);

    box.innerHTML = "❌ Preview gagal";
  }
}

const input = document.getElementById("url");

let previewTimeout;

input.addEventListener("input", () => {

  clearTimeout(previewTimeout);

  // delay sedikit biar tidak spam request
  previewTimeout = setTimeout(() => {

    if (input.value.includes("tiktok")) {
      preview();
    }

  }, 800);

});
