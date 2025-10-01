import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col, Image } from 'react-bootstrap';
import { XCircleFill } from 'react-bootstrap-icons';

function ImageGenerator({ onGenerate, setLoading, setError }) {
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [mainPrompt, setMainPrompt] = useState('');
  const [formError, setFormError] = useState(null);

  // Clean up object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Filter out files that are already in the current images state (by name and size)
    const uniqueNewFiles = newFiles.filter(newFile => 
      !images.some(existingFile => 
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    );

    const updatedFiles = [...images, ...uniqueNewFiles];

    if (updatedFiles.length > 5) {
      setFormError('You can upload a maximum of 5 images.');
      return;
    }
    setFormError(null);
    setImages(updatedFiles);

    // Revoke old object URLs before creating new ones
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));

    const newImagePreviews = updatedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImagePreviews(newImagePreviews);
    
    // Ensure captions array matches the length of updatedFiles
    const newCaptions = Array(updatedFiles.length).fill('');
    // Copy existing captions to new array if they match the file
    images.forEach((oldFile, index) => {
      const newIndex = updatedFiles.findIndex(f => f.name === oldFile.name && f.size === oldFile.size);
      if (newIndex !== -1) {
        newCaptions[newIndex] = captions[index];
      }
    });
    setCaptions(newCaptions);

    // Clear the file input value to allow re-uploading the same file if needed
    e.target.value = null;
  };

  const handleRemoveImage = (indexToRemove) => {
    // Revoke the object URL for the image being removed
    URL.revokeObjectURL(imagePreviews[indexToRemove].url);

    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    const updatedImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    const updatedCaptions = captions.filter((_, index) => index !== indexToRemove);

    setImages(updatedImages);
    setImagePreviews(updatedImagePreviews);
    setCaptions(updatedCaptions);
    setFormError(null); // Clear any previous form error related to image count
  };

  const handleCaptionChange = (index, value) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFormError(null);

    if (images.length === 0) {
      setFormError('Please upload at least one image.');
      return;
    }
    if (captions.some(caption => caption.trim() === '')) {
      setFormError('Please provide a caption for all uploaded images.');
      return;
    }
    if (mainPrompt.trim() === '') {
      setFormError('Please provide a main prompt.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`images`, image);
        formData.append(`captions[${index}]`, captions[index]);
      });
      formData.append('mainPrompt', mainPrompt);

      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image.');
      }

      const data = await response.json();
      onGenerate(data); // <--- Changed this line to pass the entire data object
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err.message || 'An unexpected error occurred during image generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {formError && <Alert variant="danger">{formError}</Alert>}
      <Form.Group controlId="formImages" className="mb-3">
        <Form.Label>Upload Images (max 5)</Form.Label>
        <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
      </Form.Group>

      {imagePreviews.length > 0 && (
        <div className="mb-3 p-2 border rounded bg-light">
          <h6 className="mb-2">Uploaded Images:</h6>
          <Row xs={2} md={3} lg={4} className="g-2">
            {imagePreviews.map((preview, index) => (
              <Col key={preview.url} className="d-flex flex-column align-items-center position-relative">
                <Image
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  thumbnail
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  className="mb-1"
                />
                <Button
                  variant="danger"
                  size="sm"
                  className="position-absolute top-0 start-100 translate-middle rounded-circle p-0"
                  style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <XCircleFill size={16} />
                </Button>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder={`Caption ${index + 1}`}
                  value={captions[index] || ''}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  required
                  className="text-center"
                />
              </Col>
            ))}
          </Row>
        </div>
      )}

      <Form.Group controlId="formMainPrompt" className="mb-3">
        <Form.Label>Main Prompt</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter the main prompt for image generation (e.g., 'A fantasy landscape combining all elements')"
          value={mainPrompt}
          onChange={(e) => setMainPrompt(e.target.value)}
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="w-100">
        Generate Image
      </Button>
    </Form>
  );
}

export default ImageGenerator;