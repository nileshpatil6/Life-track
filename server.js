const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = 3000;

// Supabase Config
const supabaseUrl = "https://zahrwpisuxdguboorgtp.supabase.co"; // Replace with your Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphaHJ3cGlzdXhkZ3Vib29yZ3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MDY2MjcsImV4cCI6MjA0OTQ4MjYyN30.T3gsO7oF-5-AWO9F3yrgDFup9-ygwJPr3X6WB6xNibw"; // Replace with your Supabase Key
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS and Middleware
app.use(cors());
app.use(express.json());

// Multer Config for File Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Route for Images/Audio
app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("media-files") // Your bucket name
      .upload(`uploads/${Date.now()}-${file.originalname}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    // Return the public URL of the uploaded file
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${data.path}`;
    res.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Error uploading file.");
  }
});

// Route to Fetch Uploaded Files (Optional)
app.get("/files", async (req, res) => {
  try {
    const { data, error } = await supabase.storage.from("media-files").list("uploads");
    if (error) throw error;

    const files = data.map((file) => ({
      name: file.name,
      url: `${supabaseUrl}/storage/v1/object/public/media-files/uploads/${file.name}`,
    }));

    res.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Error fetching files.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
