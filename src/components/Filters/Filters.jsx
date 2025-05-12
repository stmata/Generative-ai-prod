import { useState, useEffect } from "react";
import styles from "./Filters.module.css";
import { FaSearch, FaUndo } from "react-icons/fa";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField, Select, MenuItem } from "@mui/material";

const Filters = ({ onFilterChange }) => {
    const [activeTab, setActiveTab] = useState("All");
    const [selectedDate, setSelectedDate] = useState(null);
    const [returnedStatus, setReturnedStatus] = useState(null);
    const [searchId, setSearchId] = useState("");

    useEffect(() => {
        onFilterChange({
            activeTab,
            selectedDate,
            returnedStatus,
            searchId,
        });
    }, [activeTab, selectedDate, returnedStatus, searchId, onFilterChange]);

    const resetFilters = () => {
        setActiveTab("All");
        setSelectedDate(null);
        setReturnedStatus(null);
        setSearchId("");
    };

    return (
        <div className={styles.containerFilters}>
            <div className={styles.filtersRow}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Select Date"
                        value={selectedDate}
                        className={styles.timePickerWrapper}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                variant="outlined"
                                size="medium"
                                InputLabelProps={{ shrink: true }}
                                sx={{ height: "50px" }}
                            />
                        )}
                    />

                </LocalizationProvider>
                <Select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className={`${styles.dropdown} ${styles.filterControl}`}
                    displayEmpty
                >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="AI-Enhanced Creators">AI-Enhanced Creators</MenuItem>
                    <MenuItem value="AI-Reliant Users">AI-Reliant Users</MenuItem>
                    <MenuItem value="Ongoing Explorers">Ongoing Sessions</MenuItem>
                </Select>

                <Select
                    value={returnedStatus === null ? "" : String(returnedStatus)}
                    onChange={(e) => {
                        const val = e.target.value;
                        setReturnedStatus(val === "" ? null : val === "true");
                    }}
                    className={styles.dropdown}
                    displayEmpty
                >
                    <MenuItem value="" disabled>Returning user</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                </Select>

                <div className={styles.searchWrapper}>
                    <div className={styles.inputField}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by ID"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                    </div>
                    <div className={styles.resetIcon} onClick={resetFilters}>
                        <FaUndo />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Filters;
