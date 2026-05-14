import styles from './DataFilter.module.css';

export default function DataFilter({ searchQuery, onSearchChange }) {
  return (
    <div className={styles.playFilter}>
      <input
        type="text"
        placeholder="Поиск по названию..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}