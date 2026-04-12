import { useState } from 'react';

export default function ReturnModal({  ticketId, onConfirm, onCancel }) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            alert('Пожалуйста, укажите причину возврата');
            return;
        }

        setIsSubmitting(true);
        await onConfirm(ticketId, reason);
        setIsSubmitting(false);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Возврат билета</h3>
                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder="Укажите причину возврата"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        required
                    />
                    <div className="modal-buttons">
                        <button type="button" onClick={onCancel}>
                            Отмена
                        </button>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Обработка...' : 'Подтвердить возврат'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}