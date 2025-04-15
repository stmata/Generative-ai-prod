import React, { useEffect, useState } from "react";
import { fetchAnalysisData, deleteAnalysisEntry } from "../../services/statsService";
import styles from "./AnalysisTable.module.css";
import { FaEye, FaTrash, FaSearch, FaDownload } from "react-icons/fa";
import Modal from "../Modal/Modal";
import { useStats } from "../../context/StatsContext";
import Pagination from '@mui/material/Pagination';
import ModalDownload from "../ModalDownload/ModalDownload";

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
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    const handleDownload = () => {
        setShowDownloadModal(true);
    };

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
                    <div className={styles.filterContainer}>
                        {selectedRows.length > 0 && (
                            <FaDownload
                                className={styles.downloadIcon}
                                onClick={handleDownload}
                                title="Télécharger les sessions sélectionnées"
                            />
                        )}
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
            {showDownloadModal && (
                <ModalDownload
                    selectedIds={selectedRows}
                    onClose={() => setShowDownloadModal(false)}
                    onConfirm={() => {
                        setShowDownloadModal(false);
                    }}
                />
            )}

        </div>
    );
};

export default AnalysisTable;
