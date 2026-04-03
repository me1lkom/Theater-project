import { useGenres } from "../../hooks/useGenres";

export default function PlayFilter({ searchQuery, onSearchChange, selectedGenre, onGenreChange }) {
  const { genres, loading } = useGenres();

  return (
    <div className="playFilter">
      <input
        type="text"
        placeholder="Поиск по названию..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select value={selectedGenre} onChange={(e) => onGenreChange(e.target.value)}>
        <option value="all">Все жанры</option>
        {!loading && genres?.map((genre) => <option key={genre.genre_id} value={genre.genre_id}>{genre.name}</option>)}
      </select>
    </div>
  );
}