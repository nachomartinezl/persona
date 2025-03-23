import React, { useEffect, useState } from 'react';
import styles from '../styles/components/MainScreen.module.css';
import ImageUploader from './ImageUploader';
import StyleSelector from './StyleSelector';
import AvatarDisplay from './AvatarDisplay';
import Loader from './Loader';

const MainScreen = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedAvatar, setGeneratedAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileUploadURL, setMobileUploadURL] = useState(null);
  const [isQrUploadActive, setIsQrUploadActive] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [toast, setToast] = useState(null);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    let existingId = localStorage.getItem('persona:sessionId');
    if (!existingId) {
      existingId = crypto.randomUUID();
      localStorage.setItem('persona:sessionId', existingId);
      console.log('🆕 New sessionId created:', existingId);
    } else {
      console.log('🔁 Existing sessionId restored:', existingId);
    }
    setSessionId(existingId);
  }, []);

  const showToast = (msg, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };

  const startQrUpload = () => {
    console.log('🟢 QR upload started');
    setIsQrUploadActive(true);
    setPollingActive(true);
  };

  const stopQrUpload = () => {
    console.log('🔴 QR upload stopped');
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

    console.log('🔁 Starting QR polling...');

    const pollingInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/check-new-image');
        const data = await response.json();
        if (response.ok && data.latestImageUrl) {
          console.log('📸 Received uploaded image from mobile!');
          const res = await fetch(data.latestImageUrl);
          const blob = await res.blob();
          const file = new File([blob], 'mobile-upload.png', { type: blob.type });
          setUploadedImage(file);
          stopQrUpload();
          showToast('📱 Mobile image received!');
        } else {
          console.log('📭 No new image found yet');
        }
      } catch (err) {
        console.error('🚨 Error polling for new image:', err);
      }
    }, 3000);

    return () => {
      console.log('🛑 Stopping QR polling...');
      clearInterval(pollingInterval);
      setPollingActive(false);
    };
  }, [pollingActive]);

  const handleGenerateAvatar = async () => {
    if (!uploadedImage || !(uploadedImage instanceof File)) {
      showToast('Please upload an image before generating.');
      return;
    }

    if (selectedStyle === 'custom' && customPrompt.trim() === '') {
      showToast('Please write a custom prompt before generating.');
      return;
    }

    setIsLoading(true);
    setGeneratedAvatar(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('style', selectedStyle === 'custom' ? customPrompt : selectedStyle);
      formData.append('sessionId', sessionId);

      const res = await fetch(process.env.RAILWAY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: await toBase64(uploadedImage),
          stylePrompt: selectedStyle === 'custom' ? customPrompt : selectedStyle,
          sessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.avatarUrl) {
        throw new Error('Avatar generation failed.');
      }

      console.log('✅ Avatar generated!');
      setGeneratedAvatar(data.avatarUrl);
    } catch (err) {
      console.error('Error generating avatar:', err);
      showToast('Something went wrong while generating.');
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
          <StyleSelector
            onStyleSelect={setSelectedStyle}
            onCustomPromptChange={setCustomPrompt}
            selectedStyle={selectedStyle}
            customPrompt={customPrompt}
          />
          <button
            className={styles.generateButton}
            onClick={handleGenerateAvatar}
            disabled={isLoading || (selectedStyle === 'custom' && customPrompt.trim() === '')}
          >
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

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
};

export default MainScreen;