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

  try {
    const response = await fetch(
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
    );

    const data = await response.json();

    if (!data?.data) {
      return res.json({
        error: "Video tidak bisa diproses"
      });
    }

    return res.json({
      title: data.data.title || "No title",
      author: data.data.author?.unique_id || "Unknown",
      thumbnail: data.data.cover || "",
      duration: data.data.duration || 0,
      images: data.data.images || [],
      isSlideshow: data.data.images?.length > 1
    });

  } catch (err) {
    return res.json({
      error: "Server error"
    });
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
