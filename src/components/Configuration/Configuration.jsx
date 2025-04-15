import React, { useState, useEffect } from "react";
import ToneSelector from "./widgets/ToneSelector/ToneSelector";
import StyleSelector from "./widgets/StyleSelector/StyleSelector";
import TextSizeSelector from "./widgets/TextSizeSelector/TextSizeSelector";
import Modal from "../Modal/Modal";
import styles from "./Configuration.module.css";
import settingService from "../../services/settingService";

function Configuration() {
    const [tone, setTone] = useState("");
    const [style, setStyle] = useState("");
    const [textSize, setTextSize] = useState("");
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, type: "", message: "" });

    useEffect(() => {
        async function fetchConfig() {
            const config = await settingService.getSettings();
            if (config) {
                setTone(config.tone);
                setStyle(config.style);
                setTextSize(config.textSize);
            }
            setLoading(false);
        }
        fetchConfig();
    }, []);

    const handleSave = async () => {
        const configData = { tone, style, textSize };

        try {
            const response = await settingService.saveSettings(configData);
            if (response.success) {
                setModal({
                    open: true,
                    type: "success",
                    message: "Settings saved successfully! "
                });
            } else {
                setModal({
                    open: true,
                    type: "warning",
                    message: "Failed to save settings. "
                });
            }
        } catch (error) {
            setModal({
                open: true,
                type: "Warning",
                message: "Error saving settings. "
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
            <StyleSelector style={style} setStyle={setStyle} />
            <TextSizeSelector textSize={textSize} setTextSize={setTextSize} />

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
