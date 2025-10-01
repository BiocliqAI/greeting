import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';

const BACKEND_BASE_URL = 'http://localhost:3001';

function App() {
  const [generatedLocalImageUrl, setGeneratedLocalImageUrl] = useState(null);
  const [generatedPublicReplicateImageUrl, setGeneratedPublicReplicateImageUrl] = useState(null);
  const [generatedLocalVideoUrl, setGeneratedLocalVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageGenerate = ({ imageUrl, publicReplicateImageUrl }) => {
    // Store local URL for display and download
    const fullLocalUrl = `${BACKEND_BASE_URL}${imageUrl}`;
    setGeneratedLocalImageUrl(fullLocalUrl);
    // Store public Replicate URL for video generation
    setGeneratedPublicReplicateImageUrl(publicReplicateImageUrl);
    setGeneratedLocalVideoUrl(null); // Clear video when new image is generated
    console.log("Generated Local Image URL (for display):", fullLocalUrl);
  };

  const handleVideoGenerate = (relativeVideoUrl) => {
    // Prepend backend base URL to make it an absolute URL for the frontend
    const fullLocalVideoUrl = `${BACKEND_BASE_URL}${relativeVideoUrl}`;
    setGeneratedLocalVideoUrl(fullLocalVideoUrl);
    console.log("Generated Local Video URL (for display):", fullLocalVideoUrl);
    // No need to clear image here, as video is generated from it
  };

  const handleDownloadImage = () => {
    if (generatedLocalImageUrl) {
      const link = document.createElement('a');
      link.href = generatedLocalImageUrl;
      link.download = 'generated_image.png'; // You can make this dynamic if needed
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Container fluid className="p-4">
      <h1 className="mb-4 text-center">AI Media Generator</h1>
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title className="mb-3">Image Generation Inputs</Card.Title>
              <ImageGenerator
                onGenerate={handleImageGenerate}
                setLoading={setLoading}
                setError={setError}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-3">Generated Media</Card.Title>
              {loading && (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Generating...</p>
                </div>
              )}
              {error && <div className="alert alert-danger">{error}</div>}
              {!loading && !error && (
                <div className="mt-3 text-center">
                  {generatedLocalImageUrl && (
                    <>
                      <h5>Generated Image:</h5>
                      {console.log("Rendering image with src:", generatedLocalImageUrl)}
                      <img src={generatedLocalImageUrl} alt="Generated" className="img-fluid rounded" />
                      <Button variant="success" className="mt-3" onClick={handleDownloadImage}>
                        Download Image
                      </Button>
                      <hr className="my-4" />
                      <h5>Generate Video from Image:</h5>
                      <VideoGenerator
                        generatedImageUrl={generatedPublicReplicateImageUrl}
                        onGenerate={handleVideoGenerate}
                        setLoading={setLoading}
                        setError={setError}
                      />
                    </>
                  )}
                  {generatedLocalVideoUrl && (
                    <> 
                      <h5 className="mt-4">Generated Video:</h5>
                      {console.log("Rendering video with src:", generatedLocalVideoUrl)}
                      <video controls src={generatedLocalVideoUrl} className="img-fluid rounded"></video>
                      {/* Optionally add a download button for video as well */}
                    </>
                  )}
                  {!generatedLocalImageUrl && !generatedLocalVideoUrl && (
                    <p className="text-center text-muted my-5">Your generated image or video will appear here.</p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;