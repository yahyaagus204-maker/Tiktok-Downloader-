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

      <div class="slideHeader">
        <h3>${data.title}</h3>
        <p>${data.author}</p>
      </div>

      <div class="galleryWrapper">

        <div class="gallery" id="gallery">

          ${data.images.map((img, index) => `

            <div class="slideItem">

              <img
                src="${img}"
                class="slideImage"
              >

              <button
                class="downloadImageBtn"
                onclick="downloadImage('${img}', ${index})"
              >
                ⬇ Download HD
              </button>

            </div>

          `).join("")}

        </div>

      </div>

      <div class="dots">
        ${data.images.map((_, i) => `
          <div class="dot ${i === 0 ? 'activeDot' : ''}"></div>
        `).join("")}
      </div>

      <p class="slideHint">
        👉 Swipe kiri kanan
      </p>

    </div>
  `;

  initSlider();
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


async function downloadImage(url, index) {

  try {

    const response = await fetch(url);

    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = blobUrl;

    a.download = `toksnap-hd-${index + 1}.jpg`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(blobUrl);

  } catch (err) {

    alert("Gagal download gambar");

  }
}

function initSlider() {

  const gallery = document.getElementById("gallery");

  const dots = document.querySelectorAll(".dot");

  gallery.addEventListener("scroll", () => {

    const index = Math.round(
      gallery.scrollLeft / gallery.offsetWidth
    );

    dots.forEach(dot => dot.classList.remove("activeDot"));

    if (dots[index]) {
      dots[index].classList.add("activeDot");
    }

  });

}
