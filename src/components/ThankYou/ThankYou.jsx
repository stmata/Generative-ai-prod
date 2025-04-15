import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ThankYou.module.css";

const ThankYou = () => {
  const navigate = useNavigate();

  const handleRestart = () => {
    navigate("/");
  };

  return (
    <div className={styles.containerThanks}>
      <div className={styles.thankYouBox}>
        <div className={styles.line}></div>
        <h1 className={styles.title}>Thank You!</h1>
        <p className={styles.message}>
          We truly appreciate you for using our app. Your engagement means a lot to us, and we look forward to serving you again.
        </p>
        <button className={styles.button} onClick={handleRestart}>
          Start a New Session
        </button>
      </div>
    </div>
  );
};

export default ThankYou;
