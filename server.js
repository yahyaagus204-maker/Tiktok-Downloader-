const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

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

app.get("/info", (req, res) => {
  const url = req.query.url;

  if (!url) return res.json({ error: "URL kosong" });

  const cmd = `yt-dlp -J --no-playlist --user-agent "Mozilla/5.0" "${url}"`;

  exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {

    if (err) {
      return res.json({ error: "Link tidak valid atau tidak support" });
    }

    try {
      const data = JSON.parse(stdout);

      // ===== DETEKSI SLIDESHOW =====
      let images = [];

      if (data.images) {
        images = data.images;
      }

      if (data.entries) {
        images = data.entries.map(e => e.thumbnail || e.url);
      }

      const isSlideshow = images.length > 1;

      res.json({
        title: data.title || "No title",
        author: data.uploader || "Unknown",
        thumbnail: data.thumbnail || "",
        duration: data.duration || 0,

        type: isSlideshow ? "slideshow" : "video",
        images: images
      });

    } catch (e) {
      res.json({ error: "Parse error" });
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
