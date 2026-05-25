import styles from './RequestCard.module.css'
import useResponseRefundRequest from '../../../hooks/useResponseRefundRequest';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function RequestCard({ request, refetch }) {
    const request_date_reverse = request?.created_at.slice(0, 10).split('-').reverse().join('-');
    const play_date = request?.date.split('-').reverse().join('-');

    const MySwal = withReactContent(Swal)


    const { sendResponse, loading, error } = useResponseRefundRequest();


    const handleApprove = async () => {
        const result = await Swal.fire({
            title: "Вы уверены?",
            showCancelButton: true,
            confirmButtonText: "Да",
            cancelButtonText: "Отмена",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    await sendResponse(request.request_id, 'approve')

                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                    throw error;
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (result.isConfirmed) {
            MySwal.fire({
                toast: true,
                position: 'top-end',
                icon: "success",
                title: "Билет возвращен",
                timer: 1500,
                showConfirmButton: false
            });
            await refetch();
        }

    }

    const handleReject = async () => {
        const result = await Swal.fire({
            title: "Вы уверены?",
            showCancelButton: true,
            confirmButtonText: "Да",
            cancelButtonText: "Отмена",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    await sendResponse(request.request_id, 'reject')

                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                    throw error;
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (result.isConfirmed) {
            MySwal.fire({
                toast: true,
                position: 'top-end',
                icon: "error",
                title: "Возврат отказан",
                timer: 1500,
                showConfirmButton: false
            });
            await refetch();
        }
    }





    return (
        <div className={styles.ticketCard}>
            {
                loading ? <div className="loading loadingCenter">Загрузка запросов на возврат...</div> :
                    error ? <div className="error errorCenter">Ошибка: {error}</div> :

                        request.status === "pending" && (
                            <>
                                <div className={styles.infoGrid}>


                                    <div className={styles.ticketInfo}>
                                        <h3>ID</h3>
                                        <div className={styles.requestId}>
                                            <span className={styles.label}>ID запроса: </span>
                                            <span className={styles.value}>{request.request_id}</span>
                                        </div>
                                        <div className={styles.ticketId}>
                                            <span className={styles.label}>ID билета: </span>
                                            <span className={styles.value}>{request.ticket_id}</span>
                                        </div>
                                    </div>


                                    <div className={styles.userInfo}>
                                        <h3>Пользователь</h3>
                                        <div className={styles.name}>
                                            <span className={styles.label}>Имя:</span>
                                            <span className={styles.value}>{request.user.name}</span>
                                        </div>
                                        <div className={styles.email}>
                                            <span className={styles.label}>Email:</span>
                                            <span className={styles.value}>{request.user.email}</span>
                                        </div>

                                        <div className={styles.phone}>
                                            <span className={styles.label}>Телефон:</span>
                                            <span className={styles.value}>{request.user.phone}</span>
                                        </div>
                                    </div>

                                    <div className={styles.playInfo}>
                                        <h3>Спектакль</h3>
                                        <div className={styles.title}>
                                            <span className={styles.label}>Название: </span>
                                            <span className={styles.value}>{request.play}</span>
                                        </div>
                                        <div className={styles.seat}>
                                            <span className={styles.label}>Ряд / Место:</span>
                                            <span className={styles.value}>{request.seat}</span>
                                        </div>
                                        <div className={styles.date}>
                                            <span className={styles.label}>Дата: </span>
                                            <span className={styles.value}>{play_date}</span>
                                        </div>
                                        <div className={styles.time}>
                                            <span className={styles.label}>Время: </span>
                                            <span className={styles.value}>{request.time}</span>
                                        </div>
                                    </div>



                                    <div className={styles.paymentInfo}>
                                        <h3>Платёж</h3>
                                        <div className={styles.purchaseDate}>
                                            <span className={styles.label}>Дата запроса:</span>
                                            <span className={styles.value}>{request_date_reverse}</span>
                                        </div>

                                        <div className={styles.price}>
                                            <span className={styles.label}>Цена:</span>
                                            <span className={styles.value}>{request.price}₽</span>
                                        </div>
                                    </div>

                                    <div className={styles.paymentInfo}>
                                        <h3>Причина</h3>
                                        <div className={styles.reason}>
                                            <span className={styles.label}>Комментарий:</span>
                                            <span className={styles.value}>{request.reason}</span>
                                        </div>
                                    </div>

                                </div>

                                <div className={styles.actionButton}>
                                    <button
                                        onClick={handleApprove}
                                        className={styles.approveButton}
                                        disabled={null}
                                    >
                                        Одобрить
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className={styles.rejectButton}
                                        disabled={null}
                                    >
                                        Отклонить
                                    </button>
                                </div>

                            </>
                        )

            }
        </div>
    )
}