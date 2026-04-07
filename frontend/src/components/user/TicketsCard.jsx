export default function TicketsCard({ ticket, onReturnClick }) {
    return (
        <div className="ticket-card">
            {ticket.status == "продан" && (
                <>
                    <div>{ticket.play_title}</div>
                    <div>{ticket.date}</div>
                    <div>{ticket.time}</div>
                    <div>{ticket.row} {ticket.seat}</div>
                    <div>{ticket.ptice}</div>

                    <button onClick={() => onReturnClick(ticket.ticket_id)} className="return-button">Вернуть билет</button>
                </>
            )}

        </div>
    )
}