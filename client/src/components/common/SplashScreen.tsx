import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  minDuration = 2800 
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Entering Atelier...');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Stage messages for refined loading feel
    const stages = [
      { at: 15, text: 'Awakening Studio...' },
      { at: 45, text: 'Curating Artisanal Collections...' },
      { at: 75, text: 'Polishing Gallery Works...' },
      { at: 95, text: 'Welcome to The Shefalis Space' }
    ];

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.round((elapsed / minDuration) * 100), 100);
      setProgress(currentProgress);

      const matchedStage = [...stages].reverse().find(s => currentProgress >= s.at);
      if (matchedStage) {
        setStatusText(matchedStage.text);
      }

      if (elapsed >= minDuration) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(() => {
          onComplete();
        }, 600); // Wait for exit animation
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <div 
      className={`splash-wrapper ${isExiting ? 'splash-exit' : ''}`}
      onClick={handleSkip}
      role="banner"
      aria-label="Welcome Splash Screen"
      title="Click anywhere to enter immediately"
    >
      {/* Ambient background glows */}
      <div className="splash-orb splash-orb-1" />
      <div className="splash-orb splash-orb-2" />
      <div className="splash-orb splash-orb-3" />

      {/* Main emblem and card */}
      <div className="splash-content">
        <div className="splash-logo-container">
          <div className="splash-aura" />
          <div className="splash-ripple" />
          <div className="splash-ripple splash-ripple-delayed" />
          <img 
            src="/hastha-logo.png" 
            alt="The Hastha - The Shefalis Space" 
            className="splash-logo-image"
          />
        </div>

        {/* Title & Tagline */}
        <div className="splash-header">
          <h1 className="splash-title">THE SHEFALIS SPACE</h1>
          <p className="splash-subtitle">CONTEMPORARY ARTISANAL STUDIO</p>
          <p className="splash-quote">"Made with soul. With Passion and Meditation."</p>
        </div>

        {/* Interactive Luxury Loader */}
        <div className="splash-loader-box">
          <div className="splash-progress-track">
            <div 
              className="splash-progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="splash-status-row">
            <span className="splash-status-text">{statusText}</span>
            <span className="splash-percentage">{progress}%</span>
          </div>
        </div>

        {/* Subtle skip prompt */}
        <button 
          className="splash-enter-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
        >
          <span>Tap anywhere or press Enter to skip</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
