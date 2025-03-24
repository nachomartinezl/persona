import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/components/MainScreen.module.css';
import ImageUploader from './ImageUploader';
import StyleSelector from './StyleSelector';
import AvatarDisplay from './AvatarDisplay';
import Loader from './Loader';

// ✅ Use env var or fallback if running in localhost without .env
const BASE_URL = process.env.NEXT_PUBLIC_RAILWAY_API_URL || 'http://localhost:8000';

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

  const showToast = (msg, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };

  const toBase64 = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  useEffect(() => {
    const existingId = localStorage.getItem('persona:sessionId');
    if (existingId) {
      console.log('🔁 Existing sessionId restored:', existingId);
      setSessionId(existingId);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem('persona:sessionId', newId);
      setSessionId(newId);
      console.log('🆕 New sessionId created:', newId);
    }
  }, []);

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
        const data = await response.json();
        if (response.ok && data.latestImageUrl) {
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
      clearInterval(pollingInterval);
      setPollingActive(false);
    };
  }, [pollingActive]);

  const generatePayload = async () => {
    return {
      imageBase64: await toBase64(uploadedImage),
      stylePrompt: selectedStyle === 'custom' ? customPrompt : selectedStyle,
      sessionId,
    };
  };

  const handleGenerateAvatar = async () => {
    if (!uploadedImage || !(uploadedImage instanceof File)) {
      return showToast('Please upload an image before generating.');
    }

    if (selectedStyle === 'custom' && customPrompt.trim() === '') {
      return showToast('Please write a custom prompt before generating.');
    }

    setIsLoading(true);
    setGeneratedAvatar(null);

    try {
      const payload = await generatePayload();
      const res = await fetch(`${BASE_URL}/submit-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.jobId) {
        throw new Error('Job submission failed.');
      }

      console.log('📨 Job submitted:', data.jobId);

      // 🟡 Polling logic for result can be added here (for MVP now we skip)

      showToast('✅ Job submitted successfully!');
    } catch (err) {
      console.error('❌ Error generating avatar:', err);
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
