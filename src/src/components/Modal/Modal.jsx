import React from "react";
import styles from "./Modal.module.css";
import { FiCheckCircle, FiAlertCircle, FiXCircle } from "react-icons/fi";

const Modal = ({ type, message, onClose, onConfirm }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <FiCheckCircle className={`${styles.icon} ${styles.success}`} />;
      case "warning":
        return <FiAlertCircle className={`${styles.icon} ${styles.warning}`} />;
      case "Warning":
        return <FiXCircle className={`${styles.icon} ${styles.error}`} />;
      default:
        return null;
    }
  };

  const titleClass =
    type === "success" ? styles.h2Success :
      type === "warning" ? styles.h2Warning :
        styles.h2Error;

  const buttonClass =
    type === "success" ? styles.closeButtonSuccess :
      type === "warning" ? styles.closeButtonWarning :
        styles.closeButtonError;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconContainer}>{getIcon()}</div>
        <h2 className={titleClass}>
          {type === "success" ? "Success!" :
            type === "warning" ? "Warning!" : "Warning!"}
        </h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonContainer}>
          <button onClick={onClose} className={`${styles.closeButton} ${buttonClass}`}>
            Cancel
          </button>
          <button onClick={onConfirm} className={`${styles.closeButton} ${buttonClass}`}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
