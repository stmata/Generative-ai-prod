import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FinalIdeaForm.module.css";
import { addFinalIdea } from "../../services/addFinalIdea";
import { analyzeSession } from "../../services/analysis";
import { v4 as uuidv4 } from "uuid";
import { FiSend } from "react-icons/fi";

const FinalIdeaForm = ({ onClose }) => {
    const [idea, setIdea] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        const sessionId = localStorage.getItem("session_id");
        if (sessionId) {
            const savedIdea = localStorage.getItem(`idea_${sessionId}`);
            if (savedIdea) {
                setIdea(savedIdea);
            }
        }
    }, []);

    useEffect(() => {
        const sessionId = localStorage.getItem("session_id");
        if (sessionId) {
            localStorage.setItem(`idea_${sessionId}`, idea);
        }
    }, [idea]);
    const handleSendIdea = async () => {
        if (!idea.trim()) return;
        setIsSending(true);
        setError("");

        try {
            const oldSessionId = localStorage.getItem("session_id");
            if (!oldSessionId) throw new Error("No session ID");

            await addFinalIdea(idea, oldSessionId);
            const analysisResult = await analyzeSession(oldSessionId);

            localStorage.removeItem(`idea_${oldSessionId}`);

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
    return (
        <div className={styles.container}>
            <button className={styles.closeBtn} onClick={onClose}>
                &times;
            </button>

            <h2 className={styles.title}>Submit your final idea :</h2>

            <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your idea..."
                className={styles.textarea}
                rows={6}
            />

            {error && <p className={styles.error}>{error}</p>}

            <button
                onClick={handleSendIdea}
                disabled={isSending || !idea.trim()}
                className={styles.submitButton}
            >
                {isSending ? "Sending..." : "Let’s go!"}
                {!isSending && <FiSend className={styles.icon} />}
            </button>
        </div>
    );
};

export default FinalIdeaForm;
