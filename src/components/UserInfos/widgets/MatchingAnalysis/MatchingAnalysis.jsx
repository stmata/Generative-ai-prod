import React from "react";
import { FaBrain } from "react-icons/fa";
import { FaRobot } from "react-icons/fa6";
import styles from "./MatchingAnalysis.module.css";

const MatchingAnalysis = ({ originalityScore, matchingScore, matchingAnalysis }) => {
  const isMatchingHigher = matchingScore > originalityScore;
  const isEqual = matchingScore === originalityScore;

  return (
    <div className={styles.containerMatching}>
      <h3 className={styles.h3}>Matching Analysis:</h3>

      <div className={styles.scoresContainer}>
        <div className={`${styles.scoreBox} ${!isMatchingHigher && !isEqual ? styles.greenColor : ""}`}>
          <FaBrain className={styles.icon} />
          <p className={styles.scoreValue}>{originalityScore}%</p>
          <p className={styles.scoreLabel}>Human Creativity</p>
        </div>

        <div className={`${styles.scoreBox} ${isMatchingHigher ? styles.redColor : ""}`}>
          <FaRobot className={styles.icon} />
          <p className={styles.scoreValue}>{matchingScore}%</p>
          <p className={styles.scoreLabel}>AI Score</p>
        </div>
      </div>

      <h4 className={styles.h4}>Influence:</h4>
      <p className={styles.pMatching}>{matchingAnalysis.influence || "No data available"}</p>

      <h4 className={styles.h4}>Original Elements:</h4>
      <p className={styles.pMatching}>{matchingAnalysis.original_elements || "No data available"}</p>

      <h4 className={styles.h4}>Overall Assessment:</h4>
      <p className={styles.pMatching}>{matchingAnalysis.overall_assessment || "No data available"}</p>
    </div>
  );
};

export default MatchingAnalysis;
