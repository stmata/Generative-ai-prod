import React, { useEffect } from "react";
import styles from "./ToneSelector.module.css";
import { FaRegLaughBeam } from "react-icons/fa";
import { IoBriefcaseOutline } from "react-icons/io5";
import { PiGavel, PiCoffeeBold } from "react-icons/pi";
import { HiOutlineLightBulb } from "react-icons/hi";
import { FaPenNib } from "react-icons/fa";

function ToneSelector({ tone, setTone }) {
    const tones = [
        { label: ["Formal", "& Professional"], icon: <PiGavel /> },
        { label: ["Friendly", "& Casual"], icon: <PiCoffeeBold /> },
        { label: ["Empathic", "& Supportive"], icon: <HiOutlineLightBulb /> },
        { label: ["Light", "& Humorous"], icon: <FaRegLaughBeam /> },
        { label: ["Authoritative", "& Directive"], icon: <IoBriefcaseOutline /> },
    ];

    useEffect(() => {
        if (!tone && setTone) {
            setTone(tones[0].label.join(" "));
        }
    }, [tone, setTone]);

    return (
        <div className={styles.toneSelector}>
            <h3 className={styles.toneTitle}>
                <FaPenNib className={styles.toneTitleIcon} /> Tone
            </h3>
            <p className={styles.toneSubtitle}>Choose which tone you would like to use.</p>

            <div className={styles.toneOptions}>
                {tones.map((t) => {
                    const fullLabel = t.label.join(" ");
                    return (
                        <label
                            key={fullLabel}
                            className={styles.toneLabel}
                            onClick={() => setTone(fullLabel)}
                        >
                            <input
                                type="radio"
                                name="tone"
                                value={fullLabel}
                                checked={tone === fullLabel}
                                onChange={() => setTone(fullLabel)}
                                className={styles.toneInput}
                            />
                            <span className={styles.toneIcon}>{t.icon}</span>
                            <span className={styles.toneText}>
                                {t.label.map((line, i) => (
                                    <div key={i}>{line}</div>
                                ))}
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

export default ToneSelector;
