import React, { useState, useEffect } from "react";
import { RiCustomSize } from "react-icons/ri";
import { LuTimer } from "react-icons/lu";
import { RiChatSmileAiLine } from "react-icons/ri";
import styles from "./ConversationSizeSelector.module.css";
import CustomSelect from "./CustomSelect";
import PropTypes from "prop-types";

function ConversationSizeSelector({
    messageValue,
    setMessageValue,
    durationValue,
    setDurationValue,
}) {
    const [durationUnit, setDurationUnit] = useState("min");
    const [inputDuration, setInputDuration] = useState("");

    const handleMessageChange = (e) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) {
            setMessageValue(val);
        }
    };

    useEffect(() => {
        if (typeof durationValue === "string") {
            const parts = durationValue.split(" ");
            if (parts.length === 2) {
                const [val, unit] = parts;
                if (!isNaN(parseInt(val))) {
                    setInputDuration(val);
                    setDurationUnit(unit);
                }
            } else if (!isNaN(parseInt(durationValue))) {
                setInputDuration(durationValue);
            }
        }
    }, []);

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
                        <p className={styles.durationHint}>
                            Only whole numbers allowed. No letters, dots, or commas.
                        </p>
                    </button>
                    <div className={styles.durationInputWrapper}>
                        <input
                            type="text"
                            value={messageValue}
                            onChange={handleMessageChange}
                            placeholder="e.g. 2"
                            className={styles.customInput}
                        />
                    </div>
                </div>
                <div className={styles.modeButtonWrapper}>
                    <button className={styles.modeButton} type="button" disabled>
                        <LuTimer /> Duration
                        <p className={styles.durationHint}>
                            Max: 60 min or 24 hours depending on the unit selected.
                        </p>
                    </button>
                    <div className={styles.durationInputWrapper}>
                        <input
                            type="text"
                            value={inputDuration}
                            onChange={(e) => {
                                const val = e.target.value;

                                if (!/^\d*$/.test(val)) return;

                                if (val === "") {
                                    setInputDuration("");
                                    setDurationValue("");
                                    return;
                                }
                                const intVal = parseInt(val, 10);
                                if (
                                    (durationUnit === "min" && intVal <= 60) ||
                                    (durationUnit === "hours" && intVal <= 24)
                                ) {
                                    setInputDuration(val);
                                    setDurationValue(`${val} ${durationUnit}`);
                                }
                            }}

                            placeholder="e.g. 2"
                            className={styles.customInput}
                        />
                        <CustomSelect
                            options={["min", "hours"]}
                            value={durationUnit}
                            onChange={(val) => {
                                setDurationUnit(val);
                                if (inputDuration) {
                                    setDurationValue(`${inputDuration} ${val}`);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
ConversationSizeSelector.propTypes = {
    messageValue: PropTypes.string.isRequired,
    setMessageValue: PropTypes.func.isRequired,
    durationValue: PropTypes.string.isRequired,
    setDurationValue: PropTypes.func.isRequired,
};

export default ConversationSizeSelector;
