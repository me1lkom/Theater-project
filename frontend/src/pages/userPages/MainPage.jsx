import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlays } from '../../hooks/usePlays';
import PlayList from '../../components/plays/PlayList';
import PlayFilter from '../../components/plays/PlayFilter';

export default function MainPage() {
  const { plays, loading, error } = usePlays();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const navigate = useNavigate();

  const filteredPlays = plays?.filter(play => {
    const matchByTitle = play.title.toLowerCase().includes(searchQuery.toLowerCase());

    let matchByGenre = true;
    if (selectedGenre !== 'all') {
      if (play.genre != '' && selectedGenre != play.genre) {
        matchByGenre = false;
      } 
    }

    return matchByTitle && matchByGenre;
  });

  const handlePlayClick = (play_id) => {
    navigate(`/play/${play_id}`);
  };


  return (
    <div className="container">
      {loading && <div className="loading loadingCenter">Загрузка...</div>}
      {error && <div className="error errorCenter">Ошибка: {error}</div>}
      {!loading && !error && (!plays || plays.length === 0) &&
        <div className="loading loadingCenter">Спектаклей не найдено</div>
      }

      {!loading && !error && plays?.length > 0 && (
        <>

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
        </>
      )}
    </div>

  );
}