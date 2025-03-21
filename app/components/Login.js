// app/components/Login.js
import React from 'react';
import styles from '../styles/components/Login.module.css';
import { signIn } from 'next-auth/react';

const Login = () => {
  return (
    <div className={styles.loginContainer}>
      <h1>Persona</h1>
      <p>Login to generate your AI Avatar.</p>

      <button className={styles.googleButton} onClick={() => signIn('google')}>
        Continue with Google
      </button>

      {/* Optional username/password login - for now, focus on Google */}
      {/* <div className={styles.orDivider}><span>or</span></div>
      <form className={styles.loginForm}>
        <input type="text" placeholder="Username" className={styles.inputField} />
        <input type="password" placeholder="Password" className={styles.inputField} />
        <button type="submit" className={styles.submitButton}>Login</button>
      </form> */}
    </div>
  );
};

export default Login;