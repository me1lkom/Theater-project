// import styles from './PastSessionsStatistic.module.css'
import { usePastSessions } from '../../hooks/usePastSessions';
import GraphPastSessions from './GraphPastSessions';

export default function PastSessionsStatistic({ play_id, predict}){

    const { data, loading, error } = usePastSessions(play_id);

    const sessions = data?.results

    if (loading) return <div>Загрузка...</div>
    if(error) return <div>Ошибка, {error}</div>

    return (
        <div>
            {/* {sessions?.map(session => (
                <div key={session.session_id} className={styles.session}>
                    <p>{session.play.id}</p>
                    <p>{session.play.title}</p>
                    <p>{session.date}</p>
                    <p>{session.time}</p>
                    <p>{session.statistics.sold_tickets}</p>
                </div>
            ))} */}
            <GraphPastSessions dataSet={sessions} predict={predict} />
        </div>
    )
}