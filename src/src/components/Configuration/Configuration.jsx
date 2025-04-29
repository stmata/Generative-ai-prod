import React, { useState, useEffect } from "react";
import ToneSelector from "./widgets/ToneSelector/ToneSelector";
import TextSizeSelector from "./widgets/TextSizeSelector/TextSizeSelector";
import Modal from "../Modal/Modal";
import styles from "./Configuration.module.css";
import settingService from "../../services/settingService";
import ConversationSizeSelector from "./widgets/ConversationSizeSelector/ConversationSizeSelector";

function Configuration() {
    const [tone, setTone] = useState("");
    const [textSize, setTextSize] = useState("");
    const [messageValue, setMessageValue] = useState("10");
    const [durationValue, setDurationValue] = useState("15 min");

    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, type: "", message: "" });

    useEffect(() => {
        async function fetchConfig() {
            try {
                const config = await settingService.getSettings();
                if (config) {
                    if (config.tone) setTone(config.tone);
                    if (config.textSize) setTextSize(config.textSize);
                    if (config.messageValue !== undefined) setMessageValue(String(config.messageValue));
                    if (config.durationValue) setDurationValue(config.durationValue);
                }
            } catch (error) {
                console.error("Error fetching config:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, []);

    const handleSave = async () => {
        const configData = {
            tone,
            textSize,
            messageValue: parseInt(messageValue, 10) || 0,
            durationValue,
        };
        try {
            const response = await settingService.saveSettings(configData);
            if (response.success) {
                setModal({
                    open: true,
                    type: "success",
                    message: "Settings saved successfully! ",
                });
            } else {
                setModal({
                    open: true,
                    type: "warning",
                    message: "Failed to save settings. ",
                });
            }
        } catch (error) {
            setModal({
                open: true,
                type: "warning",
                message: "Error saving settings. ",
            });
        }
    };

    const closeModal = () => {
        setModal({ open: false, type: "", message: "" });
    };

    if (loading) {
        return <p>Loading configurations...</p>;
    }

    return (
        <div className={styles.containerConfig}>
            <ToneSelector tone={tone} setTone={setTone} />
            {/* <StyleSelector style={style} setStyle={setStyle} /> */}
            <TextSizeSelector textSize={textSize} setTextSize={setTextSize} />

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
