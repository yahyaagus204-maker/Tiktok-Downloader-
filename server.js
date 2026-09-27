const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(cors());


// =========================
// HOME
// =========================

app.get("/", (req, res) => {
  res.send("🔥 TokSnap API active");
});


// =========================
// INFO / PREVIEW
// =========================

app.get("/info", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.json({
      error: "URL kosong"
    });
  }

  try {
    const response = await fetch(
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
    );

    const data = await response.json();

    if (!data?.data) {
      return res.json({
        error: "Gagal ambil data TikTok"
      });
    }

    res.json({
      title: data.data.title,
      author: data.data.author?.unique_id,
      thumbnail: data.data.cover,
      images: data.data.images || [],
      isSlideshow: data.data.images?.length > 0
    });

  } catch (err) {

    console.log("=== INFO ERROR ===");
    console.log(err);
    console.log("==================");

    res.json({
      error: "Server error"
    });
  }
});


// =========================
// DOWNLOAD
// =========================

app.get("/download", (req, res) => {

  const url = req.query.url;
  const type = req.query.type || "mp4";

  if (!url) {
    return res.json({
      error: "URL kosong"
    });
  }


  // =========================
  // NAMA FILE
  // =========================

  const fileName =
    type === "mp3"
      ? `audio_${Date.now()}.mp3`
      : `video_${Date.now()}.mp4`;


  // =========================
  // YT-DLP COMMAND
  // =========================

  let cmd;

  if (type === "mp3") {

    cmd =
      `yt-dlp ` +
      `-x ` +
      `--audio-format mp3 ` +
      `--no-playlist ` +
      `-o "${fileName}" ` +
      `"${url}"`;

  } else {

    cmd =
      `yt-dlp ` +
      `-f "bestvideo*+bestaudio/best" ` +
      `--merge-output-format mp4 ` +
      `--no-playlist ` +
      `-o "${fileName}" ` +
      `"${url}"`;
  }


  console.log("");
  console.log("================================");
  console.log("TOKSNAP DOWNLOAD");
  console.log("TYPE:", type);
  console.log("URL:", url);
  console.log("COMMAND:", cmd);
  console.log("================================");


  // =========================
  // EXECUTE YT-DLP
  // =========================

  exec(cmd, (err, stdout, stderr) => {

    console.log("");
    console.log("=== YT-DLP STDOUT ===");
    console.log(stdout);

    console.log("");
    console.log("=== YT-DLP STDERR ===");
    console.log(stderr);

    console.log("");
    console.log("=== YT-DLP ERROR OBJECT ===");
    console.log(err);

    console.log("============================");


    // =========================
    // JIKA GAGAL
    // =========================

    if (err) {

      return res.json({
        error: "Download gagal",
        detail: stderr || err.message
      });
    }


    // =========================
    // CEK FILE
    // =========================

    if (!fs.existsSync(fileName)) {

      return res.json({
        error: "File hasil download tidak ditemukan"
      });
    }


    // =========================
    // KIRIM FILE
    // =========================

    res.download(fileName, (downloadErr) => {

      if (downloadErr) {

        console.log("=== FILE DOWNLOAD ERROR ===");
        console.log(downloadErr);
        console.log("===========================");
      }


      // =========================
      // HAPUS FILE
      // =========================

      if (fs.existsSync(fileName)) {

        try {
          fs.unlinkSync(fileName);
        } catch (deleteErr) {

          console.log("Gagal menghapus file:");
          console.log(deleteErr);
        }
      }

    });

  });

});


// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "TokSnap running on port " + PORT
  );

});
