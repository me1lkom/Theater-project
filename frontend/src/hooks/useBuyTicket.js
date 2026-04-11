import { buyTicket  } from "../api/index";
import { useState } from "react";

export function useBuyTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const buyTickes = async (user_id, session_id, seat_ids) => {
        setLoading(true);
        setError(null);
        
        try{
            await buyTicket(user_id, session_id, seat_ids);
            setLoading(false);
            setError(null);
            return { success: true };
        } catch(err){
            setError(err.message || 'Ошибка добавления в корзину');
        } finally {
            setLoading(false);
        }
    }

    return {buyTickes, loading, error};
}