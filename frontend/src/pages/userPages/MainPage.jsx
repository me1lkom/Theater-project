import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlays } from '../../hooks/usePlays';
import PlayList from '../../components/plays/PlayList';
import PlayFilter from '../../components/plays/PlayFilter';

export default function MainPage(){
  const { plays, loading, error } = usePlays();
  const [ searchQuery, setSearchQuery ] = useState('');
  const [ selectedGenre, setSelectedGenre ] = useState('all');
  const navigate = useNavigate();

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!plays || plays.length === 0) return <div>Спектаклей не найдено</div>;

  const filteredPlays = plays.filter(play => {
    const matchByTitle = play.title.toLowerCase().includes(searchQuery.toLowerCase());

    let matchByGenre = true;
    if (selectedGenre !== 'all') {
      matchByGenre = play.genres?.some(
        genre => genre.genre_id === Number(selectedGenre)
      );
    }

    return matchByTitle && matchByGenre;
  });

  const handlePlayClick = (play_id) => {
    navigate(`/play/${play_id}`);
  };


  return (
    <div className="container">
      <PlayFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery} 
        selectedGenre={selectedGenre} 
        onGenreChange={setSelectedGenre}
      />

      <PlayList
        plays={filteredPlays} 
        onPlayClick={handlePlayClick}
      />
    </div>
  );
}