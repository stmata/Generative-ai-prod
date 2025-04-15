import React, { useEffect } from "react";
import styles from "./TextSizeSelector.module.css";
import { FaFile, FaFileAlt, FaFileWord, FaTextHeight } from "react-icons/fa";

function TextSizeSelector({ textSize, setTextSize }) {
  const sizes = [
    { label: "Short", icon: <FaFile />, description: "A brief response (1-5 sentences)." },
    { label: "Medium", icon: <FaFileAlt />, description: "A balanced response (6-10 sentences)." },
    { label: "Long", icon: <FaFileWord />, description: "A detailed response (10+ sentences)." },
  ];

  useEffect(() => {
    if (!textSize && setTextSize) {
      setTextSize(sizes[0].label);
    }
  }, [textSize, setTextSize]);


  return (
    <div className={styles.textSizeSelector}>
      <h3 className={styles.textSizeTitle}>
        <FaTextHeight className={styles.textSizeTitleIcon} /> Text Size
      </h3>
      <p className={styles.textSizeSubtitle}>Choose how detailed the response should be.</p>

      <div className={styles.textSizeOptions}>
        {sizes.map((sz) => (
          <label
            key={sz.label}
            className={styles.textSizeLabel}
            onClick={() => setTextSize(sz.label)}
          >
            <input
              type="radio"
              name="textSize"
              value={sz.label}
              checked={textSize === sz.label}
              onChange={() => setTextSize(sz.label)}
              className={styles.textSizeInput}
            />
            <div className={styles.textSizeContent}>
              <div className={styles.textSizeLeft}>
                <span className={styles.textSizeText}>
                  <span className={styles.icon}>{sz.icon}</span>
                  <span className={styles.textSizeLabelText}>{sz.label}</span>
                </span>
                <p className={styles.textSizeDescription}>{sz.description}</p>
              </div>
              <div className={styles.textSizeToggle}>
                <span className={`${styles.toggle} ${textSize === sz.label ? styles.active : ""}`} />
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

export default TextSizeSelector;
