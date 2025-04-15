import React, { useState } from "react";
import { FaDownload, FaTrashAlt } from "react-icons/fa";
import { jsPDF } from "jspdf";
import styles from "./ChatMessages.module.css";
import Modal from "../../../Modal/Modal";
import { useUsers } from "../../../../context/UsersContext";
import { deleteAnalysisEntry } from "../../../../services/statsService";
import { useStats } from "../../../../context/StatsContext";

function formatTimestamp(timestamp) {
    const dateObj = new Date(timestamp);
    if (isNaN(dateObj.getTime())) {
        return timestamp;
    }
    return dateObj.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

const ChatMessages = ({ sessionData, onBack }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState("Warning");
    const [modalMessage, setModalMessage] = useState("");
    const { refreshUsers } = useUsers();
    const { refreshStats } = useStats();

    const conversationHistory = sessionData?.chat_session?.conversation_history || [];

    const finalIdea = sessionData?.final_idea || "";
    const timeStats = sessionData?.time_stats || {};
    const originalityScore = sessionData?.originality_score || 0;
    const matchingScore = sessionData?.matching_score || 0;
    const matchingAnalysis = sessionData?.matching_analysis || {};

    const handleDownloadConversation = () => {
        if (!sessionData?.session_id) return;

        const doc = new jsPDF({
            unit: "pt",
            format: "A4",
        });

        let x = 40;
        let y = 60;
        const lineHeight = 14;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const bottomMargin = 60;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(191, 0, 48);
        doc.text(`ID: ${sessionData.session_id}`, pageWidth / 2, y, { align: "center" });
        y += 40;

        const checkPageOverflow = (increment) => {
            if (y + increment > pageHeight - bottomMargin) {
                doc.addPage();
                y = 60;
            }
        };

        conversationHistory.forEach((msg) => {
            let role = msg.role || "unknown";
            let content = msg.content || "";
            const timestamp = msg.timestamp || "";
            const size = msg.size || "";

            role = role.charAt(0).toUpperCase() + role.slice(1);

            let finalText = content;
            let sourceText = "";
            if (role.toLowerCase() === "assistant") {
                try {
                    const parsed = JSON.parse(content);
                    if (parsed && typeof parsed === "object") {
                        if (parsed.answer) {
                            finalText = parsed.answer;
                        }
                        if (parsed.sources && parsed.sources.trim() !== "") {
                            sourceText = parsed.sources.trim();
                        }
                    }
                } catch (e) {
                    // Pas un JSON valide
                }
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(191, 0, 48);

            checkPageOverflow(lineHeight);
            doc.text(`${role}:`, x, y);
            y += lineHeight;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);

            const wrappedContent = doc.splitTextToSize(finalText, 500);
            wrappedContent.forEach((line) => {
                checkPageOverflow(lineHeight);
                doc.text(line, x, y);
                y += lineHeight;
            });

            if (sourceText) {
                doc.setFont("helvetica", "italic");
                doc.setFontSize(10);

                let lines = sourceText.split("\n").map(line => line.trim());
                lines = lines.map((line, idx) => {
                    if (!line) return "";
                    line = line.replace(/,+$/, "");
                    if (idx < lines.length - 1) {
                        return line + ",";
                    }
                    return line;
                });

                const finalSourcesText = `(${lines.join("\n")})`;
                const splittedSources = doc.splitTextToSize(finalSourcesText, 500);

                splittedSources.forEach((srcLine) => {
                    checkPageOverflow(lineHeight);
                    doc.text(srcLine, x, y);
                    y += lineHeight;
                });
            }

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(191, 0, 48);
            const formattedTime = formatTimestamp(timestamp);
            checkPageOverflow(lineHeight);
            doc.text(`(time: ${formattedTime}, size: ${size})`, x, y);
            y += (lineHeight + 6);
        });

        doc.save(`session-${sessionData.session_id}.pdf`);
    };

    const handleDownloadAnalysis = () => {
        if (!sessionData?.session_id) return;

        const doc = new jsPDF({
            unit: "pt",
            format: "A4",
        });

        let x = 40;
        let y = 60;
        const lineHeight = 14;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const bottomMargin = 60;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(191, 0, 48);
        doc.text("ANALYSIS", pageWidth / 2, y, { align: "center" });
        y += 30;

        const checkPageOverflow = (increment) => {
            if (y + increment > pageHeight - bottomMargin) {
                doc.addPage();
                y = 60;
            }
        };

        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        doc.setTextColor(191, 0, 48);
        doc.text("Final Idea:", x, y);

        y += lineHeight;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        let splitted = doc.splitTextToSize(finalIdea, 500);
        splitted.forEach((line) => {
            checkPageOverflow(lineHeight);
            doc.text(line, x, y);
            y += lineHeight;
        });
        y += 10;

        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        doc.setTextColor(191, 0, 48);
        doc.text("Time Stats:", x, y);
        y += (lineHeight + 6);

        doc.setFont("helvetica", "italic");
        doc.setTextColor(191, 0, 48);
        doc.text("Total messages:", x, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const totalMsgStr = ` ${timeStats.total_messages ?? 0}`;
        doc.text(totalMsgStr, x + 80, y);
        y += lineHeight;

        const duration = timeStats.total_duration_minutes
            ? timeStats.total_duration_minutes.toFixed(2)
            : "0.00";

        doc.setFont("helvetica", "italic");
        doc.setTextColor(191, 0, 48);
        doc.text("Total duration (minutes):", x, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(` ${duration}`, x + 120, y);
        y += lineHeight;

        const returned = timeStats.user_returned_after_30mins ? "Yes" : "No";

        doc.setFont("helvetica", "italic");
        doc.setTextColor(191, 0, 48);
        doc.text("User returned after 30 mins:", x, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(` ${returned}`, x + 140, y);
        y += lineHeight;

        doc.setFont("helvetica", "italic");
        doc.setTextColor(191, 0, 48);
        doc.text("Number of times returning after 30 mins:", x, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(` ${timeStats.num_gaps_over_30mins ?? 0}`, x + 200, y);
        y += (lineHeight + 10);

        doc.setFont("helvetica", "italic");
        doc.setTextColor(191, 0, 48);
        doc.text("Scores:", x, y);
        y += (lineHeight + 6);

        doc.setFont("helvetica", "italic");
        doc.setTextColor(191, 0, 48);
        doc.text("Human Creativity:", x, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(` ${originalityScore}%`, x + 90, y);
        y += lineHeight;

        doc.setFont("helvetica", "italic");
        doc.setTextColor(191, 0, 48);
        doc.text("AI Score:", x, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(` ${matchingScore}%`, x + 50, y);
        y += (lineHeight + 10);

        doc.setFont("helvetica", "italic");
        doc.setTextColor(191, 0, 48);
        doc.text("Matching Analysis:", x, y);
        y += (lineHeight + 6);

        const { influence, original_elements, overall_assessment } = matchingAnalysis;

        if (influence) {
            doc.setFont("helvetica", "italic");
            doc.setTextColor(191, 0, 48);
            doc.text("Influence:", x, y);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            y += lineHeight;
            const lines = doc.splitTextToSize(influence, 500);
            lines.forEach((ln) => {
                checkPageOverflow(lineHeight);
                doc.text(ln, x, y);
                y += lineHeight;
            });
            y += 6;
        }

        if (original_elements) {
            doc.setFont("helvetica", "italic");
            doc.setTextColor(191, 0, 48);
            doc.text("Original Elements:", x, y);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            y += lineHeight;
            const lines = doc.splitTextToSize(original_elements, 500);
            lines.forEach((ln) => {
                checkPageOverflow(lineHeight);
                doc.text(ln, x, y);
                y += lineHeight;
            });
            y += 6;
        }

        if (overall_assessment) {
            doc.setFont("helvetica", "italic");
            doc.setTextColor(191, 0, 48);
            doc.text("Overall Assessment:", x, y);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            y += lineHeight;
            const lines = doc.splitTextToSize(overall_assessment, 500);
            lines.forEach((ln) => {
                checkPageOverflow(lineHeight);
                doc.text(ln, x, y);
                y += lineHeight;
            });
            y += 6;
        }

        doc.save(`analysis-${sessionData.session_id}.pdf`);
    };

    const handleDeleteClick = () => {
        setModalMessage("Are you sure you want to delete this user?");
        setModalType("Warning");
        setModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setModalOpen(false);
        try {
            const response = await deleteAnalysisEntry(sessionData.session_id);
            if (response.deleted) {
                setModalMessage("The user is deleted successfully!");
                setModalType("success");
                setModalOpen(true);
                refreshStats();
                refreshUsers();
                setTimeout(() => {
                    setModalOpen(false);
                    onBack();
                }, 2000);
            } else {
                console.error("Failed to delete user.");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className={styles.actionList}>
            <div className={styles.actionItem} onClick={handleDownloadConversation}>
                <FaDownload className={styles.icon} />
                <span>Download Conversation</span>
            </div>

            <div className={styles.actionItem} onClick={handleDownloadAnalysis}>
                <FaDownload className={styles.icon} />
                <span>Download Analysis</span>
            </div>

            <div className={`${styles.actionItem} ${styles.deleteAction}`} onClick={handleDeleteClick}>
                <FaTrashAlt className={styles.icon} />
                <span>Delete User</span>
            </div>

            {modalOpen && (
                <Modal
                    type={modalType}
                    message={modalMessage}
                    onClose={() => setModalOpen(false)}
                    onConfirm={modalType === "Warning" ? handleConfirmDelete : undefined}
                />
            )}
        </div>
    );
};

export default ChatMessages;
