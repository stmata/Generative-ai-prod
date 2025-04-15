import React, { useState } from "react";
import styles from "./ModalDownload.module.css";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa6";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { downloadChatsService, downloadAnalysisService } from "../../services/downloadService";
import Modal from "../Modal/Modal";
import * as XLSX from "xlsx";

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

function generateAnalysisExcel(sessionsData) {
    if (!sessionsData || sessionsData.length === 0) return null;

    const data = sessionsData.map((session) => ({
        "Session ID": session.session_id || "N/A",
        "Final Idea": session.final_idea || "N/A",
        "Total Messages": session.time_stats?.total_messages ?? 0,
        "Total Duration (Minutes)": session.time_stats?.total_duration_minutes?.toFixed(2) ?? "0.00",
        "Returned After 30 Mins": session.time_stats?.user_returned_after_30mins ? "Yes" : "No",
        "Num Gaps Over 30 Mins": session.time_stats?.num_gaps_over_30mins ?? 0,
        "Originality Score": `${session.originality_score ?? "N/A"}%`,
        "AI Matching Score": `${session.matching_score ?? "N/A"}%`,
        "Influence": session.matching_analysis?.influence || "N/A",
        "Original Elements": session.matching_analysis?.original_elements || "N/A",
        "Overall Assessment": session.matching_analysis?.overall_assessment || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

function generateConversationPDF(sessionData) {
    if (!sessionData?.session_id || !sessionData.conversation_history) return null;

    const doc = new jsPDF({ unit: "pt", format: "A4" });
    let x = 40, y = 60, lineHeight = 14;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const bottomMargin = 60;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(191, 0, 48);
    doc.text(`Session ID: ${sessionData.session_id}`, pageWidth / 2, y, { align: "center" });
    y += 40;

    const checkPageOverflow = (increment) => {
        if (y + increment > pageHeight - bottomMargin) {
            doc.addPage();
            y = 60;
        }
    };

    sessionData.conversation_history.forEach((msg) => {
        let role = msg.role ? msg.role.charAt(0).toUpperCase() + msg.role.slice(1) : "Unknown";
        let content = msg.content || "";
        let timestamp = formatTimestamp(msg.timestamp || "");
        let size = msg.size ? `${msg.size}` : "N/A";

        let finalText = content;
        let sourceText = "";

        if (role.toLowerCase() === "assistant") {
            try {
                const parsed = JSON.parse(content);
                if (parsed && typeof parsed === "object" && parsed.answer) {
                    finalText = parsed.answer.replace(/\n/g, "\n");
                    sourceText = parsed.sources ? parsed.sources.replace(/\n/g, ", ") : "";
                }
            } catch (e) {
                // Si ce n'est pas un JSON valide, on garde le texte brut
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
            doc.setTextColor(0, 0, 0);

            const formattedSources = `(Sources: ${sourceText})`;
            const wrappedSources = doc.splitTextToSize(formattedSources, 500);
            wrappedSources.forEach((line) => {
                checkPageOverflow(lineHeight);
                doc.text(line, x, y);
                y += lineHeight;
            });
        }

        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(191, 0, 48);
        checkPageOverflow(lineHeight);
        doc.text(`(Time: ${timestamp}, Size: ${size})`, x, y);
        y += (lineHeight + 6);
    });

    return doc.output("blob");
}

function generateAnalysisPDF(sessionData) {
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
    doc.setTextColor(0, 0, 0);

    let finalIdeaText = sessionData.final_idea || "No data available.";
    let splitted = doc.splitTextToSize(finalIdeaText, 500);
    splitted.forEach((line) => {
        checkPageOverflow(lineHeight);
        doc.text(line, x, y);
        y += lineHeight;
    });
    y += 10;

    doc.text("Total messages:", x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${sessionData.time_stats?.total_messages ?? 0}`, x + 85, y);
    y += lineHeight;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(191, 0, 48);
    doc.text("Total duration (minutes):", x, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${(sessionData.time_stats?.total_duration_minutes ?? 0).toFixed(2)}`, x + 125, y);
    y += lineHeight;

    const returned = sessionData.time_stats?.user_returned_after_30mins ? "Yes" : "No";

    doc.setFont("helvetica", "italic");
    doc.setTextColor(191, 0, 48);
    doc.text("User returned after 30 mins:", x, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(returned, x + 140, y);
    y += lineHeight;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(191, 0, 48);
    doc.text("Number of times returning after 30 mins:", x, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${sessionData.time_stats?.num_gaps_over_30mins ?? 0}`, x + 200, y);
    y += lineHeight + 10;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(191, 0, 48);
    doc.text("Scores:", x, y);
    y += lineHeight + 6;

    doc.text("Human Creativity:", x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${sessionData.originality_score ?? "N/A"}%`, x + 90, y);
    y += lineHeight;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(191, 0, 48);
    doc.text("AI Score:", x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${sessionData.matching_score ?? "N/A"}%`, x + 50, y);
    y += lineHeight + 10;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(191, 0, 48);
    doc.text("Matching Analysis:", x, y);
    y += lineHeight + 6;

    const { influence, original_elements, overall_assessment } = sessionData.matching_analysis ?? {};

    if (influence) {
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

    return doc.output("blob");
}

const ModalDownload = ({ selectedIds, onClose }) => {
    const [downloadChats, setDownloadChats] = useState(false);
    const [downloadAnalysis, setDownloadAnalysis] = useState(true);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [analysisFormat, setAnalysisFormat] = useState("pdf");

    const handleConfirm = async () => {
        if (!selectedIds || selectedIds.length === 0) return;

        const zip = new JSZip();
        let hasZipContent = false;
        let includeChats = false;
        let includeAnalysis = false;
        let allAnalysisData = [];

        try {
            for (const id of selectedIds) {
                const chatsData = downloadChats ? await downloadChatsService({ ids: [id] }) : null;
                const analysisData = downloadAnalysis ? await downloadAnalysisService({ ids: [id] }) : null;

                if (downloadChats && chatsData && chatsData.length > 0) {
                    const session = chatsData[0];
                    const pdfBlob = generateConversationPDF(session);
                    if (pdfBlob) {
                        zip.folder("chats").file(`chat-${id}.pdf`, pdfBlob, { binary: true });
                        hasZipContent = true;
                        includeChats = true;
                    }
                }

                if (downloadAnalysis && analysisData && analysisData.length > 0) {
                    allAnalysisData.push(...analysisData);
                    includeAnalysis = true;
                }
            }

            if (includeAnalysis && allAnalysisData.length > 0) {
                let fileBlob = null;
                let fileExtension = "pdf";
                if (analysisFormat === "pdf") {
                    fileBlob = generateAnalysisPDF(allAnalysisData);
                } else if (analysisFormat === "excel") {
                    fileBlob = generateAnalysisExcel(allAnalysisData);
                    fileExtension = "xlsx";
                }
                if (fileBlob) {
                    zip.folder("analysis").file(`analysis.${fileExtension}`, fileBlob, { binary: true });
                    hasZipContent = true;
                }
            }

            if (!hasZipContent) {
                throw new Error("No valid data to download.");
            }

            let zipFileName = "download.zip";
            if (includeChats && includeAnalysis) {
                zipFileName = "chats_analysis.zip";
            } else if (includeChats) {
                zipFileName = "chats.zip";
            } else if (includeAnalysis) {
                zipFileName = "analysis.zip";
            }

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = zipFileName;
            document.body.appendChild(a);
            a.click();
            a.remove();

            onClose();
        } catch (error) {
            console.error("Download error:", error);
            setWarningMessage("An error occurred while downloading. Please try again.");
            setShowWarning(true);
        }
    };

    const isConfirmDisabled = !downloadChats && !downloadAnalysis;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Download Sessions</h2>
                <div className={styles.checkboxContainer}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={downloadAnalysis}
                            onChange={(e) => setDownloadAnalysis(e.target.checked)}
                        />
                        Download Analysis
                    </label>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={downloadChats}
                            onChange={(e) => setDownloadChats(e.target.checked)}
                        />
                        Download Chats
                    </label>
                </div>

                {downloadAnalysis && (
                    <div className={styles.formatContainer}>
                        <span className={styles.formatLabel}>Format (for Analysis):</span>
                        <div className={styles.formatOptions}>
                            <div
                                className={`${styles.formatOption} ${analysisFormat === "pdf" ? styles.selectedFormat : ""}`}
                                onClick={() => setAnalysisFormat("pdf")}
                            >
                                <FaRegFilePdf size={24} />
                            </div>
                            <div
                                className={`${styles.formatOption} ${analysisFormat === "excel" ? styles.selectedFormat : ""}`}
                                onClick={() => setAnalysisFormat("excel")}
                            >
                                <FaRegFileExcel size={24} />
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.buttonContainer}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                    >
                        Confirm
                    </button>
                </div>
                {showWarning && (
                    <Modal
                        type="Warning"
                        message={warningMessage}
                        onClose={() => setShowWarning(false)}
                        onConfirm={() => setShowWarning(false)}
                    />
                )}

            </div>
        </div>
    );
};

export default ModalDownload;
