import React, { useState, useEffect } from "react";
import styles from "./Filters.module.css";
import { FaSearch, FaUndo } from "react-icons/fa";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField, Select, MenuItem } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";

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
    const customTheme = createTheme({
        components: {
            MuiPickersDay: {
                styleOverrides: {
                    root: {
                        "&.Mui-selected": {
                            backgroundColor: "var(--primary-color) !important",
                            color: "white !important",
                            borderRadius: "50%",
                            border: "none !important",
                            outline: "none !important",
                            fontWeight: "bold",
                        },
                        "&.Mui-selected:hover": {
                            backgroundColor: "var(--primary-color) !important",
                        },
                    },
                },
            },
            MuiYearPicker: {
                styleOverrides: {
                    root: {
                        "& .Mui-selected": {
                            backgroundColor: "white !important",
                            color: "var(--primary-color) !important",
                            fontWeight: "bold",
                            borderRadius: "25%",
                            border: "solid var(--primary-color) 2px !important",
                            outline: "none !important",
                        },
                        "& .Mui-selected:hover": {
                            backgroundColor: "var(--primary-color) !important",
                        },
                    },
                },
            },
            MuiPickersYear: {
                styleOverrides: {
                    root: {
                        "& .Mui-selected": {
                            backgroundColor: "white !important",
                            color: "var(--primary-color) !important",
                            fontWeight: "bolder",
                            borderRadius: "5px",
                            border: "none !important",
                            outline: "none !important",
                        },
                        "& .Mui-selected:hover": {
                            backgroundColor: "var(--primary-color) !important",
                        },
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        height: "50px",
                        "& fieldset": {
                            borderColor: "#ccc",
                        },
                        "&:hover fieldset": {
                            borderColor: "var(--primary-color)",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "var(--primary-color)",
                        },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: "#777",
                        "&.Mui-focused": {
                            color: "var(--primary-color)",
                        },
                    },
                },
            },
            MuiSvgIcon: {
                styleOverrides: {
                    root: {
                        color: "var(--primary-color) !important",
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    root: {
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        backgroundColor: "white",
                        height: "50px",
                        "&:hover": {
                            borderColor: "var(--primary-color)",
                        },
                        "&.Mui-focused": {
                            borderColor: "var(--primary-color)",
                        },
                    },
                },
            },
        },
    });

    return (
        <ThemeProvider theme={customTheme}>
            <div className={styles.containerFilters}>
                <div className={styles.tabsContainer}>
                    <div className={styles.tabs}>
                        {["All", "AI-Enhanced Creators", "AI-Reliant Users", "Ongoing Explorers"].map((tab) => (
                            <span
                                key={tab}
                                className={tab === activeTab ? styles.activeTab : styles.tab}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </span>
                        ))}
                    </div>
                    <div className={styles.inputField}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by ID"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.filters}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            maxDate={dayjs()}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--primary-color) !important',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--primary-color) !important',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--primary-color) !important',
                                    },
                                },
                            }}
                            label="Select Date"
                            value={selectedDate}
                            onChange={(newDate) => setSelectedDate(newDate)}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>

                    <Select
                        value={returnedStatus === null ? "" : String(returnedStatus)}
                        onChange={(event) => {
                            const value = event.target.value;
                            if (value === "") {
                                setReturnedStatus(null);
                            } else if (value === "true") {
                                setReturnedStatus(true);
                            } else if (value === "false") {
                                setReturnedStatus(false);
                            }
                        }}
                        displayEmpty
                        className={styles.dropdown}
                        sx={{
                            textAlign: "left",
                            "& .MuiSelect-select": {
                                color: returnedStatus !== null ? "var(--primary-color) !important" : "#777",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--primary-color) !important",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--primary-color) !important",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--primary-color) !important",
                            },
                        }}
                    >
                        <MenuItem value="" disabled>Returning user</MenuItem>
                        <MenuItem value="true">True</MenuItem>
                        <MenuItem value="false">False</MenuItem>
                    </Select>

                    {/* Icône reset alignée à droite */}
                    <div className={styles.resetIcon} onClick={resetFilters}>
                        <FaUndo />
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default Filters;
