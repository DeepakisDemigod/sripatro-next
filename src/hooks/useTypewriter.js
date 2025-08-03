// Create this as a new file: src/hooks/useTypewriter.js
import { useState, useEffect } from 'react';

const useTypewriter = (textArray, speed = 200) => {
  const [displayText, setDisplayText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  
  useEffect(() => {
    if (currentTextIndex >= textArray.length) {
      setCurrentTextIndex(0);
      setDisplayText('');
      setCharIndex(0);
      return;
    }
    
    if (charIndex >= textArray[currentTextIndex].length) {
      const timeout = setTimeout(() => {
        setCurrentTextIndex(prev => prev + 1);
        setDisplayText('');
        setCharIndex(0);
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    const timeout = setTimeout(() => {
      setDisplayText(prev => prev + textArray[currentTextIndex].charAt(charIndex));
      setCharIndex(prev => prev + 1);
    }, speed);
    
    return () => clearTimeout(timeout);
  }, [charIndex, currentTextIndex, textArray, speed]);
  
  return displayText;
};

export default useTypewriter;
