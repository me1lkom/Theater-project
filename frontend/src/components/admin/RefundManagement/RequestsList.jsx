import { useGetRefundRequest } from '../../../hooks/useGetRefundRequest';
import RequestCard from './RequestCard';
import styles from './RequestsList.module.css';



export default function RequestsList() {

    const { requests, loading, error, refetch } = useGetRefundRequest();
    console.log(requests);

    let requestFlag = requests?.count > 0;


    return (
        <div className={styles.requestsSection}>
            {
                loading ? <div className="loading loadingCenter">Загрузка запросов на возврат...</div> :
                    error ? <div className="error errorCenter">Ошибка: {error}</div> :
                        <div className={`${styles.requestsGrid} ${requestFlag ? styles.requestsGridOn : styles.requestsGridOff}`}>                            {
                            requests?.count > 0
                                ?
                                <>
                                    {console.log(requests?.requests)}
                                    {requests.requests.map(request => (
                                        <RequestCard key={request.ticket_id} request={request} refetch={refetch} />
                                    ))}
                                </>
                                :
                                <>
                                    <div className={styles.noRequests}>Нет заявок на возврат</div>
                                </>
                        }
                        </div>
            }
        </div>
    )
}