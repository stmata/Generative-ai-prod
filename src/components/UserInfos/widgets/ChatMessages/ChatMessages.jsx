import React, { useState } from "react";
import { FaDownload, FaTrashAlt } from "react-icons/fa";
import styles from "./ChatMessages.module.css";
import Modal from "../../../Modal/Modal";
import { useUsers } from "../../../../context/UsersContext";
import { deleteAnalysisEntry } from "../../../../services/statsService";
import { useStats } from "../../../../context/StatsContext";
import * as XLSX from "xlsx";
import CustomSelectActionItem from "./CustomSelectActionItem";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
function generateSingleConversationExcel(sessionData) {
    if (!sessionData || !sessionData.chat_session?.conversation_history) return null;

    const rows = sessionData.chat_session.conversation_history.map((msg) => {
        let isAI = msg.role?.toLowerCase() === "assistant";
        let text = msg.content || "";
        let source = "";
        const timestamp = formatTimestamp(msg.timestamp || "");

        if (isAI) {
            try {
                const parsed = JSON.parse(text);
                if (parsed && typeof parsed === "object") {
                    text = parsed.answer || text;
                    source = parsed.sources || "";
                }
            } catch (e) { }
        }

        return {
            "Session ID": sessionData.session_id || "N/A",
            "Speaker": isAI ? "AI" : "Human",
            "Text": text,
            "Source": isAI ? source : "",
            "Time": timestamp,
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Conversation");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
function generateSingleAnalysisExcel(sessionData) {
    if (!sessionData) return null;

    const timeStats = sessionData.time_stats || {};
    const matching = sessionData.matching_analysis || {};

    const data = [
        {
            "Session ID": sessionData.session_id || "N/A",
            "Final Idea": sessionData.final_idea || "N/A",
            "Total Messages": timeStats.total_messages ?? 0,
            "Total Duration (Minutes)": timeStats.total_duration_minutes?.toFixed(2) ?? "0.00",
            "AI latency (minutes)": timeStats.avg_ai_latency_seconds?.toFixed(2) ?? "0.00",
            "Returned After 30 Mins": timeStats.user_returned_after_30mins ? "Yes" : "No",
            "Human Influence Score": `${sessionData.originality_score ?? "N/A"}%`,
            "AI Influence Score": `${sessionData.assistant_influence_score ?? "N/A"}%`,
            "Interaction Influence Score": `${sessionData.matching_score ?? "N/A"}%`,
            "Role Analysis": matching.role_analysis || "N/A",
            "Influence": matching.influence || "N/A",
            "Original Elements": matching.original_elements || "N/A",
            "Overall Assessment": matching.overall_assessment || "N/A",
        },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    return new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
}
async function generateSingleAnalysisPDF(sessionData, finalIdea, timeStats, originalityScore, matchingScore, revelance, matchingAnalysis) {
    const container = document.createElement("div");
    container.style.width = "595px";
    container.style.padding = "30px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.fontSize = "11px";
    container.style.lineHeight = "1.6";
    container.style.backgroundColor = "white";
    container.style.color = "#000";

    const makeSection = (label, value, isHeader = false) => {
        const sectionTitle = document.createElement("div");
        sectionTitle.style.fontWeight = "bold";
        sectionTitle.style.color = "#b10030";
        sectionTitle.style.marginTop = "10px";
        sectionTitle.innerText = `${label}:`;
        container.appendChild(sectionTitle);

        const lines = value.split("\n");
        lines.forEach(line => {
            const lineContainer = document.createElement("div");
    
            const separatorIndex = line.indexOf(":");
            if (separatorIndex !== -1) {
                const keySpan = document.createElement("span");
                keySpan.innerText = line.slice(0, separatorIndex + 1); 
                keySpan.style.fontStyle = "italic";
                keySpan.style.color = "#b10030";
    
                const valueSpan = document.createElement("span");
                valueSpan.innerText = " " + line.slice(separatorIndex + 1);
                valueSpan.style.color = "#000";
    
                lineContainer.appendChild(keySpan);
                lineContainer.appendChild(valueSpan);
            } else {
                lineContainer.innerText = line;
            }
    
            container.appendChild(lineContainer);
        });
    };

    const header = document.createElement("h2");
    header.innerText = "ANALYSIS:";
    header.style.textAlign = "center";
    header.style.color = "#b10030";
    header.style.marginBottom = "20px";
    container.appendChild(header);

    makeSection("Final Idea", finalIdea);

    makeSection("Time",
        `Total messages: ${timeStats.total_messages ?? 0}\n` +
        `Total duration (minutes): ${timeStats.total_duration_minutes?.toFixed(2) ?? "0.00"}\n` +
        `AI latency (minutes): ${timeStats.avg_ai_latency_seconds?.toFixed(2) ?? "0.00"}\n` +
        `User returned after 30 mins: ${timeStats.user_returned_after_30mins ? "Yes" : "No"}`);

    makeSection("Scores",
        `Human Influence Score: ${originalityScore}%\n` +
        `AI Influence Score: ${matchingScore}%\n` +
        `Interaction Influence Score: ${revelance}%`);

    const analysisHeader = document.createElement("h4");
    analysisHeader.innerText = "Detailed analysis:";
    analysisHeader.style.color = "#b10030";
    analysisHeader.style.fontWeight = "bold";
    analysisHeader.style.margin = "20px 0 5px";
    container.appendChild(analysisHeader);
    const analysisFields = {
        "Role Analysis": matchingAnalysis.role_analysis,
        "Influence": matchingAnalysis.influence,
        "Original Elements": matchingAnalysis.original_elements,
        "Overall Assessment": matchingAnalysis.overall_assessment,
    };

    for (const [key, val] of Object.entries(analysisFields)) {
        if (val) {
            const title = document.createElement("div");
            title.innerText = `${key}:`;
            title.style.fontStyle = "italic";
            title.style.color = "#b10030";
            title.style.fontWeight = "normal";
            container.appendChild(title);

            const content = document.createElement("div");
            content.innerText = val;
            content.style.whiteSpace = "pre-wrap";
            container.appendChild(content);
        }
    }

    container.style.position = "absolute";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    const fullCanvas = await html2canvas(container, { scale: 2 });
    const pdf = new jsPDF("p", "pt", "a4");

    const pageHeightPt = pdf.internal.pageSize.getHeight();
    const pageWidthPt = pdf.internal.pageSize.getWidth();

    const imgWidth = pageWidthPt;
    const imgHeight = (fullCanvas.height * imgWidth) / fullCanvas.width;
    const pageHeightPx = (pageHeightPt * fullCanvas.height) / imgHeight;

    let renderedHeight = 0;
    let pageCount = 0;

    while (renderedHeight < fullCanvas.height) {
        const pageCanvas = document.createElement("canvas");
        const ctx = pageCanvas.getContext("2d");

        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = Math.min(pageHeightPx, fullCanvas.height - renderedHeight);

        ctx.drawImage(
            fullCanvas,
            0,
            renderedHeight,
            fullCanvas.width,
            pageCanvas.height,
            0,
            0,
            fullCanvas.width,
            pageCanvas.height
        );

        const pageImgData = pageCanvas.toDataURL("image/png");
        if (pageCount > 0) pdf.addPage();
        pdf.addImage(pageImgData, "PNG", 0, 0, pageWidthPt, (pageCanvas.height * pageWidthPt) / fullCanvas.width);

        renderedHeight += pageCanvas.height;
        pageCount++;
    }

    pdf.save(`analysis-${sessionData.session_id}.pdf`);
    document.body.removeChild(container);
}
async function generateSingleConversationPDF(sessionData, conversationHistory) {
    const container = document.createElement("div");
    container.style.width = "595px";
    container.style.padding = "30px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.lineHeight = "1.6";
    container.style.fontSize = "11px";
    container.style.backgroundColor = "white";
    container.style.color = "#000";

    const title = document.createElement("h2");
    title.innerText = `ID: ${sessionData.session_id}`;
    title.style.color = "#b10030";
    title.style.fontSize = "16px";
    title.style.marginBottom = "20px";
    container.appendChild(title);

    conversationHistory.forEach((msg) => {
        const block = document.createElement("div");
        const role = msg.role || "unknown";
        const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "N/A";
        const size = msg.size || "N/A";
        let content = msg.content || "";
        let source = "";

        if (role.toLowerCase() === "assistant") {
            try {
                const parsed = JSON.parse(content);
                content = parsed?.answer || content;
                source = parsed?.sources || "";
            } catch (e) { }
        }

        const nameLine = document.createElement("strong");
        nameLine.innerText = `${role.charAt(0).toUpperCase() + role.slice(1)}:`;
        nameLine.style.color = "#b10030";
        block.appendChild(nameLine);

        const contentDiv = document.createElement("div");
        contentDiv.style.margin = "4px 0";
        contentDiv.style.whiteSpace = "pre-wrap";
        contentDiv.innerText = content;
        block.appendChild(contentDiv);

        if (source) {
            const sourceDiv = document.createElement("div");
            sourceDiv.style.fontStyle = "italic";
            sourceDiv.style.color = "#444";
            sourceDiv.style.marginBottom = "4px";
            sourceDiv.innerText = `Sources:\n${source}`;
            block.appendChild(sourceDiv);
        }

        const info = document.createElement("div");
        info.style.fontStyle = "italic";
        info.style.color = "#b10030";
        info.style.fontSize = "10px";
        info.innerText = `(time: ${timestamp}, size: ${size})`;
        block.appendChild(info);

        container.appendChild(block);
    });

    container.style.position = "absolute";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    const fullCanvas = await html2canvas(container, { scale: 2 });
    const pdf = new jsPDF("p", "pt", "a4");

    const pageHeightPt = pdf.internal.pageSize.getHeight();
    const pageWidthPt = pdf.internal.pageSize.getWidth();

    const imgWidth = pageWidthPt;
    const imgHeight = (fullCanvas.height * imgWidth) / fullCanvas.width;
    const pageHeightPx = (pageHeightPt * fullCanvas.height) / imgHeight;

    let renderedHeight = 0;
    let pageCount = 0;

    while (renderedHeight < fullCanvas.height) {
        const pageCanvas = document.createElement("canvas");
        const ctx = pageCanvas.getContext("2d");

        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = Math.min(pageHeightPx, fullCanvas.height - renderedHeight);

        ctx.drawImage(
            fullCanvas,
            0,
            renderedHeight,
            fullCanvas.width,
            pageCanvas.height,
            0,
            0,
            fullCanvas.width,
            pageCanvas.height
        );

        const pageImgData = pageCanvas.toDataURL("image/png");
        if (pageCount > 0) pdf.addPage();
        pdf.addImage(pageImgData, "PNG", 0, 0, pageWidthPt, (pageCanvas.height * pageWidthPt) / fullCanvas.width);

        renderedHeight += pageCanvas.height;
        pageCount++;
    }

    pdf.save(`session-${sessionData.session_id}.pdf`);
    document.body.removeChild(container);
}

const ChatMessages = ({ sessionData, onBack }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState("Warning");
    const [modalMessage, setModalMessage] = useState("");
    const { refreshUsers } = useUsers();
    const { refreshStats } = useStats();
    const [conversationFormat, setConversationFormat] = useState("PDF");

    const conversationHistory = sessionData?.chat_session?.conversation_history || [];

    const finalIdea = sessionData?.final_idea || "";
    const timeStats = sessionData?.time_stats || {};
    const originalityScore = sessionData?.originality_score || 0;
    const matchingScore = sessionData?.assistant_influence_score || 0;
    const revelance = sessionData?.matching_score || 0;
    const matchingAnalysis = sessionData?.matching_analysis || {};

    const handleDownloadConversation = () => {
        if (!sessionData?.session_id) return;
        if (conversationFormat.toLowerCase() === "excel") {
            const blob = generateSingleConversationExcel(sessionData);
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `conversation-${sessionData.session_id}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        } else {
            generateSingleConversationPDF(sessionData, conversationHistory);
        }

    };

    const handleDownloadAnalysis = (format = "pdf") => {
        if (!sessionData?.session_id) return;

        if (format.toLowerCase() === "excel") {
            const blob = generateSingleAnalysisExcel(sessionData);
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `analysis-${sessionData.session_id}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }
        generateSingleAnalysisPDF(
            sessionData,
            finalIdea,
            timeStats,
            originalityScore,
            matchingScore,
            revelance,
            matchingAnalysis
        );
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
            <div className={styles.actionItem}>
                <CustomSelectActionItem
                    value={
                        <span className={styles.spanButton}>
                            <FaDownload />
                            Chats
                        </span>
                    }
                    options={["PDF", "Excel"]}
                    onChange={(format) => {
                        setConversationFormat(format);
                        setTimeout(() => {
                            handleDownloadConversation();
                        }, 100);
                    }}
                />
            </div>
            <div className={styles.actionItem}>
                <CustomSelectActionItem
                    value={
                        <span className={styles.spanButton}>
                            <FaDownload />
                            Analysis
                        </span>
                    }
                    options={["PDF", "Excel"]}
                    onChange={(format) => {
                        setTimeout(() => {
                            handleDownloadAnalysis(format);
                        }, 100);
                    }}
                />
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
