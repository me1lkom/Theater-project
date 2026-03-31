import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlays } from '../hooks/usePlays';
import PlayFilter from '../components/plays/PlayFilter';
import PlayList from '../components/plays/PlayList';

export default function MainPage() {
  const navigate = useNavigate();
  const { plays, loading, error } = usePlays();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтруем только по названию
  const filteredPlays = useMemo(() => {
    if (!plays) return [];
    
    return plays.filter(play => {
      const matchesSearch = play.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [plays, searchQuery]);

  const handlePlayClick = (playId) => {
    navigate(`/play/${playId}`);
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <main>
      <h1>Афиша спектаклей</h1>
      
      <PlayFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <PlayList
        plays={filteredPlays}
        onPlayClick={handlePlayClick}
      />
    </main>
  );
}