import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Auth from './Auth.jsx'
import ResetPassword from './ResetPassword.jsx'
import supabase from './supabase.js'

function Root() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for password recovery mode in URL hash
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        // Handle password recovery event
        if (event === "PASSWORD_RECOVERY") {
          setIsRecovery(true);
        }
        
        // Reset recovery mode after successful password update
        if (event === "USER_UPDATED" && isRecovery) {
          setIsRecovery(false);
        }
        
        // Clear recovery mode on sign out
        if (event === "SIGNED_OUT") {
          setIsRecovery(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isRecovery]);

  const handleRecoveryComplete = () => {
    setIsRecovery(false);
    setUser(null);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0C0E14',
        color: '#C9A84C',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 24
      }}>
        Caricamento...
      </div>
    );
  }

  // Password recovery mode
  if (isRecovery && user) {
    return <ResetPassword onComplete={handleRecoveryComplete} />;
  }

  // Not authenticated
  if (!user) {
    return <Auth />;
  }

  // Authenticated - show main app
  return <App user={user} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
