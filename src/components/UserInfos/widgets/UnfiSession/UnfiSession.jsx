import React from "react";
import styles from "./UnfiSession.module.css";
import { IoAlertCircleOutline } from "react-icons/io5";

const UnfiSession = () => {
  return (
    <div className={styles.unfiSessionContainer}>
      <IoAlertCircleOutline className={styles.icon} />
      <h2 className={styles.titleUn}>Incomplete Session</h2>
      <p className={styles.messageUn}>
        The user has not completed the session, so analysis is not available.
      </p>
    </div>
  );
};

export default UnfiSession;
