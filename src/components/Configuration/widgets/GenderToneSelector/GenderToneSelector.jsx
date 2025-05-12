import React, { useEffect } from "react";
import styles from "./GenderToneSelector.module.css";
import { FaGenderless, FaFemale, FaMale } from "react-icons/fa";
import { FaPenNib } from "react-icons/fa";

function GenderToneSelector({ genderTone, setGenderTone }) {
    const options = [
        { label: "Feminine", icon: <FaFemale /> },
        { label: "Masculine", icon: <FaMale /> },
        { label: "Neutral", icon: <FaGenderless /> },
    ];

    useEffect(() => {
        if (!genderTone && setGenderTone) {
            setGenderTone("Neutral");
        }
    }, [genderTone, setGenderTone]);

    return (
        <div className={styles.genderSelector}>
            <h3 className={styles.genderTitle}>
                <FaPenNib className={styles.genderTitleIcon} />Gender Tone
            </h3>
            <p className={styles.genderSubtitle}>Choose a gendered tone preference for the assistant.</p>

            <div className={styles.genderOptions}>
                {options.map((option) => (
                    <label
                        key={option.label}
                        className={styles.genderLabel}
                        onClick={() => setGenderTone(option.label)}
                    >
                        <input
                            type="radio"
                            name="genderTone"
                            value={option.label}
                            checked={genderTone === option.label}
                            onChange={() => setGenderTone(option.label)}
                            className={styles.genderInput}
                        />
                        <span className={styles.genderIcon}>{option.icon}</span>
                        <span className={styles.genderText}>{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default GenderToneSelector;
