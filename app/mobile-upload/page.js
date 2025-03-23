'use client';

import React from 'react';
import styles from './MobileUpload.module.css';
import ImageUploader from '../components/ImageUploader';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

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
      const res = await fetch('/api/upload-mobile-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      setUploadStatus('success');
    } catch (err) {
      console.error('Error uploading image:', err);
      setUploadStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <div className={styles.mobileUploadContainer}>
      <h1>Upload Image from Mobile</h1>
      <p className={styles.instructions}>
        Tap below to take a photo or pick from gallery.
      </p>

      {uploadStatus === 'idle' && (
        <ImageUploader
          onImageUpload={handleImageUploadMobile}
          uploadedImage={null}
          hideQrOption={true}
        />
      )}

      {uploadStatus === 'uploading' && (
        <div className={styles.statusMessage}>
          <FaSpinner className={styles.spinnerIcon} />
          Uploading image...
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className={`${styles.statusMessage} ${styles.success}`}>
          <FaCheckCircle className={styles.statusIcon} />
          Image uploaded successfully! You can now return to desktop.
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className={`${styles.statusMessage} ${styles.error}`}>
          <FaExclamationTriangle className={styles.statusIcon} />
          Upload failed. Please try again.<br />
          {errorMessage && <span className={styles.errorText}>Error: {errorMessage}</span>}
        </div>
      )}
    </div>
  );
};

export default MobileUploadPage;
