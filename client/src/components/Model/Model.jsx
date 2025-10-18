import React, { useEffect, useState } from "react";
import "./Model.css";

export default function Model({ isOpen, onClose, children }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // If not open, return nothing
  if (!isOpen) return null;

  return (
    <div 
      className={`modal-overlay ${isVisible ? 'visible' : ''}`} 
      onClick={onClose}
    >
      <div
        className={`modal-content ${isVisible ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}