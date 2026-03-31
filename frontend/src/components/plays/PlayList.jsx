import PlayCard from './PlayCard';

export default function PlayList({ plays, onPlayClick }) {
  if (!plays || plays.length === 0) {
    return <div>Спектакли не найдены</div>;
  }

  return (
    <div>
      {plays.map(play => (
        <PlayCard
          key={play.play_id}
          play={play}
          onClick={onPlayClick}
        />
      ))}
    </div>
  );
}