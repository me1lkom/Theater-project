import { buyTicket  } from "../api/index";
import { useState } from "react";

export function useBuyTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const buyTickets = async (session_id, seat_ids) => {
        setLoading(true);
        setError(null);
        
        try{
            await buyTicket(session_id, seat_ids);
            setLoading(false);
            setError(null);
            return { success: true };
        } catch(err) {
            // Получаем сообщение от бэкенда
            const backendMessage = err.response?.data?.error ||   // ← "error" поле
                                   err.response?.data?.message || // ← или "message"
                                   err.message;                   // ← fallback
            
            console.error('Ошибка от бэкенда:', backendMessage);
            console.error('Полный ответ:', err.response?.data);
            
            setError(backendMessage);
            return { success: false, error: backendMessage };
        } finally {
            setLoading(false);
        }
    }

    return {buyTickets, loading, error};
}