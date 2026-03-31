export default function PlayFilter({ searchQuery, onSearchChange }) {
  return (
    <div className="playFilter">
      <input
        type="text"
        placeholder="Поиск по названию..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {/* Фильтр по жанрам пока убираем */}
    </div>
  );
}