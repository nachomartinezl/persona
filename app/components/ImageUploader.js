import React, { useEffect, useState } from "react";
import styles from "../styles/components/ImageUploader.module.css";
import { QRCodeCanvas } from "qrcode.react";
import { FaCamera, FaMobileAlt } from "react-icons/fa";
import { MdUploadFile } from "react-icons/md";

const isMobile =
  typeof window !== "undefined" &&
  /Mobi|Android|iPhone/i.test(navigator.userAgent);

const ImageUploader = ({
  onImageUpload,
  uploadedImage,
  startQrUpload,
  stopQrUpload,
  isQrUploadActive,
  mobileUploadURL,
  hideQrOption = false,
}) => {
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  useEffect(() => {
    if (uploadedImage instanceof File) {
      setPreviewImageUrl(URL.createObjectURL(uploadedImage));
    } else if (typeof uploadedImage === "string") {
      setPreviewImageUrl(uploadedImage);
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
    <div
      className={styles.imageUploaderContainer}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={styles.uploadArea}>
        {previewImageUrl ? (
          <div className={styles.thumbnailContainer}>
            <img
              src={previewImageUrl}
              alt="Image Preview"
              className={styles.thumbnail}
            />
            <button className={styles.deleteButton} onClick={handleDeleteImage}>
              Delete Image
            </button>
          </div>
        ) : (
          <>
            {!isMobile && <p>Drag and drop an image here or</p>}{" "}
            {/* 💡 Only show on desktop */}
            <label htmlFor="imageUpload" className={styles.uploadButton}>
              {isMobile ? (
                <>
                  <FaCamera style={{ marginRight: 8 }} />
                  Take a Photo
                </>
              ) : (
                <>
                  <MdUploadFile style={{ marginRight: 8 }} />
                  Upload Image
                </>
              )}
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </>
        )}

        {/* QR Upload Option (Desktop Only) */}
        {!hideQrOption && !isQrUploadActive && !isMobile && (
          <button
            className={styles.qrCodeButtonInUploader}
            onClick={startQrUpload}
          >
            <FaMobileAlt style={{ marginRight: 8 }} />
            Take a Photo
          </button>
        )}

        {!hideQrOption && isQrUploadActive && (
          <div className={styles.qrCodeSectionInUploader}>
            <p>Scan this QR code to upload image from mobile:</p>
            {mobileUploadURL && (
              <QRCodeCanvas value={mobileUploadURL} size={128} level="H" />
            )}
            <button
              className={styles.cancelQrCodeButtonInUploader}
              onClick={stopQrUpload}
            >
              Cancel QR Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
