const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Local storage for received messages
const messagesFilePath = path.join(__dirname, "messages.json");

// Ensure messages file exists
if (!fs.existsSync(messagesFilePath)) {
  fs.writeFileSync(messagesFilePath, JSON.stringify([]));
}

// Endpoint to upload messages and files
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { message } = req.body;
    const file = req.file;

    let fileUrl = null;

    if (file) {
      // Upload the file to Supabase
      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(file.originalname, file.buffer, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return res.status(500).json({ success: false, error: error.message });
      }

      fileUrl = `https://${supabaseUrl}/storage/v1/object/public/uploads/${data.path}`;
    }

    // Save message to local storage
    const messages = JSON.parse(fs.readFileSync(messagesFilePath, "utf8"));
    messages.push({ message, fileUrl, timestamp: new Date().toISOString() });
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));

    return res.json({
      success: true,
      message: "Message and/or file uploaded successfully",
      url: fileUrl || null,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Endpoint to retrieve all messages
app.get("/messages", (req, res) => {
  try {
    const messages = JSON.parse(fs.readFileSync(messagesFilePath, "utf8"));
    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error reading messages file:", error);
    res.status(500).json({ success: false, error: "Could not retrieve messages" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
