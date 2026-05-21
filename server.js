const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("🔥 TokSnap API active");
});

app.get("/info", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.json({ error: "URL kosong" });

  try {
    const response = await fetch(
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
    );

    const data = await response.json();

    if (!data?.data) {
      return res.json({ error: "Gagal ambil data TikTok" });
    }

    res.json({
      title: data.data.title,
      author: data.data.author?.unique_id,
      thumbnail: data.data.cover,
      images: data.data.images || [],
      isSlideshow: data.data.images?.length > 0
    });

  } catch (err) {
    res.json({ error: "Server error" });
  }
});


app.get("/download", (req, res) => {
  const url = req.query.url;
  const type = req.query.type || "mp4";

  if (!url) return res.json({ error: "URL kosong" });

  const fileName =
    type === "mp3"
      ? `audio_${Date.now()}.mp3`
      : `video_${Date.now()}.mp4`;

  let cmd;

  if (type === "mp3") {
    cmd = `yt-dlp -x --audio-format mp3 -o "${fileName}" "${url}"`;
  } else {
    cmd = `yt-dlp -f "best[ext=mp4]" -o "${fileName}" "${url}"`;
  }

  exec(cmd, (err) => {
    if (err) {
      return res.json({ error: "Download gagal (yt-dlp error)" });
    }

    res.download(fileName, () => {
      fs.unlinkSync(fileName);
    });
  });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("TokSnap running on " + PORT);
});
