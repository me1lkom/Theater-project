// import { useState } from 'react';
// import Calendar from 'react-calendar';
// import './Date.css';

import styles from './DataFilter.module.css';

export default function DateFilter({ searchQuery, onSearchChange }) {
    // const [selectedDate, setSelectedDate] = useState(value);

    // const handleDateChange = (date) => {
    //     setSelectedDate(date);
    //     if (onChange) {
    //         onChange(date);
    //     }
    // };

    return (
        // <div>
        //     <Calendar
        //         onChange={handleDateChange}
        //         value={selectedDate}
        //         locale="ru-RU"
        //         className="my-calendar"
        //     />
        // </div>


        <div className={styles.playFilter}>
            <input
                type="date"
                placeholder="Поиск по названию..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
}
