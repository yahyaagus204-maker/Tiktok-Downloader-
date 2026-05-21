const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("🔥 TokSnap API active");
});

app.get("/info", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "URL kosong" });
  }

  try {
    const fetchRes = await fetch(
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
    );

    const data = await fetchRes.json();

    if (!data || !data.data) {
      return res.status(500).json({
        error: "TikTok API gagal / diblok"
      });
    }

    return res.json({
      title: data.data.title || "No title",
      author: data.data.author?.unique_id || "Unknown",
      thumbnail: data.data.cover || "",
      images: data.data.images || [],
      duration: data.data.duration || 0
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: "Server crash / fetch gagal"
    });
  }
});


app.get("/download", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.json({ error: "URL kosong" });
  }

  try {
    // 1. ambil dari TikWM dulu
    const api = await fetch(
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
    );

    const data = await api.json();

    if (data?.data?.play) {
      // redirect langsung ke file video (PALING STABIL)
      return res.redirect(data.data.play);
    }

    // 2. fallback jika tidak ada
    if (data?.data?.hdplay) {
      return res.redirect(data.data.hdplay);
    }

    return res.json({
      error: "Download tidak tersedia"
    });

  } catch (err) {
    return res.json({
      error: "Server error"
    });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("TokSnap running on " + PORT);
});
