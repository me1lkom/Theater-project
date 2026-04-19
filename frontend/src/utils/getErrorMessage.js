export function getErrorMessage(err) {
    if (!err.response) {
        return err.message || 'Ошибка соединения с сервером.';
    }

    const data = err.response.data;
    const status = err.response.status;

    if (data.errors && typeof data.errors === 'object') {
        const firstField = Object.keys(data.errors)[0];
        if (firstField && firstField.length > 0) {
            return data.errors[firstField][0];
        }
    }

    if (data.detail) {
        return data.detail;
    }

    if (data.message) {
        return data.message;
    }

    if (typeof data.error === 'string') {
        return data.error;
    }

    return `Ошибка ${status} ${err.message}`
}