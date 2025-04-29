import React, { useEffect } from "react";
import styles from "./StyleSelector.module.css";
import { FaListUl, FaPalette, FaFileAlt, FaPaintBrush, FaUserTie, FaFeatherAlt, FaCogs, FaMagic, FaPenFancy } from "react-icons/fa";

function StyleSelector({ style, setStyle }) {
    const stylesOptions = [
        { label: "Simple", icon: <FaListUl />, description: "Clear and concise, without unnecessary details." },
        { label: "Detailed", icon: <FaFileAlt />, description: "Includes thorough explanations and extra information." },
        { label: "Creative", icon: <FaPaintBrush />, description: "Expressive and artistic, with an imaginative touch." },
        { label: "Formal", icon: <FaUserTie />, description: "Professional and structured, ideal for official writing." },
        { label: "Poetic", icon: <FaFeatherAlt />, description: "Elegant and rhythmic, inspired by poetry and prose." },
        { label: "Technical", icon: <FaCogs />, description: "Precise and factual, perfect for manuals or guides." },
        { label: "Magical", icon: <FaMagic />, description: "Enchanting and whimsical, like a fairytale." },
        { label: "Elegant", icon: <FaPenFancy />, description: "Refined and sophisticated, with a polished tone." },
    ];

    useEffect(() => {
        if (!style && setStyle) {
            setStyle(stylesOptions[0].label);
        }
    }, [style, setStyle]);


    return (
        <div className={styles.styleSelector}>
            <h3 className={styles.styleTitle}>
                <FaPalette className={styles.styleTitleIcon} /> Style
            </h3>
            <p className={styles.styleSubtitle}>Choose which style you would like to use.</p>

            <div className={styles.styleOptions}>
                {stylesOptions.map((s) => (
                    <label
                        key={s.label}
                        className={styles.styleLabel}
                        onClick={() => setStyle(s.label)}
                    >
                        <input
                            type="radio"
                            name="style"
                            value={s.label}
                            checked={style === s.label}
                            onChange={() => setStyle(s.label)}
                            className={styles.styleInput}
                        />
                        <span className={styles.styleIcon}>{s.icon}</span>
                        <span className={styles.styleText}>{s.label}</span>
                        <p className={styles.styleDescription}>{s.description}</p>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default StyleSelector;
