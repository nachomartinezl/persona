// app/page.js
'use client'; // Client-side rendering for interactivity

import React from 'react';
// import Login from './components/Login';  <-- REMOVE LOGIN IMPORT
import MainScreen from './components/MainScreen';
// import { SessionProvider } from 'next-auth/react';  <-- REMOVE SessionProvider IMPORT

export default function Home() {
  // const [session, setSession] = React.useState(null); // No session state needed now
  const isLoggedIn = true; // Always consider user logged in for this simplified version

  return (
    // <SessionProvider>  <-- REMOVE SessionProvider
      <div className="app-container">
        {isLoggedIn ? <MainScreen /> : null /*<Login onLogin={(sessionData) => setSession(sessionData)} />*/} {/* Always render MainScreen directly */}
      </div>
    // </SessionProvider> <-- REMOVE SessionProvider
  );
}