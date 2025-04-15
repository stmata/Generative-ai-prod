import React, { useState, useEffect, useRef } from "react";
import {FaChevronDown } from "react-icons/fa";
import { RiCustomSize } from "react-icons/ri";
import styles from "./ConversationSizeSelector.module.css";
import { LuTimer } from "react-icons/lu";
import { RiChatSmileAiLine } from "react-icons/ri";

function ConversationSizeSelector({
    messageValue,
    setMessageValue,
    durationValue,
    setDurationValue,
}) {
    const [messageDropdownOpen, setMessageDropdownOpen] = useState(false);
    const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);

    const messageDropdownRef = useRef(null);
    const durationDropdownRef = useRef(null);

    const messageOptions = [10, 15, 20, 25, 30];
    const durationOptions = ["15 min", "30 min", "45 min", "1 hour", "2 hours"];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                messageDropdownRef.current &&
                !messageDropdownRef.current.contains(e.target)
            ) {
                setMessageDropdownOpen(false);
            }
            if (
                durationDropdownRef.current &&
                !durationDropdownRef.current.contains(e.target)
            ) {
                setDurationDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMessageOptionClick = (option) => {
        setMessageValue(option);
        setMessageDropdownOpen(false);
    };

    const handleDurationOptionClick = (option) => {
        setDurationValue(option);
        setDurationDropdownOpen(false);
    };

    return (
        <div className={styles.selectorContainer}>
            <h3 className={styles.selectorTitle}>
                <RiCustomSize className={styles.selectorIcon} /> Conversation Size
            </h3>
            <p className={styles.selectorSubtitle}>
                Choose how long the conversation should be.
            </p>

            <div className={styles.modeButtons}>
                <div className={styles.modeButtonWrapper}>
                    <button className={styles.modeButton} type="button" disabled>
                        <RiChatSmileAiLine /> Messages
                    </button>
                    <div className={styles.customSelectContainer} ref={messageDropdownRef}>
                        <div
                            className={styles.customSelect}
                            onClick={() => setMessageDropdownOpen((prev) => !prev)}
                        >
                            <span>{messageValue}</span>
                            <FaChevronDown />
                        </div>

                        {messageDropdownOpen && (
                            <ul className={styles.optionList}>
                                {messageOptions.map((opt) => (
                                    <li
                                        key={opt}
                                        onClick={() => handleMessageOptionClick(opt)}
                                        className={
                                            opt === messageValue ? styles.selectedOption : ""
                                        }
                                    >
                                        {opt}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className={styles.modeButtonWrapper}>
                    <button className={styles.modeButton} type="button" disabled>
                        <LuTimer /> Duration
                    </button>
                    <div
                        className={styles.customSelectContainer}
                        ref={durationDropdownRef}
                    >
                        <div
                            className={styles.customSelect}
                            onClick={() => setDurationDropdownOpen((prev) => !prev)}
                        >
                            <span>{durationValue}</span>
                            <FaChevronDown />
                        </div>

                        {durationDropdownOpen && (
                            <ul className={styles.optionList}>
                                {durationOptions.map((opt) => (
                                    <li
                                        key={opt}
                                        onClick={() => handleDurationOptionClick(opt)}
                                        className={
                                            opt === durationValue ? styles.selectedOption : ""
                                        }
                                    >
                                        <span>{opt}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConversationSizeSelector;
