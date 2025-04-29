import React, { useState, useRef, useEffect } from "react";
import styles from "./AnalysisTable.module.css";

const CustomSelect = ({ options, value, onChange, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef();

    const handleOptionClick = (opt) => {
        onChange(opt);
        setIsOpen(false);
    };

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
        <div className={styles.customSelect} ref={selectRef}>
        <div
          className={`${styles.selected} ${disabled ? styles.disabled : ""} ${isOpen ? styles.open : ""}`}
          onClick={() => {
            if (!disabled) setIsOpen((prev) => !prev);
          }}
        >
          {value}
         
        </div>
      
        {isOpen && !disabled && (
          <ul className={styles.optionsList}>
            {options.map((opt) => (
              <li
                key={opt}
                className={
                  opt === value
                    ? styles.selectedOption
                    : styles.unselectedOption
                }
                onClick={() => handleOptionClick(opt)}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
      
    );
};

export default CustomSelect;
