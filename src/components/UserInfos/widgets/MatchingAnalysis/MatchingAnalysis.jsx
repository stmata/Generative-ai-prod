import React from "react";
import { FaBrain } from "react-icons/fa";
import { FaRobot } from "react-icons/fa6";
import styles from "./MatchingAnalysis.module.css";
import { FaComments } from "react-icons/fa";

const getBlueColor = (value) => {
  const blueScale = ["#bbdefb", "#64b5f6", "#42a5f5", "#1e88e5", "#1976d2"];
  const index = Math.min(Math.floor((value / 100) * blueScale.length), blueScale.length - 1);
  return blueScale[index];
};

const getGreenGradient = (value) => {
  const greenScale = ["#c8e6c9", "#81c784", "#4caf50", "#388e3c", "#2e7d32"];
  const index = Math.min(Math.floor((value / 100) * greenScale.length), greenScale.length - 1);
  return greenScale[index];
};

const getRedGradient = (value) => {
  const redScale = ["#ffcdd2", "#ef9a9a", "#e57373", "#d32f2f", "#c62828"];
  const index = Math.min(Math.floor((value / 100) * redScale.length), redScale.length - 1);
  return redScale[index];
};

const MatchingAnalysis = ({ originalityScore, conv, matchingScore, matchingAnalysis }) => {
  const isMatchingHigher = matchingScore > originalityScore;
  const isEqual = matchingScore === originalityScore;

  return (
    <div className={styles.containerMatching}>
      <h3 className={styles.h3}>Matching Analysis:</h3>

      <div className={styles.scoresContainer}>
        <div className={styles.scoreBox}>
          <FaBrain className={styles.icon} style={{ color: getGreenGradient(originalityScore) }} />
          <p className={styles.scoreValue} style={{ color: getGreenGradient(originalityScore) }}>
            {originalityScore}%
          </p>
          <p className={styles.scoreLabel}>Human Influence Score</p>
        </div>

        <div className={styles.scoreBox}>
          <FaRobot className={styles.icon} style={{ color: getRedGradient(matchingScore) }} />
          <p className={styles.scoreValue} style={{ color: getRedGradient(matchingScore) }}>
            {matchingScore}%
          </p>
          <p className={styles.scoreLabel}>AI Influence Score</p>
        </div>

        <div className={styles.scoreBox}>
          <FaComments className={styles.iconConv} style={{ color: getBlueColor(conv) }} />
          <p className={styles.scoreValueConv} style={{ color: getBlueColor(conv) }}>
            {conv}%
          </p>
          <p className={styles.scoreLabel}>Interaction Influence Score</p>
        </div>


      </div>
      <h4 className={styles.h4}>Role Analysis:</h4>
      <p className={styles.pMatching}>{matchingAnalysis.role_analysis || "No data available"}</p>

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
