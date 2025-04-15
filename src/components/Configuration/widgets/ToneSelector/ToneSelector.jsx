import React, { useEffect } from "react";
import styles from "./ToneSelector.module.css";
import { FaRegSmile, FaRegMeh, FaPenNib, FaRegLaughBeam } from "react-icons/fa";
import { IoBriefcaseOutline } from "react-icons/io5";
import { TiThumbsUp } from "react-icons/ti";
import { PiGavel, PiCoffeeBold } from "react-icons/pi";
import { HiOutlineLightBulb } from "react-icons/hi";

function ToneSelector({ tone, setTone }) {
    const tones = [
        { label: "Friendly", icon: <FaRegSmile /> },
        { label: "Professional", icon: <IoBriefcaseOutline /> },
        { label: "Neutral", icon: <FaRegMeh /> },
        { label: "Encouraging", icon: <TiThumbsUp /> },
        { label: "Humorous", icon: <FaRegLaughBeam /> },
        { label: "Serious", icon: <PiGavel /> },
        { label: "Casual", icon: <PiCoffeeBold /> },
        { label: "Inspirational", icon: <HiOutlineLightBulb /> },
    ];

    useEffect(() => {
        if (!tone && setTone) {
            setTone(tones[0].label);
        }
    }, [tone, setTone]);


    return (
        <div className={styles.toneSelector}>
            <h3 className={styles.toneTitle}>
                <FaPenNib className={styles.toneTitleIcon} /> Tone
            </h3>
            <p className={styles.toneSubtitle}>Choose which tone you would like to use.</p>

            <div className={styles.toneOptions}>
                {tones.map((t) => (
                    <label
                        key={t.label}
                        className={styles.toneLabel}
                        onClick={() => setTone(t.label)}
                    >
                        <input
                            type="radio"
                            name="tone"
                            value={t.label}
                            checked={tone === t.label}
                            onChange={() => setTone(t.label)}
                            className={styles.toneInput}
                        />
                        <span className={styles.toneIcon}>{t.icon}</span>
                        <span className={styles.toneText}>{t.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default ToneSelector;
