import styles from './DataFilter.module.css';

export default function DateFilter({ searchQuery, onSearchChange }) {


    return (
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
