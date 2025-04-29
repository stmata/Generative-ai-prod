import React, { useEffect, useState } from "react";
import { fetchAnalysisData, deleteAnalysisEntry } from "../../services/statsService";
import styles from "./AnalysisTable.module.css";
import { FaEye, FaTrash, FaSearch } from "react-icons/fa";
import Modal from "../Modal/Modal";
import { useStats } from "../../context/StatsContext";
import Pagination from '@mui/material/Pagination';
import { useDiagrams } from "../../context/DiagramContext";
import CustomSelect from "./CustomSelect";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { downloadChatsService, downloadAnalysisService } from "../../services/downloadService";
import * as XLSX from "xlsx";

const handleDirectDownload = async (type, selectedIds, format = "pdf") => {
    if (!selectedIds || selectedIds.length === 0) return;

    const zip = new JSZip();
    let hasContent = false;

    if (type === "chats") {
        for (const id of selectedIds) {
            const chatsData = await downloadChatsService({ ids: [id] });
            if (chatsData?.length) {
                const pdf = generateConversationPDF(chatsData[0]);
                if (pdf) {
                    zip.folder("chats").file(`chat-${id}.pdf`, pdf, { binary: true });
                    hasContent = true;
                }
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
                    const pdf = generateAnalysisPDF(session);
                    if (pdf) {
                        zip.folder("analysis").file(`analysis-${session.session_id}.pdf`, pdf, { binary: true });
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
        "Total Duration (Minutes)": session.time_stats?.total_duration_minutes?.toFixed(2) ?? "0.00",
        "Returned After 30 Mins": session.time_stats?.user_returned_after_30mins ? "Yes" : "No",
        "Human Creativity": `${session.originality_score ?? "N/A"}%`,
        "AI Score": `${session.assistant_influence_score ?? "N/A"}%`,
        "Relevance": `${session.matching_score ?? "N/A"}%`,
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
                console.log('...')
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
    doc.setFont("helvetica", "italic");
    doc.setTextColor(191, 0, 48);
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
    y += lineHeight + 20;


    doc.setFont("helvetica", "italic");
    doc.setTextColor(191, 0, 48);
    doc.text("Scores:", x, y);
    y += lineHeight;

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
    doc.text(`${sessionData.assistant_influence_score ?? "N/A"}%`, x + 50, y);
    y += lineHeight;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(191, 0, 48);
    doc.text("Revelance:", x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${sessionData.matching_score ?? "N/A"}%`, x + 60, y);
    y += lineHeight + 10;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(191, 0, 48);
    doc.text("Matching Analysis:", x, y);
    y += lineHeight;

    const { role_analysis, influence, original_elements, overall_assessment } = sessionData.matching_analysis ?? {};

    if (role_analysis) {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(191, 0, 48);
        doc.text("Role Analysis:", x, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += lineHeight;
        const lines = doc.splitTextToSize(role_analysis, 500);
        lines.forEach((ln) => {
            checkPageOverflow(lineHeight);
            doc.text(ln, x, y);
            y += lineHeight;
        });
    }

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
    }

    return doc.output("blob");
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
    const { refreshStats } = useStats();
    const { refreshDiagrams } = useDiagrams();
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadType, setDownloadType] = useState(null);
    const [showFormatOptions, setShowFormatOptions] = useState(false);
    ;

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
                                        value="Download Analysis"
                                        options={["PDF", "Excel"]}
                                        onChange={(format) => {
                                            if (selectedRows.length === 0) return;
                                            handleDirectDownload("analysis", selectedRows, format.toLowerCase());
                                        }}
                                        disabled={selectedRows.length === 0}
                                    />
                                </div>
                                <button
                                    className={styles.downloadBtn}
                                    onClick={() => {
                                        handleDirectDownload("chats", selectedRows);
                                    }}
                                    disabled={selectedRows.length === 0}
                                >
                                    Download Chats
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
                                        <th>Date</th>
                                        <th>Returned</th>
                                        <th>Human Creativity</th>
                                        <th>AI Score</th>
                                        <th>Relevance</th>
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
