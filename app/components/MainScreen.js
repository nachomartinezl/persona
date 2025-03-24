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

  useEffect(() => {
    if (!sessionId) return;
  
    const checkForPendingJob = async () => {
      try {
        const res = await fetch(`${BASE_URL}/latest-job/${sessionId}`);
        const data = await res.json();
  
        if (data.jobId && data.status === 'pending') {
          console.log('⏳ Resuming polling for pending job:', data.jobId);
          setIsLoading(true);
  
          const pollInterval = 2500;
          const maxAttempts = 40;
          let attempts = 0;
  
          const pollStatus = async () => {
            const res = await fetch(`${BASE_URL}/check-status/${data.jobId}`);
            const statusData = await res.json();
  
            if (statusData.status === 'complete' && statusData.result) {
              setGeneratedAvatar(statusData.result);
              setIsLoading(false);
            } else if (attempts < maxAttempts) {
              attempts++;
              setTimeout(pollStatus, pollInterval);
            } else {
              showToast('Avatar generation timed out.');
              setIsLoading(false);
            }
          };
  
          pollStatus();
        }
      } catch (err) {
        console.error('⚠️ Error checking for latest job:', err);
      }
    };
  
    checkForPendingJob();
  }, [sessionId]);
  

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
      const jobRes = await fetch(`${BASE_URL}/submit-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: await toBase64(uploadedImage),
          stylePrompt: selectedStyle === 'custom' ? customPrompt : selectedStyle,
          sessionId,
        }),
      });
  
      const jobData = await jobRes.json();
      const jobId = jobData.jobId;
  
      if (!jobId) throw new Error("Failed to submit job");
  
      // ⏳ Polling loop
      const pollInterval = 2500;
      const maxAttempts = 40;
      let attempts = 0;
  
      const pollStatus = async () => {
        const res = await fetch(`${BASE_URL}/check-status/${jobId}`);
        const data = await res.json();
  
        if (data.status === 'complete' && data.result) {
          console.log('✅ Avatar generation complete!');
          setGeneratedAvatar(data.result);
          setIsLoading(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(pollStatus, pollInterval);
        } else {
          throw new Error('Timeout: Job took too long.');
        }
      };
  
      pollStatus();
  
    } catch (err) {
      console.error('❌ Error during generation:', err);
      showToast('Something went wrong while generating.');
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
