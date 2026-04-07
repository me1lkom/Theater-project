import { useState } from 'react';
import { useMyTickets } from '../../hooks/useMyTickets';
import { useReturnTicket } from '../../hooks/useReturnTicket';
import TicketsCard from './TicketsCard';
import ReturnModal from './ReturnModal';


export default function UserTickets() {
    const { tickets, loading, error, refetch } = useMyTickets(); 

const { returnTicket, loading: returnLoading, error: returnError } = useReturnTicket();

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleReturnClick = (ticketId) => {
        setSelectedTicketId(ticketId);
        setShowModal(true);
    };

    const handleConfirmReturn = async (ticketId, reason) => {
        const result = await returnTicket(ticketId, reason);
        
        if (result.success) {
            setShowModal(false);
            setSelectedTicketId(null);
            if (refetch) refetch();
            alert('Билет успешно возвращен');
        } else {
            alert('Ошибка при возврате билета');
        }
    };

    const handleCancelReturn = () => {
        setShowModal(false);
        setSelectedTicketId(null);
    };

    if (loading) return <div>Загрузка билетов...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className="tickets-data">
            {tickets?.map(ticket => 
                <TicketsCard key={ticket.ticket_id} ticket={ticket} onReturnClick={handleReturnClick} />
            )}

            {showModal && (
               <ReturnModal
                    ticketId={selectedTicketId}
                    onConfirm={handleConfirmReturn}
                    onCancel={handleCancelReturn}
                    loading={returnLoading}
                    error={returnError}
                />
            )}
        </div>
    )
}