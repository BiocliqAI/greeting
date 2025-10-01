const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Replicate = require("replicate");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const mediaStorageDir = path.join(__dirname, "media_storage");

// Ensure media_storage directory exists
if (!fs.existsSync(mediaStorageDir)) {
  fs.mkdirSync(mediaStorageDir);
}

// Serve static files from the media_storage directory
app.use("/media", express.static(mediaStorageDir));

const upload = multer({ dest: "uploads/" });

// Helper function to download and save a file
const downloadAndSave = async (url, type) => {
  try {
    console.log(`Attempting to download ${type} from: ${url}`);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    
    let extension = 'png'; // Default for image
    if (type === 'video') extension = 'mp4'; // Default for video

    // Try to infer extension from Content-Type header
    const contentType = response.headers['content-type'];
    if (contentType) {
      console.log(`Content-Type for ${url}: ${contentType}`);
      if (contentType.includes('image/')) {
        extension = contentType.split('/')[1];
        if (extension === 'jpeg') extension = 'jpg'; // Common conversion
      } else if (contentType.includes('video/')) {
        extension = contentType.split('/')[1];
      }
    }

    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filepath = path.join(mediaStorageDir, filename);
    const writer = fs.createWriteStream(filepath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Successfully saved ${type} to: ${filepath}`);
        resolve(`/media/${filename}`);
      });
      writer.on('error', (err) => {
        console.error(`Error writing ${type} to file ${filepath}:`, err);
        fs.unlink(filepath, () => {}); // Clean up partial file
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Error downloading ${type} from ${url}:`, error.message);
    throw error; // Re-throw to be caught by the route handler
  }
};

app.post("/api/generate", upload.array("images", 5), async (req, res) => {
  const { captions, mainPrompt } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No images uploaded." });
  }
  if (!captions || captions.length !== req.files.length) {
    return res.status(400).json({ error: "Mismatched images and captions." });
  }
  if (!mainPrompt) {
    return res.status(400).json({ error: "No main prompt provided." });
  }

  let savedUploadedImageUrls = [];
  try {
    // Save uploaded images to media_storage
    for (const file of req.files) {
      const newFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
      const newFilepath = path.join(mediaStorageDir, newFilename);
      fs.renameSync(file.path, newFilepath); // Move the file
      savedUploadedImageUrls.push(`/media/${newFilename}`);
      console.log(`Uploaded image saved to: ${newFilepath}`);
    }

    let combinedPrompt = "";
    if (Array.isArray(captions)) {
        captions.forEach((caption, index) => {
            combinedPrompt += `Image ${index + 1} is '${caption}'. `;
        });
    } else {
        combinedPrompt += `Image 1 is '${captions}'. `;
    }
    combinedPrompt += mainPrompt;

    // Use the local URLs of the saved uploaded images for Replicate input
    // Note: Replicate API expects base64 for image_input, so we need to read them again
    const image_inputs = savedUploadedImageUrls.map(localUrl => {
      const fullPath = path.join(__dirname, localUrl.replace("/media", "media_storage"));
      const mimetype = `image/${path.extname(fullPath).substring(1)}`; // infer mimetype
      return `data:${mimetype};base64,${fs.readFileSync(fullPath, 'base64')}`;
    });

    console.log("Sending request to Replicate for image generation...");
    let prediction = await replicate.predictions.create({
      model: "google/nano-banana",
      input: {
        prompt: combinedPrompt,
        image_input: image_inputs,
      },
    });

    prediction = await replicate.wait(prediction);
    console.log("Replicate image prediction status:", prediction.status);

    if (prediction.status === "succeeded") {
      console.log("Replicate image output URL:", prediction.output);
      const localGeneratedImageUrl = await downloadAndSave(prediction.output, 'image');
      console.log("Local generated image URL:", localGeneratedImageUrl);
      // Return both the local URL and the original public Replicate URL
      res.json({
        imageUrl: localGeneratedImageUrl, // For display and download
        publicReplicateImageUrl: prediction.output, // For video generation
        uploadedImageUrls: savedUploadedImageUrls
      });
    } else {
      res.status(500).json({ error: `Prediction failed: ${prediction.error}` });
    }

  } catch (error) {
    console.error("Error in /api/generate:", error);
    // Clean up temporary multer files if any remain (though renameSync should handle most)
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({ error: "Failed to generate image." });
  }
});

app.post("/api/generate-video", async (req, res) => {
  const { imageUrl, videoPrompt, resolution, duration, aspect_ratio } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "No image URL provided." });
  }

  try {
    console.log("Sending request to Replicate for video generation with image URL:", imageUrl);
    const input = {
      image: imageUrl, // Use the public Replicate URL directly
      prompt: videoPrompt,
      resolution: resolution,
      duration: parseInt(duration, 10),
      aspect_ratio: aspect_ratio,
    };

    let prediction = await replicate.predictions.create({
      model: "bytedance/seedance-1-pro",
      input: input,
    });

    prediction = await replicate.wait(prediction);
    console.log("Replicate video prediction status:", prediction.status);

    if (prediction.status === "succeeded") {
      console.log("Replicate video output URL:", prediction.output);
      const generatedVideoUrl = await downloadAndSave(prediction.output, 'video');
      console.log("Local generated video URL:", generatedVideoUrl);
      res.json({ videoUrl: generatedVideoUrl });
    } else {
      res.status(500).json({ error: `Video prediction failed: ${prediction.error}` });
    }

  } catch (error) {
    console.error("Error in /api/generate-video:", error);
    res.status(500).json({ error: "Failed to generate video." });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
