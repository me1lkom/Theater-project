import { addToBasket  } from "../api/index";
import { useState } from "react";

export function useAddToBasket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addTicketToBasket = async (session_id, seat_ids) => {
        setLoading(true);
        setError(null);
        
        try{
            await addToBasket(session_id, seat_ids);
            setLoading(true);
            setError(null);
            return { success: true };
        } catch(err){
            setError(err.message || 'Ошибка добавления в корзину');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }

    return {addTicketToBasket, loading, error};
}