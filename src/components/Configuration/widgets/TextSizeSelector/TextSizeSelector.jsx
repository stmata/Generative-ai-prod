import React, { useState, useEffect } from "react";
import styles from "./TextSizeSelector.module.css";
import { FaFile, FaFileAlt, FaFileWord, FaTextHeight, FaSortAmountUp } from "react-icons/fa";

const sizes = [
  {
    label: "Short",
    icon: <FaFile />,
    description: "Around 1–5 ideas. Each idea may include multiple sentences.",
    ideaCountMin: 1,
    ideaCountMax: 5,
  },
  {
    label: "Medium",
    icon: <FaFileAlt />,
    description: "Around 6–10 ideas, each developed with several sentences.",
    ideaCountMin: 6,
    ideaCountMax: 10,
  },
  {
    label: "Long",
    icon: <FaFileWord />,
    description: "More than 10 ideas, each thoroughly explained.",
    ideaCountMin: 11,
    ideaCountMax: Infinity,
  },
];

function TextSizeSelector({
  textSize = "Short",
  setTextSize,
  onIntervalChange,
  charMin,
  setCharMin,
  charMax,
  setCharMax,
  intervalValue,
}) {
  const current = sizes.find((s) => s.label === textSize) || sizes[0];

  useEffect(() => {
    if (intervalValue && intervalValue.min !== undefined) {
      const estimatedMin = Math.floor(intervalValue.min / current.ideaCountMin);
      setCharMin(String(estimatedMin));
    }
    if (
      intervalValue &&
      intervalValue.max !== undefined &&
      intervalValue.max !== Infinity &&
      current.ideaCountMax !== Infinity
    ) {
      const estimatedMax = Math.ceil(intervalValue.max / current.ideaCountMax);
      setCharMax(String(estimatedMax));
    }
  }, [intervalValue, textSize]);

  const parsedMin = parseInt(charMin, 10) || 0;
  const parsedMax = parseInt(charMax, 10) || 0;

  const minTotal = parsedMin * current.ideaCountMin;
  const maxTotal =
    current.ideaCountMax === Infinity
      ? Infinity
      : parsedMax * current.ideaCountMax;
  const displayMax =
    maxTotal === Infinity ? "+∞" : `${maxTotal} characters`;

  useEffect(() => {
    if (onIntervalChange) {
      onIntervalChange({
        min: minTotal,
        max: maxTotal,
      });
    }
  }, [minTotal, maxTotal, onIntervalChange]);

  return (
    <div className={styles.responseSizeSelector}>
      <div className={styles.selectorColumn}>
        <h3 className={styles.textSizeTitle}>
          <FaTextHeight className={styles.textSizeTitleIcon} /> Number of Ideas
        </h3>
        <p className={styles.textSizeSubtitle}>
          Choose how detailed the response should be.
        </p>
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
                    <span className={styles.textSizeLabelText}>
                      {sz.label}
                    </span>
                  </span>
                  <p className={styles.textSizeDescription}>
                    {sz.description}
                  </p>
                </div>
                <div className={styles.textSizeToggle}>
                  <span
                    className={`${styles.toggle} ${textSize === sz.label ? styles.active : ""}`}
                  />
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.selectorColumn}>
        <h3 className={styles.textSizeTitle}>
          <FaSortAmountUp className={styles.textSizeTitleIcon} /> Character Range
        </h3>
        <p className={styles.textSizeSubtitle}>
  Each idea is explained with multiple sentences. So the final text may exceed the range below.
  Enter minimum and maximum characters <strong>per idea</strong>. The total response will be approximately.<br />
  <em>If the minimum exceeds the maximum, it will be reset to 0 by default.</em>
</p>


        <div className={styles.charInputStack}>
          <div className={styles.charInput}>
            <label htmlFor="minChars">Min characters per idea:</label>
            <input
              type="text"
              id="minChars"
              value={charMin}
              onChange={(e) => {
                const val = e.target.value;
                if (!/^\d*$/.test(val)) return; 

                const num = parseInt(val, 10) || 0;
                const maxNum = parseInt(charMax, 10) || 0;

                if (num > maxNum) {
                  setCharMin("0"); 
                } else {
                  setCharMin(val);
                }
              }}
              min="0"
              className={styles.customInput}
            />
          </div>
          <div className={styles.charInput}>
            <label htmlFor="maxChars">Max characters per idea:</label>
            <input
              type="text"
              id="maxChars"
              value={charMax}
              onChange={(e) => {
                const val = e.target.value;
                if (!/^\d*$/.test(val)) return; 

                const num = parseInt(val, 10) || 0;
                const minNum = parseInt(charMin, 10) || 0;

                if (num < minNum) {
                  setCharMin("0"); 
                  setCharMax(val);
                } else {
                  setCharMax(val);
                }
              }}
              min="0"
              className={styles.customInput}
            />
          </div>
        </div>

        <div className={styles.totalEstimate}>
          <p><strong>Total Approximate Length:</strong></p>
          <p>[{minTotal} – {displayMax}]</p>
        </div>
      </div>
    </div>
  );
}

export default TextSizeSelector;
