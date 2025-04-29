import React, { useState, useRef, useEffect } from "react";
import styles from "./ConversationSizeSelector.module.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const CustomSelect = ({ options, value, onChange }) => {
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
                className={styles.selected}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                {value} {isOpen ? (
                    <FaChevronUp className={styles.arrow} />
                ) : (
                    <FaChevronDown className={styles.arrow} />
                )}

            </div>
            {isOpen && (
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
