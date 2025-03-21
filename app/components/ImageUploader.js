import React, { useEffect, useState } from 'react';
import styles from '../styles/components/ImageUploader.module.css';
import { QRCodeCanvas } from 'qrcode.react';

const ImageUploader = ({ onImageUpload, uploadedImage, startQrUpload, stopQrUpload, isQrUploadActive, mobileUploadURL }) => {
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  useEffect(() => {
    if (uploadedImage instanceof File) {
      setPreviewImageUrl(URL.createObjectURL(uploadedImage));
    } else if (typeof uploadedImage === 'string') {
      setPreviewImageUrl(uploadedImage); // direct URL, use as is
    } else {
      setPreviewImageUrl(null);
    }
  }, [uploadedImage]);  


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageUpload(file);
    } else {
      setPreviewImageUrl(null);
      onImageUpload(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      onImageUpload(file);
    } else {
      setPreviewImageUrl(null);
      onImageUpload(null);
    }
  };

  const handleDeleteImage = () => {
    setPreviewImageUrl(null);
    onImageUpload(null);
  };

  return (
    <div className={styles.imageUploaderContainer} onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className={styles.uploadArea}>
        {previewImageUrl ? (
          <div className={styles.thumbnailContainer}>
            <img src={previewImageUrl} alt="Image Preview" className={styles.thumbnail} />
            <button className={styles.deleteButton} onClick={handleDeleteImage}>Delete Image</button>
          </div>
        ) : (
          <>
            <p>Drag and drop an image here or</p>
            <label htmlFor="imageUpload" className={styles.uploadButton}>
              Upload Image
            </label>
            <input type="file" id="imageUpload" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </>
        )}

        {/* QR Code Upload Section */}
        {!isQrUploadActive ? (
          <button className={styles.qrCodeButtonInUploader} onClick={startQrUpload}>Upload via QR Code</button>
        ) : (
          <div className={styles.qrCodeSectionInUploader}>
            <p>Scan this QR code to upload image from mobile:</p>
            {mobileUploadURL && <QRCodeCanvas value={mobileUploadURL} size={128} level="H" />}
            <button className={styles.cancelQrCodeButtonInUploader} onClick={stopQrUpload}>Cancel QR Upload</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
