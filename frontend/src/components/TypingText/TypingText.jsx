import { useState, useEffect } from 'react';
import styles from './TypingText.module.css';

function TypingText({ text = '', speed = 80, cursor = true }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={styles.wrapper}>
      {displayed}
      {cursor && <span className={styles.cursor}>|</span>}
    </span>
  );
}

export default TypingText;
