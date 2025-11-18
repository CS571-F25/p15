import { useCallback, useState } from 'react';
import './IntroOverlay.css';

interface IntroOverlayProps {
  onFinish: () => void;
}

const FADE_OUT_DURATION = 800; // ms

function IntroOverlay({ onFinish }: IntroOverlayProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleBegin = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      onFinish();
    }, FADE_OUT_DURATION);
  }, [isClosing, onFinish]);

  return (
    <div className={`intro-overlay ${isClosing ? 'intro-overlay--closing' : ''}`}>
      <div className="intro-overlay__background" />
      <div className="intro-overlay__content">
        <p className="intro-overlay__eyebrow">Realm Entry Protocol</p>
        <h1 className="intro-overlay__title">Welcome to Azterra</h1>
        <p className="intro-overlay__subtitle">
          Chart the ancient world, uncover hidden lore, and prepare your party.
        </p>
        <button
          type="button"
          className="intro-overlay__button"
          onClick={handleBegin}
        >
          Begin Exploring
        </button>
      </div>
    </div>
  );
}

export default IntroOverlay;
