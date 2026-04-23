import { useState } from 'react';
import { useMyTickets } from '../../hooks/useMyTickets';
import { useReturnTicket } from '../../hooks/useReturnTicket';
import TicketsCard from './TicketsCard';
import ReturnModal from './ReturnModal';
import styles from './UserTickets.module.css';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function UserTickets() {
    const { tickets, loading, error, refetch } = useMyTickets();

    const { returnTicket, error: returnError } = useReturnTicket();

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const MySwal = withReactContent(Swal);

    const handleReturnClick = (ticketId) => {
        setSelectedTicketId(ticketId);
        setShowModal(true);
    };

    const handleConfirmReturn = async (ticketId, reason) => {
        const result = await returnTicket(ticketId, reason);
        console.log(`Попытка возврата билета: ${ticketId}`)
        if (result.success) {
            setShowModal(false);
            setSelectedTicketId(null);
            if (refetch) refetch();
            MySwal.fire({
                title: 'Билет успешно возвращен!',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: 'top-right',
            })
        } else {
            alert(`Ошибка при возврате билета ${returnError}`);
        }
    };

    const handleCancelReturn = () => {
        setShowModal(false);
        setSelectedTicketId(null);
    };

    if (loading) return <div>Загрузка билетов...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    const filteredTickets = tickets.filter(ticket => {
       return ticket.status === 'продан'
    });

    let ticketFlag = filteredTickets?.length > 0;

    return (
        <div className={styles.ticketsSection}>
            <h2 className={styles.sectionTitle}>Мои билеты</h2>
            <div className={`${styles.ticketsGrid} ${ticketFlag === true ? styles.ticketsGridOn : styles.ticketsGridOff}`}>
                {filteredTickets?.length > 0? (
                    <>
                        {console.log(filteredTickets)}
                        {filteredTickets?.map(ticket => (
                            <TicketsCard key={ticket.ticket_id} ticket={ticket} onReturnClick={handleReturnClick} />
                        ))}
                    </>
                ) : (
                    <p className={styles.emptyMessage}>У вас пока нет билетов</p>
                )}
            </div>

            {showModal && (
                <ReturnModal
                    ticketId={selectedTicketId}
                    onConfirm={handleConfirmReturn}
                    onCancel={handleCancelReturn}
                />
            )}
        </div>
    )
}