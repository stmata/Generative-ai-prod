import React, { useState } from "react";
import Filters from "../Filters/Filters";
import UserCardList from "../UserCardList/UserCardList";
import UserInfos from "../UserInfos/UserInfos";
import styles from "./Datas.module.css";

const Datas = () => {
    const [filters, setFilters] = useState({
        activeTab: "All",
        selectedDate: null,
        returnedStatus: null,
        searchId: ""
    });

    const [selectedUserId, setSelectedUserId] = useState(null);

    const handleBackToList = () => {
        setSelectedUserId(null);
    };

    return (
        <div className={styles.containerData}>
            {selectedUserId ? (
                <UserInfos sessionId={selectedUserId} onBack={handleBackToList} />
            ) : (
                <>
                    <Filters onFilterChange={setFilters} />
                    <UserCardList filters={filters} onSelectUser={setSelectedUserId} />
                </>
            )}
        </div>
    );

};

export default Datas;
