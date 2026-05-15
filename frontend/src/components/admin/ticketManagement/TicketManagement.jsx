import { useGetRefundableTickets } from '../../../hooks/useGetRefundableTickets';
import { useReturnTicket } from '../../../hooks/useReturnTicket';
import styles from './TicketManagement.module.css';
import { useState } from 'react';

import TicketsCard from './TicketsCard'
import TicketsFilter from './TicketsFilter'
import ReturnModal from './ReturnModal'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function TicketManagement() {
    const { tickets, loading, error, fetchTickets } = useGetRefundableTickets();

    const [searchPhone, onPhoneChange] = useState('');
    const [searchEmail, onEmailChange] = useState('');
    const [searchTicketId, onTicketIdChange] = useState('');
    const [searchPurchaseDate, onPurchaseDateChange] = useState('');

    const MySwal = withReactContent(Swal);

    const handleSearchClick = async () => {
        const newFilter = {
            phone: searchPhone,
            email: searchEmail,
            ticket_id: searchTicketId,
            purchase_date: searchPurchaseDate
        };

        await fetchTickets(newFilter);
    }

    const { returnTicket, error: returnError } = useReturnTicket();

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [showModal, setShowModal] = useState(false);


    const handleReturnClick = (ticketId) => {
        setSelectedTicketId(ticketId);
        setShowModal(true);
    };

    const handleConfirmReturn = async (ticketId, reason) => {
        const result = await returnTicket(ticketId, reason);
        console.log(`Попытка возврата билета: ${ticketId}`)
        console.log(ticketId)
        if (result.success) {
            setShowModal(false);
            setSelectedTicketId(null);
            if (fetchTickets) fetchTickets();
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

    let ticketFlag = tickets?.results.length > 0;


    return (
        <div className={styles.ticketsSection}>
            <h2 className={styles.sectionTitle}>Управление билетами</h2>
            {
                loading ? <div className="loading loadingCenter">Загрузка билетов...</div> :
                    error ? <div className="error errorCenter">Ошибка: {error}</div> :
                        <>
                            <TicketsFilter
                                searchPhone={searchPhone}
                                onPhoneChange={onPhoneChange}
                                searchEmail={searchEmail}
                                onEmailChange={onEmailChange}
                                searchTicketId={searchTicketId}
                                onTicketIdChange={onTicketIdChange}
                                searchPurchaseDate={searchPurchaseDate}
                                onPurchaseDateChange={onPurchaseDateChange}
                            />

                            <button onClick={handleSearchClick} className={styles.searchButton}>Найти</button>

                            <div className=''>

                                {console.log(tickets?.results)}

                                <div className={`${styles.ticketsGrid} ${ticketFlag === true ? styles.ticketsGridOn : styles.ticketsGridOff}`}>
                                    {tickets?.results.length > 0 ? (
                                        <>
                                            {console.log(tickets?.results)}
                                            {tickets?.results.map(ticket => (
                                                <TicketsCard key={ticket.ticket_id} ticket={ticket} handleReturnClick={handleReturnClick} />
                                            ))}
                                        </>
                                    ) : (
                                        <p className={styles.emptyMessage}>Введите параметры поиска</p>
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
                        </>
            }


        </div>

    )
}