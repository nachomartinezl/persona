// app/components/AvatarDisplay.js
import React from 'react';
import styles from '../styles/components/AvatarDisplay.module.css';
import { FiDownload, FiRefreshCw, FiPlusCircle } from 'react-icons/fi'; // Import icons

const AvatarDisplay = ({ avatarUrl, onNewRun, onReGenerate }) => {

  const handleDownloadImage = () => {
    if (avatarUrl) {
      const link = document.createElement('a');
      link.href = avatarUrl;
      link.download = 'ai_avatar.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={styles.avatarDisplayContainer}>
      <h2>Your AI Avatar</h2>
      {avatarUrl ? (
        <img src={avatarUrl} alt="AI Generated Avatar" className={styles.avatarImage} />
      ) : (
        <p>Error loading avatar.</p>
      )}
      <div className={styles.buttonContainer}>
        <button className={styles.iconButton} onClick={handleDownloadImage}>
          <FiDownload size={24} /> {/* Download Icon */}
          <p className={styles.buttonText}>Download</p> {/* Text label below icon */}
        </button>
        <button className={styles.iconButton} onClick={onReGenerate}>
          <FiRefreshCw size={24} /> {/* Re-generate Icon */}
          <p className={styles.buttonText}>Re-generate</p> {/* Text label below icon */}
        </button>
        <button className={styles.iconButton} onClick={onNewRun}>
          <FiPlusCircle size={24} /> {/* New Avatar Icon */}
          <p className={styles.buttonText}>New Avatar</p> {/* Text label below icon */}
        </button>
      </div>
    </div>
  );
};

export default AvatarDisplay;