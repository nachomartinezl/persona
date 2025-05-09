import React, { useEffect, useState, useCallback } from "react";
import styles from "../styles/components/MainScreen.module.css";
import ImageUploader from "./ImageUploader";
import StyleSelector from "./StyleSelector";
import AvatarDisplay from "./AvatarDisplay";
import EmailModal from "./EmailModal";
import Loader from "./Loader";

// ✅ Use env var or fallback if running in localhost without .env
const BASE_URL =
  process.env.NEXT_PUBLIC_RAILWAY_API_URL || "http://localhost:8000";

const MainScreen = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeJob, setActiveJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileUploadURL, setMobileUploadURL] = useState(null);
  const [isQrUploadActive, setIsQrUploadActive] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [pastJobs, setPastJobs] = useState([]);
  const [showPastJobsToast, setShowPastJobsToast] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [emailChecked, setEmailChecked] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(false);

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
    const existingId = localStorage.getItem("persona:sessionId");
    if (existingId) {
      console.log("🔁 Existing sessionId restored:", existingId);
      setSessionId(existingId);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem("persona:sessionId", newId);
      setSessionId(newId);
      console.log("🆕 New sessionId created:", newId);
    }
    // 📩 Check if email is already saved
    const storedEmail = localStorage.getItem("persona:email");
    if (storedEmail) {
      setUserEmail(storedEmail);
      setEmailChecked(true);
      console.log("📬 Email loaded from localStorage:", storedEmail);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const fetchCompletedJobs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/completed-jobs/${sessionId}`);
        const data = await res.json();
        console.log("Fetched past jobs data:", data); // Log the entire data object - should now log the array directly

        if (Array.isArray(data) && data.length > 0) {
          // Check if 'data' itself is an array
          console.log("Past jobs found:", data); // Log the jobs array itself
          setPastJobs(data); // Directly set pastJobs to the fetched array 'data'
          setShowPastJobsToast(true);
          console.log("setShowPastJobsToast set to true"); // Confirm state update
        } else {
          console.log("No past jobs found or data is not an array:", data); // Log when no jobs are found or format issue
        }
      } catch (err) {
        console.error("❌ Failed to fetch past jobs:", err);
      }
    };

    fetchCompletedJobs();
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const checkForPendingJob = async () => {
      try {
        const res = await fetch(`${BASE_URL}/latest-job/${sessionId}`);
        const data = await res.json();

        if (data.jobId && data.status === "pending") {
          console.log("⏳ Resuming polling for pending job:", data.jobId);
          setIsLoading(true);

          const pollInterval = 2500;
          const maxAttempts = 40;
          let attempts = 0;

          const pollStatus = async () => {
            const res = await fetch(`${BASE_URL}/check-status/${data.jobId}`);
            const statusData = await res.json();

            if (statusData.status === "complete" && statusData.result) {
              setActiveJob({ jobId: data.jobId, avatarUrl: data.result });
              setIsLoading(false);
            } else if (attempts < maxAttempts) {
              attempts++;
              setTimeout(pollStatus, pollInterval);
            } else {
              showToast("Avatar generation timed out.");
              setIsLoading(false);
            }
          };

          pollStatus();
        }
      } catch (err) {
        console.error("⚠️ Error checking for latest job:", err);
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
    if (isQrUploadActive && typeof window !== "undefined") {
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
        const response = await fetch("/api/check-new-image");
        const data = await response.json();
        if (response.ok && data.latestImageUrl) {
          const res = await fetch(data.latestImageUrl);
          const blob = await res.blob();
          const file = new File([blob], "mobile-upload.png", {
            type: blob.type,
          });
          setUploadedImage(file);
          stopQrUpload();
          showToast("📱 Mobile image received!");
        } else {
          console.log("📭 No new image found yet");
        }
      } catch (err) {
        console.error("🚨 Error polling for new image:", err);
      }
    }, 3000);

    return () => {
      clearInterval(pollingInterval);
      setPollingActive(false);
    };
  }, [pollingActive]);

  const startPolling = (jobId) => {
    const pollInterval = 2500;
    const maxAttempts = 40;
    let attempts = 0;

    const pollStatus = async (jobId) => {
      const res = await fetch(`${BASE_URL}/check-status/${jobId}`);
      const data = await res.json();

      if (data.status === "complete" && data.result) {
        console.log("✅ Avatar generation complete!");
        setActiveJob({ jobId: jobId, avatarUrl: data.result });
        setIsLoading(false);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(() => pollStatus(jobId), pollInterval);
      } else {
        showToast("Avatar generation timed out.");
        setIsLoading(false);
      }
    };

    pollStatus(jobId); // start polling loop
  };

  const validateOrSaveEmail = async () => {
    const localEmail = localStorage.getItem("persona:email");

    if (localEmail) {
      setUserEmail(localEmail);
      setEmailChecked(true);
      return true;
    }

    setShowEmailModal(true);
    return false; // wait for user input
  };

  const handleGenerateAvatar = async () => {
    if (!emailChecked) {
      setPendingGeneration(true); // 🔁 flag to continue later
      const success = await validateOrSaveEmail();
      if (!success) return;
    }

    setPendingGeneration(false); // ✅ reset if we proceed

    let imageBase64 = null;

    if (uploadedImage && uploadedImage instanceof File) {
      imageBase64 = await toBase64(uploadedImage);
    } else if (activeJob?.avatarUrl?.startsWith("data:image/")) {
      imageBase64 = activeJob.avatarUrl;
    } else {
      showToast("Please upload an image before generating.");
      return;
    }

    if (!selectedStyle) {
      showToast("Please select a style before generating.");
      return;
    }

    if (selectedStyle === "custom" && customPrompt.trim() === "") {
      showToast("Please write a custom prompt before generating.");
      return;
    }

    setIsLoading(true);
    setActiveJob(null);

    try {
      const jobRes = await fetch(`${BASE_URL}/submit-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          stylePrompt:
            selectedStyle === "custom" ? customPrompt : selectedStyle,
          sessionId,
        }),
      });

      const jobData = await jobRes.json();
      const jobId = jobData.jobId;

      if (!jobId) throw new Error("Failed to submit job");

      startPolling(jobId); // ✅ properly scoped and fired
    } catch (err) {
      console.error("❌ Error during generation:", err);
      showToast("Something went wrong while generating.");
      setIsLoading(false);
    }
  };

  const handleViewPastJobs = () => {
    if (pastJobs.length > 0) {
      const latest = pastJobs[0];
      setActiveJob(latest);
      setPastJobs(pastJobs.slice(1)); // Remove latest from gallery
      setShowPastJobsToast(false);
    }
  };

  const handleSelectPastJob = (selectedJob) => {
    if (activeJob) {
      setPastJobs((prev) => [
        ...prev.filter((j) => j.jobId !== selectedJob.jobId),
        activeJob,
      ]);
    }
    setActiveJob(selectedJob);
  };

  return (
    <div className={styles.mainScreenContainer}>
      <h1 className={styles.appName}>Persona</h1>

      {showPastJobsToast && (
        <div className={styles.toastSuccess} onClick={handleViewPastJobs}>
          See your generated images
        </div>
      )}

      {!activeJob ? (
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
            disabled={
              isLoading ||
              (selectedStyle === "custom" && customPrompt.trim() === "")
            }
          >
            Generate
          </button>
        </div>
      ) : (
        <AvatarDisplay
          avatarUrl={activeJob?.avatarUrl}
          currentJobId={activeJob?.jobId}
          pastJobs={pastJobs}
          onNewRun={() => setActiveJob(null)}
          onReGenerate={handleGenerateAvatar}
          onSelectPastJob={handleSelectPastJob}
        />
      )}

      {showEmailModal && (
        <EmailModal
          onSubmit={async (email) => {
            try {
              const res = await fetch(`${BASE_URL}/save-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, sessionId }),
              });
              if (!res.ok) throw new Error("Failed to save email");
              localStorage.setItem("persona:email", email);
              setUserEmail(email);
              setEmailChecked(true);
              setShowEmailModal(false);
              if (pendingGeneration) handleGenerateAvatar(); // 🚀 resume flow          
            } catch (err) {
              showToast("Error saving your email.");
              console.error(err);
            }
          }}
          onClose={() => {
            setShowEmailModal(false);
            setPendingGeneration(false);
            showToast("Email is required to generate.");
          }}
        />
      )}

      {isLoading && <Loader />}
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
};

export default MainScreen;
