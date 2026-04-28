import { useState } from 'react';
import { getBackup } from '../api/index';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useBackup() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const downloadBackup = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getBackup();
            
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'database_dump.sql');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { downloadBackup, loading, error };
}