import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./IdeaModal.module.css";
import { addFinalIdea } from "../../services/addFinalIdea";
import { analyzeSession } from "../../services/analysis";
import { v4 as uuidv4 } from "uuid";

const IdeaModal = ({ onClose }) => {
    const [idea, setIdea] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (isSending) setError("");
    }, [isSending]);

    const handleSendIdea = async () => {
        if (!idea.trim()) return;
        setIsSending(true);

        try {
            const oldSessionId = localStorage.getItem("session_id");
            if (!oldSessionId) {
                throw new Error("No existing session_id in localStorage");
            }

            await addFinalIdea(idea, oldSessionId);
            const analysisResult = await analyzeSession(oldSessionId);

            const newSessionId = uuidv4();
            localStorage.setItem("session_id", newSessionId);

            navigate("/ThankYou", { state: analysisResult });
        } catch (err) {
            console.error(err);
            setError("Erreur lors de l'envoi ou de l'analyse.");
        } finally {
            setIsSending(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <svg /* icône X */> {/* ... */} </svg>
                </button>

                <h2 className={styles.title}>Your Idea</h2>

                <textarea
                    className={styles.textarea}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    rows={5}
                    placeholder="Describe your idea..."
                />

                {error && <p className={styles.errorMsg}>{error}</p>}

                <button
                    className={`${styles.sendButton} ${isSending ? styles.sending : ""}`}
                    onClick={handleSendIdea}
                    disabled={isSending || !idea.trim()}
                >
                    {isSending ? "Sending..." : "Send"}
                </button>

            </div>
        </div>
    );
};

export default IdeaModal;
