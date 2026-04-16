import { useGetActorsBySession } from '../../../hooks/useGetActorsBySession';
import styles from './PlayActor.module.css';


export default function PlayActor({ selectedSession }) {
    const { data, loading, error } = useGetActorsBySession(selectedSession);

    if (loading) return <div className={styles.loading}>Загрузка актёров...</div>;
    if (error) return <div className={styles.error}>Ошибка: {error}</div>;
    if (!data?.session_actors?.length) return <div>Актёры не указаны</div>;

    return (
        <div className={styles.actorsList}>
            {data.session_actors.map(actor => (
                <div className={styles.actor} key={actor.actor_id}>
                    {actor.actor_name} — {actor.actor_role_name}
                </div>
            ))}
        </div>
    );
}