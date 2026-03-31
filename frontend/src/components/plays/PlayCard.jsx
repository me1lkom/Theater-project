export default function PlayCard({ play, onclick }) {
  return (
    <article className="playCard">
      <div className="playPoster">
        {play.poster_url ? (
          <img src={play.poster_url} alt={play.title} />
        ) : (
          <div className="posterPlaceholder">🎭</div>
        )}
        // сюда, поверх постера должне подтягиваться жанр. хочу сделать его в
        небольшой кружке в правом верхнем углу постера
      </div>
      <div className="playInfo">
        <div>
          <h3 className="playTitle">{play.title}</h3>
          <p className="playDescription">{play.description}</p>
        </div>
        
        <div className="playFooter">
          <div className="playMeta">
            <span>⏱ {play.duration} мин</span>
            <span>от {play.price} ₽</span>
          </div>
          <button className="btn" onClick={() => onClick(play.play_id)}>
            Купить
          </button>
        </div>
      </div>
    </article>
  );
}

// Много div, нужно менять структуру
