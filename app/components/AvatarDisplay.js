// app/components/AvatarDisplay.js
import React from "react";
import styles from "../styles/components/AvatarDisplay.module.css";
import { FiDownload, FiRefreshCw, FiPlusCircle } from "react-icons/fi";

const AvatarDisplay = ({
  avatarUrl,
  onNewRun,
  onReGenerate,
  pastJobs = [],
  onSelectPastJob,
}) => {
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
      <h2>Your AI Avatar</h2>

      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="AI Generated Avatar"
          className={styles.avatarImage}
        />
      ) : (
        <p>Error loading avatar.</p>
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

      {pastJobs.length > 1 && (
        <div className={styles.pastJobsContainer}>
          <h4>Previous Generations</h4>
          <div className={styles.pastJobsGrid}>
            {pastJobs.map((job, idx) => (
              <img
                key={job.jobId || idx}
                src={job.avatarUrl}
                alt={`Past job ${idx}`}
                className={styles.pastJobThumbnail}
                onClick={() => onSelectPastJob(job.avatarUrl)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;
