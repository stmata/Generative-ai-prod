import React from "react";
import styles from "./NoCompletedSession.module.css";
import { IoAlertCircleOutline } from "react-icons/io5";

const NoCompletedSession = () => {
    return (
        <div className={styles.noDataContainer}>
                  <IoAlertCircleOutline className={styles.icon} />
            
            <h2 className={styles.message}>No completed sessions yet!</h2>
            <p className={styles.subMessage}>There is no analysis or data to display.</p>
        </div>
    );
};

export default NoCompletedSession;
