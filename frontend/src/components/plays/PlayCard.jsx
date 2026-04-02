export default function PlayCard({ play, onClick }) {
  return(
    <article className="playCard" onClick={() => onClick(play.play_id)}>
      <div className="posterContainer">
        <img src={play.poster} alt={play.title} />
        {play.genres?.map(genre =>(
          <div className="genre" key={genre.genre_id}>{genre.name}</div>
        ))}
      </div>
      <div className="infoContainer">
        <div className="info-all"> 
          <div className="title">{play.title}</div>
          <div className="description">{play.description}</div>
        </div>
        <div className="info-session"> 
          <div className="">//ближайшая дата и время, нужно подгружать через session/id. пока не реализовано</div>
          <div className="">{play.duration}</div> {/* В будущем необходимо перевести длительность из минут в номальный вид */}
          <div className="price">{play.price}</div> {/* В будущем необходимо перевести цену в номарльный вид */}
        </div>
      </div>
    </article>
  )
};