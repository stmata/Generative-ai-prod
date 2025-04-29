import React from "react";
import styles from "./SessionDetails.module.css";

const SessionDetails = ({ id, finalIdea }) => {
  return (
    <div className={styles.containerSession}>
      <h3 className={styles.h3}>Session Details:</h3>
      <br />
      <p className={styles.id}><strong className={styles.strongg}>ID:</strong> {id}</p>
      <p className={styles.finalidea}><strong className={styles.strongg}>Final Idea:</strong> {finalIdea}</p>
    </div>
  );
};

export default SessionDetails;
