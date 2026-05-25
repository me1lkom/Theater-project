import styles from './TicketsCard.module.css'
import { useGetTicketPDF } from '../../hooks/useGetTicketPDF';
import { createRefundRequest } from '../../api/index'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function TicketsCard({ ticket, refetch }) {
    const reversed = ticket.date?.split('-').reverse().join('-');
    const { downloadTicket, loading: downloadTicketLoading } = useGetTicketPDF(ticket.ticket_id);

    const MySwal = withReactContent(Swal)

    const handleRefund = async () => {
        Swal.fire({
            title: "Вернуть билет",
            input: "text",
            inputLabel: "Укажите причину возврата",
            inputValidator: (value) => {
                if (!value) return "Причина обязательна.";
            },
            showCancelButton: true,
            confirmButtonText: "Отправить",
            cancelButtonText: "Отмена",
            showLoaderOnConfirm: true,
            preConfirm: async (reason) => {
                try {
                    createRefundRequest(ticket.ticket_id, reason);

                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        refetch;
    }

    return (
        <div className={`${styles.ticketCard} ${ticket.status === "на рассмотрении" ? styles.refundTicket : ""}`}>
            {(ticket.status === "продан" || ticket.status === "на рассмотрении") && (
                <>
                    <div className={styles.title}>{ticket.play_title}</div>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Дата:</span>
                            <span className={styles.value}>{reversed}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Время:</span>
                            <span className={styles.value}>{ticket.time}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Ряд / Место:</span>
                            <span className={styles.value}>{ticket.row} / {ticket.seat}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Цена:</span>
                            <span className={styles.value}>{ticket.price} ₽</span>
                        </div>
                    </div>

                    <button
                        onClick={downloadTicket}
                        className={styles.returnButton}
                        disabled={downloadTicketLoading}
                    >
                        Скачать билет
                    </button>


                    {ticket.status === "на рассмотрении" ? (
                        <button className={styles.refundButton}>
                            На рассмотрении возврата
                        </button>
                    ) :
                        (
                            <button className={styles.refundButton} onClick={handleRefund}>
                                Возврат
                            </button>
                        )}
                </>
            )}
        </div>
    )
}