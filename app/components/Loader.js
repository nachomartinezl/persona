// app/components/Loader.js
import React from 'react';
import styles from '../styles/components/Loader.module.css';

const Loader = () => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loader}>
        {/* Simple CSS loader - can be replaced with more complex animation */}
        <div className={styles.spinner}></div>
        <p>Generating Avatar...</p>
      </div>
    </div>
  );
};

export default Loader;