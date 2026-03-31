import { useState, useEffect } from "react";
import { getPlays } from "../api/index";

export function usePlays() {
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlays = async () => {
        try {
            setLoading(true);
            const data = await getPlays();
            setPlays(data);
            setError(null);
        } catch (err) {
            setError(err.massage || 'Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    fetchPlays();

  }, []);

  return {plays, loading, error};
}
