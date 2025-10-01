# AI Media Generator

## Project Description
This project is a full-stack application that leverages the Replicate API to generate AI-powered images and videos. Users can upload multiple images with captions and a main prompt to generate a fantasy image. The generated image can then be used as input to generate a video with a specific prompt, resolution, aspect ratio, and duration. All uploaded and generated media are saved locally on the server.

## Features
- **Image Generation**:
    - Upload up to 5 images with individual captions.
    - Provide a main prompt for fantasy image generation.
    - Preview uploaded images with their captions.
    - Option to remove uploaded images before generation.
    - Download generated images.
- **Video Generation**:
    - Use a previously generated image as the input for video creation.
    - Provide a video generation prompt.
    - Configure video resolution (576p, 720p, 1080p), aspect ratio (16:9, 9:16, etc.), and duration (1-10 seconds).
- **Local Storage**: All uploaded images, generated images, and generated videos are saved to a local `media_storage` directory on the backend.
- **Responsive UI**: A clean, two-panel user interface built with React and Bootstrap.

## Technologies Used
- **Backend**:
    - Node.js
    - Express.js
    - `dotenv` for environment variables
    - `cors` for cross-origin requests
    - `multer` for file uploads
    - `replicate` for interacting with the Replicate API
    - `axios` for downloading generated media
- **Frontend**:
    - React (with Vite)
    - Bootstrap & React-Bootstrap for UI components
    - `react-bootstrap-icons` for icons

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)
- A Replicate API Token (get one from [Replicate](https://replicate.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/BiocliqAI/greeting.git
cd greeting
```

### 2. Backend Setup
Navigate to the `backend` directory, install dependencies, and configure environment variables.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add your Replicate API token:
```
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

### 3. Frontend Setup
Navigate to the `frontend` directory and install dependencies.

```bash
cd ../frontend
npm install
```

## Running the Application

### 1. Start the Backend Server
From the `backend` directory:
```bash
cd ../backend
node index.js
```
The backend server will start on `http://localhost:3001`.

### 2. Start the Frontend Development Server
From the `frontend` directory:
```bash
cd ../frontend
npm run dev
```
The frontend application will be accessible at `http://localhost:5174`.

## Usage
1.  Open your browser to `http://localhost:5174`.
2.  **Image Generation (Left Panel)**:
    *   Upload 1-5 images.
    *   Provide a caption for each uploaded image.
    *   Enter a "Main Prompt" describing the fantasy image you want to generate.
    *   Click "Generate Image".
    *   The generated image will appear in the right panel. You can download it using the "Download Image" button.
3.  **Video Generation (Right Panel - after image generation)**:
    *   Once an image is generated, the video generation controls will appear below it in the right panel.
    *   The "Image URL" field will be pre-filled with the generated image.
    *   Enter a "Video Prompt".
    *   Select the desired Resolution, Aspect Ratio, and Duration.
    *   Click "Generate Video".
    *   The generated video will appear below the image.

## Folder Structure
```
.
├── backend/
│   ├── .env                 # Environment variables (ignored by Git)
│   ├── .env.example         # Example environment variables
│   ├── index.js             # Backend application entry point
│   ├── media_storage/       # Locally saved uploaded/generated media
│   ├── node_modules/
│   ├── package.json
│   └── uploads/             # Temporary multer upload directory
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── ImageGenerator.jsx
    │   │   └── VideoGenerator.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── ... (other frontend files)
```