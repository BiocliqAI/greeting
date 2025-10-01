import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

function VideoGenerator({ generatedImageUrl, onGenerate, setLoading, setError }) {
  const [imageUrl, setImageUrl] = useState(generatedImageUrl || '');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [resolution, setResolution] = useState('576p'); // Default resolution
  const [aspectRatio, setAspectRatio] = useState('16:9'); // Default aspect ratio
  const [duration, setDuration] = useState('2'); // Default duration in seconds
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (generatedImageUrl) {
      setImageUrl(generatedImageUrl);
    }
  }, [generatedImageUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFormError(null);

    if (imageUrl.trim() === '') {
      setFormError('No image URL provided. Please generate an image first.');
      return;
    }
    if (videoPrompt.trim() === '') {
      setFormError('Please provide a video prompt.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl, // This is now the public Replicate URL
          videoPrompt,
          resolution,
          aspect_ratio: aspectRatio, // Include aspect ratio
          duration: parseInt(duration, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video.');
      }

      const data = await response.json();
      onGenerate(data.videoUrl);
    } catch (err) {
      console.error('Video generation error:', err);
      setError(err.message || 'An unexpected error occurred during video generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-3">
      {formError && <Alert variant="danger">{formError}</Alert>}
      <Form.Group controlId="formImageUrl" className="mb-3">
        <Form.Label>Image URL (from generated image)</Form.Label>
        <Form.Control
          type="text"
          value={imageUrl}
          readOnly // Keep it read-only as it's populated from the generated image
        />
      </Form.Group>

      <Form.Group controlId="formVideoPrompt" className="mb-3">
        <Form.Label>Video Prompt</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter the prompt for video generation"
          value={videoPrompt}
          onChange={(e) => setVideoPrompt(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="formResolution" className="mb-3">
        <Form.Label>Resolution</Form.Label>
        <Form.Control
          as="select"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        >
          <option value="576p">576p</option>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="formAspectRatio" className="mb-3">
        <Form.Label>Aspect Ratio</Form.Label>
        <Form.Control
          as="select"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
        >
          <option value="16:9">16:9</option>
          <option value="9:16">9:16</option>
          <option value="3:2">3:2</option>
          <option value="2:3">2:3</option>
          <option value="4:3">4:3</option>
          <option value="3:4">3:4</option>
          <option value="1:1">1:1</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="formDuration" className="mb-3">
        <Form.Label>Duration (seconds)</Form.Label>
        <Form.Control
          type="number"
          min="1"
          max="10"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="w-100">
        Generate Video
      </Button>
    </Form>
  );
}

export default VideoGenerator;