const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const fetch = require("node-fetch");
const app = express();
app.use(cors());

// test route
app.get("/", (req, res) => {
  res.send("🔥 TikTok Downloader API aktif");
});

// DOWNLOAD ROUTE
app.get("/download", (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.json({ error: "URL kosong" });
  }

  const fileName = `video_${Date.now()}.mp4`;

  const cmd = `yt-dlp -f mp4 -o "${fileName}" "${url}"`;

  exec(cmd, (err) => {
    if (err) {
      return res.json({ error: "Gagal download video" });
    }

    res.download(fileName, () => {
      fs.unlinkSync(fileName); // hapus setelah dikirim
    });
  });
});

// MP3 ROUTE
app.get("/audio", (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.json({ error: "URL kosong" });
  }

  const fileName = `audio_${Date.now()}.mp3`;

  const cmd = `yt-dlp -x --audio-format mp3 -o "${fileName}" "${url}"`;

  exec(cmd, (err) => {
    if (err) {
      return res.json({ error: "Gagal download audio" });
    }

    res.download(fileName, () => {
      fs.unlinkSync(fileName);
    });
  });
});

app.get("/info", async (req, res) => {

  const url = req.query.url;

  if (!url) {
    return res.json({ error: "URL kosong" });
  }

  // =========================
  // STEP 1: YT-DLP
  // =========================
  const runYtDlp = () => {
    return new Promise((resolve, reject) => {

      const cmd = `yt-dlp -J --no-playlist --user-agent "Mozilla/5.0" "${url}"`;

      exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {

        if (err) return reject(err);

        try {
          const data = JSON.parse(stdout);

          let images = [];

          if (data.images) images = data.images;

          if (data.entries) {
            images = data.entries.map(e => e.thumbnail || e.url);
          }

          resolve({
            title: data.title,
            author: data.uploader,
            thumbnail: data.thumbnail,
            images: images,
            type: images.length > 1 ? "slideshow" : "video"
          });

        } catch (e) {
          reject(e);
        }
      });

    });
  };

  // =========================
  // STEP 1 TRY
  // =========================
  try {

    const result = await runYtDlp();
    return res.json(result);

  } catch (err) {

    console.log("YT-DLP gagal, coba API...");

    // =========================
    // STEP 2: API FALLBACK
    // =========================
    const apiResult = await getFromAPI(url);

    if (apiResult) {
      return res.json(apiResult);
    }

    console.log("API juga gagal, retry YT-DLP...");

    // =========================
    // STEP 3: RETRY YT-DLP
    // =========================
    try {

      const retry = await runYtDlp();
      return res.json(retry);

    } catch (err2) {

      // =========================
      // STEP 4: FINAL ERROR
      // =========================
      return res.json({
        error: "Semua engine gagal (yt-dlp + API blocked)"
      });
    }
  }
});



async function getFromAPI(url) {
  try {

    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    // kalau API gagal
    if (!data || !data.data) {
      return null;
    }

    return {
      title: data.data.title || "No title",
      author: data.data.author?.unique_id || "Unknown",
      thumbnail: data.data.cover || "",

      // 🖼️ slideshow support
      images: data.data.images || [],

      type: (data.data.images && data.data.images.length > 1)
        ? "slideshow"
        : "video"
    };

  } catch (err) {
    console.log("API error:", err);
    return null;
  }
}


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
