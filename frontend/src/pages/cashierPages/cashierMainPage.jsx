import PlayList from "../../components/cashier/PlayList";
// import styles from "./cashierMainPage.module.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlays } from '../../hooks/usePlays';
import PlayFilter from '../../components/cashier/PlayFilter';

export default function CashierMainPage() {
    const { plays, loading, error } = usePlays();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    // const navigate = useNavigate();

    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedPlayId, setSelectedPlayId] = useState(null);

    console.log(selectedPlayId)


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
                        selectedSession={selectedSession}
                        selectedPlayId={selectedPlayId}
                        onChangeSession={setSelectedSession}
                        onChangePlayId={setSelectedPlayId}
                    />
                </>
            )}
        </div>

    );
}