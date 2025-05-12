import React, { useState, useEffect } from "react";
import ToneSelector from "./widgets/ToneSelector/ToneSelector";
import TextSizeSelector from "./widgets/TextSizeSelector/TextSizeSelector";
import Modal from "../Modal/Modal";
import styles from "./Configuration.module.css";
import settingService from "../../services/settingService";
import ConversationSizeSelector from "./widgets/ConversationSizeSelector/ConversationSizeSelector";
import GenderToneSelector from "./widgets/GenderToneSelector/GenderToneSelector";

const sizes = [
    {
      label: "Short",
      ideaCountMin: 1,
      ideaCountMax: 5,
    },
    {
      label: "Medium",
      ideaCountMin: 6,
      ideaCountMax: 10,
    },
    {
      label: "Long",
      ideaCountMin: 11,
      ideaCountMax: Infinity,
    },
  ];
  
function Configuration() {
    const [tone, setTone] = useState("");
    const [textSize, setTextSize] = useState("Short");
    const [messageValue, setMessageValue] = useState("10");
    const [durationValue, setDurationValue] = useState("15 min");
    const [genderTone, setGenderTone] = useState("Neutral");
    const [intervalValue, setIntervalValue] = useState({ min: 0, max: 0 });

    const [charMin, setCharMin] = useState("0");
    const [charMax, setCharMax] = useState("0");

    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, type: "", message: "" });

    useEffect(() => {
        async function fetchConfig() {
            try {
                const config = await settingService.getSettings();
                if (config) {
                    if (config.tone) setTone(config.tone);
                    if (config.genderTone) setGenderTone(config.genderTone);
                    if (config.textSize) setTextSize(config.textSize);
                    if (config.messageValue !== undefined) setMessageValue(String(config.messageValue));
                    if (config.durationValue) setDurationValue(config.durationValue);

                    if (config.intervalValue) {
                        const currentSize = sizes.find((s) => s.label === config.textSize);
                        if (currentSize) {
                            if (config.intervalValue.min !== undefined) {
                                const minChar = Math.floor(config.intervalValue.min / currentSize.ideaCountMin);
                                setCharMin(String(minChar));
                            }
                            if (
                                config.intervalValue.max !== undefined &&
                                config.intervalValue.max !== "∞" &&
                                currentSize.ideaCountMax !== Infinity
                            ) {
                                const maxChar = Math.ceil(config.intervalValue.max / currentSize.ideaCountMax);
                                setCharMax(String(maxChar));
                            }
                        }
                        setIntervalValue(config.intervalValue);
                    }
                }
            } catch (error) {
                console.error("Error fetching config:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, []);

    const handleSave = () => {
        const configData = {
            tone,
            genderTone,
            textSize,
            messageValue: parseInt(messageValue, 10) || 0,
            durationValue,
            intervalValue: {
                min: intervalValue.min || 0,
                max: intervalValue.max === Infinity ? "∞" : intervalValue.max || 0,
            },
        };
        settingService.saveSettings(configData)
            .then(response => {
                if (response.success) {
                    setModal({ open: true, type: "success", message: "Settings saved successfully!" });
                } else {
                    setModal({ open: true, type: "warning", message: "Failed to save settings." });
                }
            })
            .catch(() => {
                setModal({ open: true, type: "warning", message: "Error saving settings." });
            });
    };

    const closeModal = () => setModal({ open: false, type: "", message: "" });

    if (loading) return <p>Loading configurations...</p>;

    return (
        <div className={styles.containerConfig}>
            <ToneSelector tone={tone} setTone={setTone} />
            <GenderToneSelector genderTone={genderTone} setGenderTone={setGenderTone} />

            <TextSizeSelector
                textSize={textSize}
                setTextSize={setTextSize}
                onIntervalChange={setIntervalValue}
                charMin={charMin}
                setCharMin={setCharMin}
                charMax={charMax}
                setCharMax={setCharMax}
                intervalValue={intervalValue}
            />

            <ConversationSizeSelector
                messageValue={messageValue}
                setMessageValue={setMessageValue}
                durationValue={durationValue}
                setDurationValue={setDurationValue}
            />

            <button className={styles.saveButton} onClick={handleSave}>
                Save
            </button>

            {modal.open && (
                <Modal
                    type={modal.type}
                    message={modal.message}
                    onClose={closeModal}
                    onConfirm={closeModal}
                />
            )}
        </div>
    );
}

export default Configuration;
