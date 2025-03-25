import React, { useState } from "react";
import styles from "../styles/components/EmailModal.module.css";

const EmailModal = ({ onSubmit, onClose }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }
    onSubmit(email);
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h3>Enter your email to continue</h3>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <div className={styles.actions}>
          <button onClick={handleSubmit} className={styles.submitButton}>
            Continue
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
    