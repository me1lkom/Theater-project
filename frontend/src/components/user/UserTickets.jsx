// import { useState } from 'react';
import { useMyTickets } from '../../hooks/useMyTickets';
// import { useReturnTicket } from '../../hooks/useReturnTicket';
import TicketsCard from './TicketsCard';
import ReturnModal from './ReturnModal';
import styles from './UserTickets.module.css';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function UserTickets() {
    const { tickets, loading, error, refetch } = useMyTickets();

    const MySwal = withReactContent(Swal);

    const filteredTickets = tickets?.filter(ticket => {
        return ticket.status === 'продан' || ticket.status === 'на рассмотрении'
    });

    let ticketFlag = filteredTickets?.length > 0;

    return (
        <div className={styles.ticketsSection}>
            <h2 className={styles.sectionTitle}>Мои билеты</h2>
            {
                loading ? <div className="loading loadingCenter">Загрузка билетов...</div> :
                    error ? <div className="error errorCenter">Ошибка: {error}</div> :
                        <div className={`${styles.ticketsGrid} ${ticketFlag === true ? styles.ticketsGridOn : styles.ticketsGridOff}`}>
                            {filteredTickets?.length > 0 ? (
                                <>
                                    {console.log(filteredTickets)}
                                    {filteredTickets?.map(ticket => (
                                        <TicketsCard key={ticket.ticket_id} ticket={ticket} refetch={refetch}/>
                                    ))}
                                </>
                            ) : (
                                <p className={styles.emptyMessage}>У вас пока нет билетов</p>
                            )}
                        </div>
            }
        </div>
    )
}