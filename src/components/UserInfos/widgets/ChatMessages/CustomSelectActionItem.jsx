import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatMessages.module.css";

const CustomSelectActionItem = ({ value, options, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.actionItem} ref={selectRef}>
      <div
        className={styles.customActionSelect}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
      >
        {value}
      </div>

      {isOpen && !disabled && (
        <ul className={styles.optionsListAction}>
          {options.map((opt) => (
            <li
              key={opt}
              className={styles.optionItemAction}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelectActionItem;
