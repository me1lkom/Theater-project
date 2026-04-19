import { addToBasket, getMyBasket, removeFromBasket } from "../api/index";
import { useState } from "react";
import { getErrorMessage } from '../utils/getErrorMessage';

export function useAddToBasket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addTicketToBasket = async (session_id, seat_ids) => {
        setLoading(true);
        setError(null);

        try {
            console.log(`Запрос`)
            const basket = await getMyBasket();

            if (basket.count > 0) {
                console.log(`Зашел, ${basket.count}`)
                const availableBasket = basket.baskets;



                for (const item of availableBasket) {
                    await removeFromBasket(item.basket_id);
                    console.log(`Удалена старая бронь ${item.basket_id}`)
                }

            }

            await addToBasket(session_id, seat_ids);
            setLoading(true);
            setError(null);
            return { success: true };
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }

    return { addTicketToBasket, loading, error };
}