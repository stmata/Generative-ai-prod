import React, { useEffect, useState } from "react";
import { fetchAnalysisData, deleteAnalysisEntry } from "../../services/statsService";
import styles from "./AnalysisTable.module.css";
import { FaEye, FaTrash, FaSearch, FaDownload } from "react-icons/fa";
import Modal from "../Modal/Modal";
import { useStats } from "../../context/StatsContext";
import Pagination from '@mui/material/Pagination';
import { useDiagrams } from "../../context/DiagramContext";
import CustomSelect from "./CustomSelect";
import JSZip from "jszip";
import { downloadChatsService, downloadAnalysisService } from "../../services/downloadService";
import * as XLSX from "xlsx";
import { useUsers } from "../../context/UsersContext";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const handleDirectDownload = async (type, selectedIds, format = "pdf") => {
    if (!selectedIds || selectedIds.length === 0) return;

    const zip = new JSZip();
    let hasContent = false;

    if (type === "chats") {
        const allChatsData = [];

        for (const id of selectedIds) {
            const chatsData = await downloadChatsService({ ids: [id] });
            if (chatsData?.length) allChatsData.push(...chatsData);
        }

        if (format === "pdf") {
            for (const chat of allChatsData) {
                const pdfBlob = await generateConversationPDF(chat);
                if (pdfBlob) {
                    zip.folder("chats").file(`chat-${chat.session_id}.pdf`, pdfBlob, { binary: true });
                    hasContent = true;
                } else {
                    console.warn("PDF blob was empty for session:", chat.session_id);
                }
            }
        } else if (format === "excel") {
            const excel = generateConversationExcel(allChatsData);
            if (excel) {
                zip.folder("chats").file(`chats.xlsx`, excel, { binary: true });
                hasContent = true;
            }
        }
    }


    if (type === "analysis") {
        const allAnalysisData = [];
        for (const id of selectedIds) {
            const analysisData = await downloadAnalysisService({ ids: [id] });
            if (analysisData?.length) allAnalysisData.push(...analysisData);
        }

        if (allAnalysisData.length > 0) {
            if (format === "pdf") {
                for (const session of allAnalysisData) {
                    const pdfBlob = await generateAnalysisPDF(session);
                    if (pdfBlob) {
                        zip.folder("analysis").file(`analysis-${session.session_id}.pdf`, pdfBlob, { binary: true });
                        hasContent = true;
                    }
                }
            } else if (format === "excel") {
                const excel = generateAnalysisExcel(allAnalysisData);
                if (excel) {
                    zip.folder("analysis").file(`analysis.xlsx`, excel, { binary: true });
                    hasContent = true;
                }
            }
        }
    }

    if (hasContent) {
        if (format === "excel") {
            const blob =
                type === "chats"
                    ? generateConversationExcel(await downloadChatsService({ ids: selectedIds }))
                    : generateAnalysisExcel(await downloadAnalysisService({ ids: selectedIds }));

            if (blob) {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${type}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            return;
        }

        if (format === "pdf" && selectedIds.length === 1) {
            const data =
                type === "chats"
                    ? await downloadChatsService({ ids: selectedIds })
                    : await downloadAnalysisService({ ids: selectedIds });

            const pdfBlob =
                type === "chats"
                    ? await generateConversationPDF(data[0])
                    : await generateAnalysisPDF(data[0]);

            if (pdfBlob) {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(pdfBlob);
                link.download = `${type}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            return;
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${type}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("No valid data found to download.");
    }


}
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
        "Total Duration (minutes)": session.time_stats?.total_duration_minutes?.toFixed(2) ?? "0.00",
        "AI latency (minutes)": session.time_stats?.avg_ai_latency_seconds?.toFixed(2) ?? "0.00",
        "Returned After 30 Mins": session.time_stats?.user_returned_after_30mins ? "Yes" : "No",
        "Human Influence Score": `${session.originality_score ?? "N/A"}%`,
        "AI Influence Score": `${session.assistant_influence_score ?? "N/A"}%`,
        "Interaction Influence Score": `${session.matching_score ?? "N/A"}%`,
        "Role Analaysis": session.matching_analysis?.role_analysis || "N/A",
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
async function generateConversationPDF(sessionData) {
    if (!sessionData?.session_id || !sessionData.conversation_history) return;

    const container = document.createElement("div");
    container.style.width = "595px";
    container.style.padding = "30px 30px 80px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.fontSize = "11px";
    container.style.lineHeight = "1.6";
    container.style.backgroundColor = "white";
    container.style.color = "#000";

    const title = document.createElement("h2");
    title.innerText = `Session ID: ${sessionData.session_id}`;
    title.style.textAlign = "center";
    title.style.color = "#b10030";
    title.style.marginBottom = "20px";
    container.appendChild(title);

    sessionData.conversation_history.forEach((msg) => {
        const block = document.createElement("div");
        block.style.pageBreakInside = "avoid";
        block.style.breakInside = "avoid";
        block.style.marginBottom = "12px";

        const role = msg.role ? msg.role.charAt(0).toUpperCase() + msg.role.slice(1) : "Unknown";
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

        if (!content || content.trim() === "") content = "[Empty]";

        const roleLine = document.createElement("div");
        roleLine.innerText = `${role}:`;
        roleLine.style.fontWeight = "bold";
        roleLine.style.color = "#b10030";
        roleLine.style.marginBottom = "2px";
        block.appendChild(roleLine);

        const contentDiv = document.createElement("div");
        contentDiv.innerText = content;
        contentDiv.style.whiteSpace = "pre-wrap";
        block.appendChild(contentDiv);

        if (source) {
            const sourceDiv = document.createElement("div");
            sourceDiv.innerText = `Sources: ${source}`;
            sourceDiv.style.fontStyle = "italic";
            sourceDiv.style.color = "#444";
            sourceDiv.style.marginTop = "4px";
            block.appendChild(sourceDiv);
        }

        const infoLine = document.createElement("div");
        infoLine.innerText = `(Time: ${timestamp}, Size: ${size})`;
        infoLine.style.fontStyle = "italic";
        infoLine.style.color = "#b10030";
        infoLine.style.fontSize = "10px";
        infoLine.style.marginTop = "6px";
        block.appendChild(infoLine);

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

    const topBottomMarginPt = 40;
    const usableHeightPt = pageHeightPt - topBottomMarginPt * 2;
    const usableHeightPx = (usableHeightPt * fullCanvas.height) / imgHeight - 20;

    let renderedHeight = 0;
    let pageCount = 0;

    while (renderedHeight < fullCanvas.height) {
        const pageCanvas = document.createElement("canvas");
        const ctx = pageCanvas.getContext("2d");

        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = Math.min(usableHeightPx, fullCanvas.height - renderedHeight);

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
        pdf.addImage(pageImgData, "PNG", 0, topBottomMarginPt, pageWidthPt, (pageCanvas.height * pageWidthPt) / fullCanvas.width);

        renderedHeight += pageCanvas.height;
        pageCount++;
    }

    document.body.removeChild(container);
    return pdf.output("blob");
}
async function generateAnalysisPDF(sessionData) {
    if (!sessionData?.session_id) return;

    const container = document.createElement("div");
    container.style.width = "595px";
    container.style.padding = "30px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.fontSize = "11px";
    container.style.lineHeight = "1.6";
    container.style.backgroundColor = "white";
    container.style.color = "#000";

    const addTitle = (text) => {
        const h2 = document.createElement("h2");
        h2.innerText = text;
        h2.style.textAlign = "center";
        h2.style.color = "#b10030";
        h2.style.marginBottom = "20px";
        container.appendChild(h2);
    };

    const addLine = (label, value) => {
        const div = document.createElement("div");
        const labelSpan = document.createElement("span");
        labelSpan.innerText = label;
        labelSpan.style.fontStyle = "italic";
        labelSpan.style.color = "#b10030";

        const valueSpan = document.createElement("span");
        valueSpan.innerText = " " + value;
        valueSpan.style.color = "#000";

        div.appendChild(labelSpan);
        div.appendChild(valueSpan);
        container.appendChild(div);
    };

    const addBlock = (label, content) => {
        const labelDiv = document.createElement("div");
        labelDiv.innerText = label;
        labelDiv.style.fontStyle = "italic";
        labelDiv.style.color = "#b10030";
        labelDiv.style.marginTop = "10px";
        container.appendChild(labelDiv);

        const contentDiv = document.createElement("div");
        contentDiv.innerText = content;
        contentDiv.style.whiteSpace = "pre-wrap";
        contentDiv.style.marginBottom = "8px";
        container.appendChild(contentDiv);
    };

    addTitle("ANALYSIS");

    addBlock("Final Idea:", sessionData.final_idea || "No data available.");

    const timeStats = sessionData.time_stats || {};
    addLine("Total messages:", timeStats.total_messages ?? "0");
    addLine("Total duration (minutes):", (timeStats.total_duration_minutes ?? 0).toFixed(2));
    addLine("AI latency (minutes):", (timeStats.avg_ai_latency_seconds ?? 0).toFixed(2));
    addLine("User returned after 30 mins:", timeStats.user_returned_after_30mins ? "Yes" : "No");

    container.appendChild(document.createElement("br"));

    const scoreHeader = document.createElement("div");
    scoreHeader.innerText = "Scores:";
    scoreHeader.style.fontStyle = "italic";
    scoreHeader.style.color = "#b10030";
    scoreHeader.style.marginTop = "10px";
    container.appendChild(scoreHeader);

    addLine("Human Influence Score:", `${sessionData.originality_score ?? "N/A"}%`);
    addLine("AI Influence Score:", `${sessionData.assistant_influence_score ?? "N/A"}%`);
    addLine("Interaction Influence Score:", `${sessionData.matching_score ?? "N/A"}%`);

    const matching = sessionData.matching_analysis || {};
    if (matching.role_analysis) addBlock("Role Analysis:", matching.role_analysis);
    if (matching.influence) addBlock("Influence:", matching.influence);
    if (matching.original_elements) addBlock("Original Elements:", matching.original_elements);
    if (matching.overall_assessment) addBlock("Overall Assessment:", matching.overall_assessment);

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

    document.body.removeChild(container);
    return pdf.output("blob");
}
function generateConversationExcel(sessionDataArray) {
    if (!sessionDataArray || sessionDataArray.length === 0) return null;

    const rows = [];

    for (const session of sessionDataArray) {
        const sessionId = session.session_id || "N/A";
        const history = session.conversation_history || [];

        history.forEach((msg) => {
            const isAI = msg.role?.toLowerCase() === "assistant";
            let text = msg.content || "";
            let source = "";
            let timestamp = formatTimestamp(msg.timestamp || "");

            if (isAI) {
                try {
                    const parsed = JSON.parse(text);
                    if (parsed && typeof parsed === "object") {
                        text = parsed.answer || text;
                        source = parsed.sources || "";
                    }
                } catch (e) {
                    // fallback to raw text
                }
            }

            rows.push({
                "Session ID": sessionId,
                "Speaker": isAI ? "AI" : "Human",
                "Text": text,
                "Source": isAI ? source : "",
                "Time": timestamp,
            });
        });
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chats");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
const AnalysisTable = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [selectedDetailIndex, setSelectedDetailIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const rowsPerPage = 10;
    const { refreshUsers } = useUsers();
    const { refreshStats } = useStats();
    const { refreshDiagrams } = useDiagrams();
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadType, setDownloadType] = useState(null);
    const [showFormatOptions, setShowFormatOptions] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);


    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (searchText.trim() === "") {
            setFilteredData(data);
        } else {
            const searchLower = searchText.toLowerCase();
            const filtered = data.filter(item => {
                return (
                    String(item.session_id).toLowerCase().includes(searchLower) ||
                    (item.time_stats?.total_messages?.toString().includes(searchLower)) ||
                    (item.time_stats?.total_duration_minutes?.toFixed(2).toString().includes(searchLower)) ||
                    (new Date(item.created_at).toLocaleDateString().toLowerCase().includes(searchLower)) ||
                    ((item.time_stats?.user_returned_after_30mins ? "yes" : "no").toLowerCase().includes(searchLower)) ||
                    (item.originality_score?.toString().toLowerCase().includes(searchLower)) ||
                    (item.matching_score?.toString().toLowerCase().includes(searchLower))
                );
            });
            setFilteredData(filtered);
        }
    }, [searchText, data]);

    const loadData = async () => {
        setLoading(true);
        const fetchedData = await fetchAnalysisData();
        setData(fetchedData);
        setFilteredData(fetchedData);
        setLoading(false);
    };

    const confirmDelete = (sessionId) => {
        setSessionToDelete(sessionId);
        setShowModal(true);
    };

    const handleCancel = () => {
        setShowModal(false);
        setSessionToDelete(null);
    };

    const handleDelete = async () => {
        if (sessionToDelete) {
            setShowModal(false);
            const response = await deleteAnalysisEntry(sessionToDelete);
            if (response.deleted) {
                setFilteredData(prev => prev.filter(item => item.session_id !== sessionToDelete));
                setData(prev => prev.filter(item => item.session_id !== sessionToDelete));
                refreshStats();
                refreshUsers();
                refreshDiagrams();
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 2000);
            }
        }
    };

    const toggleDetail = (index, e) => {
        e.stopPropagation();
        setSelectedDetailIndex(selectedDetailIndex === index ? null : index);
    };

    const handleSelectRow = (sessionId) => {
        if (selectedRows.includes(sessionId)) {
            setSelectedRows(selectedRows.filter(id => id !== sessionId));
        } else {
            setSelectedRows([...selectedRows, sessionId]);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentData.map(item => item.session_id);
            setSelectedRows(prev => Array.from(new Set([...prev, ...allIds])));
        } else {
            setSelectedRows(prev => prev.filter(id => !currentData.some(item => item.session_id === id)));
        }
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleConfirmBulkDelete = async () => {
        try {
            setShowBulkDeleteModal(false);

            await Promise.all(
                selectedRows.map((sessionId) => deleteAnalysisEntry(sessionId))
            );

            const updatedData = data.filter(item => !selectedRows.includes(item.session_id));
            setData(updatedData);
            setFilteredData(updatedData);
            setSelectedRows([]);

            refreshStats();
            refreshDiagrams();
            refreshUsers();
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 2000);
        } catch (error) {
            console.error("Error while deleting sessions:", error);
            alert("An error occurred while deleting the selected sessions.");
        }
    };


    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const isAllSelected = currentData.length > 0 && currentData.every(item => selectedRows.includes(item.session_id));

    return (
        <div className={styles.container4}>
            {loading ? (
                <div className={styles.spinnerContainer}>
                    <div className={styles.spinner}></div>
                </div>
            ) : (
                <>
                    <h3 className={styles.diagTitle}>List of sessions with Key Data:</h3>
                    <div className={styles.filterContainer}>
                        <div className={styles.topControls}>
                            <div className={styles.downloadButtons}>
                                <div className={styles.dropdownContainer}>
                                    <CustomSelect
                                        value={
                                            <span className={styles.spanButton}>
                                                <FaDownload />
                                                Analysis
                                            </span>
                                        } options={["PDF", "Excel"]}
                                        onChange={(format) => {
                                            if (selectedRows.length === 0) return;
                                            handleDirectDownload("analysis", selectedRows, format.toLowerCase());
                                        }}
                                        disabled={selectedRows.length === 0}
                                    />
                                </div>
                                <div className={styles.dropdownContainer}>
                                    <CustomSelect
                                        value={
                                            <span className={styles.spanButton}>
                                                <FaDownload />
                                                Chats
                                            </span>
                                        }
                                        options={["PDF", "Excel"]}
                                        onChange={(format) => {
                                            if (selectedRows.length === 0) return;
                                            handleDirectDownload("chats", selectedRows, format.toLowerCase());
                                        }}
                                        disabled={selectedRows.length === 0}
                                    />
                                </div>
                                <button
                                    className={styles.downloadBtn}
                                    onClick={() => setShowBulkDeleteModal(true)}
                                    disabled={selectedRows.length === 0}
                                >
                                    <span className={styles.spanButton}>
                                        <FaTrash /> Users
                                    </span>

                                </button>
                            </div>
                            <div className={styles.inputField}>
                                <FaSearch className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    {filteredData.length > 0 ? (
                        <>
                            <table className={styles.table}>
                                <thead className={styles.entete}>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={handleSelectAll}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </th>
                                        <th>Session ID</th>
                                        <th>Total Messages</th>
                                        <th>Duration (mins)</th>
                                        <th>AI latency</th>
                                        <th>Date</th>
                                        <th>Returned</th>
                                        <th>Human Influence Score</th>
                                        <th>AI Influence Score</th>
                                        <th>Interaction Influence Score</th>
                                        <th colSpan={2}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item, index) => (
                                        <React.Fragment key={item.session_id}>
                                            <tr
                                                className={styles.row}
                                                onClick={() => handleSelectRow(item.session_id)}
                                            >
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(item.session_id)}
                                                        onChange={() => handleSelectRow(item.session_id)}
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                </td>
                                                <td>{item.session_id}</td>
                                                <td>{item.time_stats?.total_messages || 0}</td>
                                                <td>{item.time_stats?.total_duration_minutes?.toFixed(2) || "0.00"}</td>
                                                <td>{item.time_stats?.avg_ai_latency_seconds?.toFixed(2) || "0.00"}</td>
                                                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                                <td>{item.time_stats?.user_returned_after_30mins ? "✅" : "❌"}</td>
                                                <td>{item.originality_score === 0 ? "0" : item.originality_score || "N/A"}</td>
                                                <td>{item.assistant_influence_score === 0 ? "0" : item.assistant_influence_score || "N/A"}</td>
                                                <td>{item.matching_score === 0 ? "0" : item.matching_score || "N/A"}</td>

                                                <td className={styles.actions}>
                                                    <FaEye
                                                        className={styles.icon}
                                                        onClick={(e) => toggleDetail(index, e)}
                                                    />
                                                </td>
                                                <td className={styles.actions}>
                                                    <FaTrash
                                                        className={styles.icon}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDelete(item.session_id);
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                            {selectedDetailIndex === index && (
                                                <tr className={styles.detailsRow}>
                                                    <td colSpan="10" className={styles.details}>
                                                        <h3>Matching Analysis:</h3>
                                                        <p><strong>Role Analaysis:</strong> {item.matching_analysis?.role_analysis || "N/A"}</p>
                                                        <p><strong>Influence:</strong> {item.matching_analysis?.influence || "N/A"}</p>
                                                        <p><strong>Original Elements:</strong> {item.matching_analysis?.original_elements || "N/A"}</p>
                                                        <p><strong>Overall Assessment:</strong> {item.matching_analysis?.overall_assessment || "N/A"}</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                            <div className={styles.paginationContainer}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    sx={{
                                        "& .MuiPaginationItem-root": {
                                            border: "none",
                                            outline: "none",
                                            fontSize: "1.1rem",
                                            fontWeight: "900",
                                            "&:focus": {
                                                outline: "none",
                                            }
                                        },
                                        "& .Mui-selected": {
                                            backgroundColor: "white",
                                            color: "#BF0030",
                                            border: "none"
                                        }
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <p className={styles.noData}>No data available.</p>
                    )}
                </>
            )}

            {showModal && (
                <Modal
                    type="Warning"
                    message="Are you sure you want to delete this session?"
                    onClose={handleCancel}
                    onConfirm={handleDelete}
                />
            )}

            {showSuccessModal && (
                <Modal
                    type="success"
                    message="Session deleted successfully!"
                    onClose={() => setShowSuccessModal(false)}
                />
            )}
            {showBulkDeleteModal && (
                <Modal
                    type="Warning"
                    message={`Are you sure you want to delete ${selectedRows.length} selected session(s)?`}
                    onClose={() => setShowBulkDeleteModal(false)}
                    onConfirm={handleConfirmBulkDelete}
                />
            )}

            {showFormatOptions && downloadType === "analysis" && (
                <div className={styles.formatChoice}>
                    <button
                        className={styles.subDownloadBtn}
                        onClick={() => {
                            setShowDownloadModal(true);
                            setShowFormatOptions(false);
                        }}
                    >
                        PDF
                    </button>

                    <button
                        className={styles.subDownloadBtn}
                        onClick={() => {
                            setShowDownloadModal(true);
                            setShowFormatOptions(false);
                        }}
                    >
                        Excel
                    </button>
                </div>
            )}


        </div>
    );
};

export default AnalysisTable;
