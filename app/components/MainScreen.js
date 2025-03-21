'use client';

import React, { useEffect, useState } from 'react';
import styles from '../styles/components/MainScreen.module.css';
import ImageUploader from './ImageUploader';
import StyleSelector from './StyleSelector';
import AvatarDisplay from './AvatarDisplay';
import Loader from './Loader';

const MainScreen = () => {
  const [uploadedImage, setUploadedImage] = useState(null); // can be File or URL
  const [selectedStyle, setSelectedStyle] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedAvatar, setGeneratedAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileUploadURL, setMobileUploadURL] = useState(null);
  const [isQrUploadActive, setIsQrUploadActive] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  const startQrUpload = () => {
    setIsQrUploadActive(true);
    setPollingActive(true);
  };

  const stopQrUpload = () => {
    setIsQrUploadActive(false);
    setPollingActive(false);
  };

  useEffect(() => {
    if (isQrUploadActive && typeof window !== 'undefined') {
      const baseURL = window.location.origin;
      setMobileUploadURL(`${baseURL}/mobile-upload`);
    } else {
      setMobileUploadURL(null);
    }
  }, [isQrUploadActive]);

  useEffect(() => {
    if (!pollingActive) return;

    const pollingInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/check-new-image');
        if (response.ok) {
          const data = await response.json();
          if (data.latestImageUrl) {
            setUploadedImage(data.latestImageUrl); // it's already a URL
            stopQrUpload();
          }
        }
      } catch (error) {
        console.error('Error checking for new image:', error);
      }
    }, 3000);

    return () => clearInterval(pollingInterval);
  }, [pollingActive]);

  const handleGenerateAvatar = async () => {
    if (!uploadedImage) {
      alert('Please upload an image before generating.');
      return;
    }

    setIsLoading(true);
    setGeneratedAvatar(null);

    try {
      let imageUrl = uploadedImage;

      // If it's a File, upload it to get a URL
      if (uploadedImage instanceof File) {
        const formData = new FormData();
        formData.append('image', uploadedImage);

        const uploadRes = await fetch('/api/upload-mobile-image', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.imageUrl) {
          throw new Error('Failed to upload image.');
        }

        imageUrl = uploadData.imageUrl;
      }

      // Send only the image URL to the generate-avatar endpoint
      const formData = new FormData();
      formData.append('image', imageUrl); // it's a URL now
      formData.append('style', selectedStyle === 'custom' ? customPrompt : selectedStyle);

      const res = await fetch('/api/generate-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.avatarUrl) {
        throw new Error('Avatar generation failed.');
      }

      setGeneratedAvatar(data.avatarUrl);
    } catch (err) {
      console.error('Error generating avatar:', err);
      alert('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.mainScreenContainer}>
      <h1 className={styles.appName}>Persona</h1>

      {!generatedAvatar ? (
        <div className={styles.inputSection}>
          <ImageUploader
            onImageUpload={setUploadedImage}
            uploadedImage={uploadedImage}
            startQrUpload={startQrUpload}
            stopQrUpload={stopQrUpload}
            isQrUploadActive={isQrUploadActive}
            mobileUploadURL={mobileUploadURL}
          />
          <StyleSelector onStyleSelect={setSelectedStyle} onCustomPromptChange={setCustomPrompt} />
          <button className={styles.generateButton} onClick={handleGenerateAvatar} disabled={isLoading}>
            Generate
          </button>
        </div>
      ) : (
        <AvatarDisplay
          avatarUrl={generatedAvatar}
          onNewRun={() => setGeneratedAvatar(null)}
          onReGenerate={handleGenerateAvatar}
        />
      )}

      {isLoading && <Loader />}
    </div>
  );
};

export default MainScreen;
