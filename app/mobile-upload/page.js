// app/mobile-upload/page.js
'use client';

import React from 'react';
import styles from './MobileUpload.module.css';
import ImageUploader from '../components/ImageUploader';

const MobileUploadPage = () => {
  const [uploadStatus, setUploadStatus] = React.useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleImageUploadMobile = async (imageFile) => {
    if (!imageFile) {
      alert('No image selected.');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('/api/upload-mobile-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json(); // Try to get error message from server
        throw new Error(`Upload failed: ${response.status} - ${errorData?.error || response.statusText}`);
      }

      setUploadStatus('success'); // Set success status
      // No redirection here anymore!

    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <div className={styles.mobileUploadContainer}>
      <h1>Upload Image from Mobile</h1>
      <p>Use the uploader below to select an image from your mobile device.</p>

      {uploadStatus === 'idle' || uploadStatus === 'uploading' || uploadStatus === 'error' ? (
        <ImageUploader onImageUpload={handleImageUploadMobile} uploadedImage={null} />
      ) : null} {/* Don't show uploader after success */}

      {uploadStatus === 'uploading' && <p>Uploading image...</p>}

      {uploadStatus === 'success' && <p style={{ color: 'green' }}>Image uploaded successfully!</p>}

      {uploadStatus === 'error' && (
        <p style={{ color: 'red' }}>
          Image upload failed. Please try again. <br />
          {errorMessage && `Error: ${errorMessage}`}
        </p>
      )}
    </div>
  );
};

export default MobileUploadPage;