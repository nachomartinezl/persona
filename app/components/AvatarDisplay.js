import React, { useState, useEffect } from "react";
import styles from "../styles/components/AvatarDisplay.module.css";
import {
  FiDownload,
  FiRefreshCw,
  FiPlusCircle,
  FiArrowLeft,
} from "react-icons/fi";

const AvatarDisplay = ({
  avatarUrl,
  onNewRun,
  onReGenerate,
  pastJobs = [],
  onSelectPastJob,
}) => {
  const [imgError, setImgError] = useState(false);
  const [retryTimeout, setRetryTimeout] = useState(null);

  useEffect(() => {
    setImgError(false); // Reset error on new avatarUrl
    if (retryTimeout) clearTimeout(retryTimeout);
  }, [avatarUrl]);

  const handleImageError = () => {
    console.warn("❌ Image failed to load, retrying in 2s...");
    const timeout = setTimeout(() => {
      setImgError(false); // Retry image render
    }, 2000);
    setRetryTimeout(timeout);
    setImgError(true);
  };

  const handleDownloadImage = () => {
    if (avatarUrl) {
      const link = document.createElement("a");
      link.href = avatarUrl;
      link.download = "ai_avatar.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={styles.avatarDisplayContainer}>
      <div className={styles.backArrow} onClick={onNewRun}>
        <FiArrowLeft size={24} />
      </div>
      <h2>Your AI Avatar</h2>

      {!avatarUrl ? (
        <p>Waiting for image...</p>
      ) : !imgError ? (
        <img
          src={avatarUrl}
          alt="AI Generated Avatar"
          className={styles.avatarImage}
          onError={handleImageError}
          onLoad={() => console.log("✅ Image loaded successfully.")}
        />
      ) : (
        <p style={{ color: "#b91c1c" }}>⚠️ Error displaying avatar. Retrying…</p>
      )}

      <div className={styles.buttonContainer}>
        <button className={styles.iconButton} onClick={handleDownloadImage}>
          <FiDownload size={24} />
          <p className={styles.buttonText}>Download</p>
        </button>
        <button className={styles.iconButton} onClick={onReGenerate}>
          <FiRefreshCw size={24} />
          <p className={styles.buttonText}>Re-generate</p>
        </button>
        <button className={styles.iconButton} onClick={onNewRun}>
          <FiPlusCircle size={24} />
          <p className={styles.buttonText}>New Avatar</p>
        </button>
      </div>

      {pastJobs.length > 0 && (
        <div className={styles.pastJobsContainer}>
          <h4>Previous Generations</h4>
          <div className={styles.pastJobsGrid}>
            {pastJobs.map((job, idx) => (
              <img
                key={job.jobId || idx}
                src={job.avatarUrl}
                alt={`Past job ${idx}`}
                className={styles.pastJobThumbnail}
                onClick={() => onSelectPastJob(job)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;
