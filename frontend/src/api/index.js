import axios from "axios";
import useAuthStore from "../store/useAuthStore";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const addToQueue = (resolve, reject) => {
    failedQueue.push({ resolve, reject });
};

const redirectToLogin = async () => {
    const { logout } = useAuthStore.getState();
    await logout();

    if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
    }
};

export const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    },
});


apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        console.log(`Ошибка, поймана интерцептором: ${error.response?.status}, ${originalRequest.url}`);

        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh');

        if (error.response?.status !== 401 || isAuthEndpoint) {
            return Promise.reject(error);
        }

        if (originalRequest.url === '/auth/refresh/') {
            console.log('Refresh token expired or invalid, redirecting to login');
            await redirectToLogin();
            return Promise.reject(error);
        }

        if (isRefreshing) {
            console.log('Обновление токена');
            return new Promise((resolve, reject) => {
                addToQueue(resolve, reject);
            }).then(() => {
                console.log('Повторение исходного запроса');
                return apiClient(originalRequest);
            }).catch((err) => {
                return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        console.log('Обновляем токен');

        try {
            await apiClient.post('/auth/refresh/');
            console.log('Токен обновлён');

            processQueue(null);

            console.log('Повторение исходных запросов');
            return apiClient(originalRequest);

        } catch (refreshError) {
            console.log(`Токен не обновлён:', ${refreshError}`);

            processQueue(refreshError, null);

            await redirectToLogin();

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
            console.log('Refresh flag reset');
        }
    }
);


// –– Спектакли
export async function getPlays() {
    const response = await apiClient.get('/plays/');
    return response.data;
};

export async function getPlayById(id) {
    const response = await apiClient.get(`/plays/${id}/`)
    return response.data;
};

export async function getGenres() {
    const response = await apiClient.get('/genres/');
    return response.data;
}

export async function getSessions() {
    const response = await apiClient.get('/sessions/');
    return response.data;
}

export async function getSessionById(id) {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data;
}

export async function getSeats() {
    const response = await apiClient.get('/seats/');
    return response.data;
}

export async function getAvailableSeats(session_id) {
    const response = await apiClient.get(`/sessions/${session_id}/available-seats/`);
    return response.data;
}

export async function getActorsBySession(session_id) {
    const response = await apiClient.get(`/actors-roles/${session_id}/`);
    return response.data;
}


// –– Запросы пользователь
export async function getMe() {
    const response = await apiClient.get('/auth/me/')
    return response.data;
}

export async function changingMyInfo(credentials) {
    const response = await apiClient.patch('/auth/profile/', credentials);
    return response.data;
}

export async function getMyTickets() {
    const response = await apiClient.get('/tickets/my/');
    return response.data;
}

// –– Запросы auth
export async function login(credentials) {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
}

export async function register(credentials) {
    const response = await apiClient.post('/auth/register/', credentials);
    return response.data;
}

export async function logout() {
    await apiClient.post('/auth/logout/');
}

export async function refreshToken() {
    await apiClient.post('/auth/refresh/');
}

// –– Билеты 
export async function postReturnTicket(id, reason) {
    const response = await apiClient.post(`/tickets/return/${id}/`, reason);
    return response.data;
}

// –– Покупка билетов / Козина
export async function addToBasket(session_id, seat_ids) {
    const response = await apiClient.post('/basket/add/bulk/', {
        session_id: session_id,
        seat_ids: seat_ids
    });
    return response.data;
}

export async function buyTicket(session_id, seat_ids) {
    const response = await apiClient.post('/tickets/buy/bulk/', {
        session_id: session_id,
        seat_ids: seat_ids
    });
    return response.data;
}

export async function buyTicketCashier(session_id, seat_ids, phone) {
    const response = await apiClient.post('/tickets/buy/bulk/', {
        session_id: session_id,
        seat_ids: seat_ids,
        phone: phone
    });
    return response.data;
}

export async function getMyBasket() {
    const response = await apiClient.get('/basket/my/');
    return response.data;
}

export async function removeFromBasket(basketId) {
    const response = await apiClient.delete(`/basket/remove/${basketId}/`);
    return response.data;
}

// –– ML
export async function getMLInfo() {
    const response = await apiClient.get('/ml/info/');
    return response.data;
}

export async function getPredictForSession(session_id) {
    const response = await apiClient.post(`/ml/demand-predict/?session_id=${session_id}`);
    return response.data;
}

export async function modelTraining() {
    const response = await apiClient.post('/ml/train/');
    return response.data;
}

export async function HistoryPredictions() {
    const response = await apiClient.get(`/ml/predictions/`);
    return response.data;
}

export async function PastSessions(play_id) {
    const response = await apiClient.get(`/sessions/past/?play_id=${play_id}`);
    return response.data;
}

// –– Логгирование 
export async function getLogs(count) {
    const response = await apiClient.get(`/admin/logs/?limit=${count}`);
    return response.data;
}

export async function getLogByFilter(filter) {
    const response = await apiClient.get(`/admin/logs/?action_type=${filter}`);
    return response.data;
}

export async function getLogTypes() {
    const response = await apiClient.get('/admin/logs/types/');
    return response.data;
}

// –– Бэкап
export async function getBackup() {
    const response = await apiClient.get('/backup/', {
        responseType: 'blob',
    });
    return response.data;
}

// –– Управление данными
// - спектакли
export async function createPlay(data) {
    const response = await apiClient.post('/plays/manage/', data);
    return response.data;
}

export async function changePlay(play_id, data) {
    const response = await apiClient.put(`/plays/manage/${play_id}/`, data);
    return response.data;
}

export async function deletePlay(play_id) {
    const response = await apiClient.delete(`/plays/manage/${play_id}/`);
    return response.data;
}
// - сеансы
export async function createSession(data) {
    const response = await apiClient.post('/sessions/manage/', data);
    return response.data;
}

export async function changeSession(session_id, data) {
    const response = await apiClient.put(`/sessions/manage/${session_id}/`, data);
    return response.data;
}

export async function deleteSession(session_id) {
    const response = await apiClient.delete(`/sessions/manage/${session_id}/`);
    return response.data;
}
// - жанры
export async function createGenre(data) {
    const response = await apiClient.post('/genres/manage/', data);
    return response.data
}

export async function getGenreById(genre_id) {
    const response = await apiClient.get(`/genres/manage/${genre_id}/`);
    return response.data;
}

export async function changeGenre(genre_id, data) {
    const response = await apiClient.put(`/genres/manage/${genre_id}/`, data);
    return response.data;
}

export async function deleteGenre(genre_id) {
    const response = await apiClient.delete(`/genres/manage/${genre_id}/`);
    return response.data;
}
// - актеры
export async function getActors() {
    const response = await apiClient.get('/actors/manage/');
    return response.data;
}
export async function getActorById(actor_id) {
    const response = await apiClient.get(`/actors/manage/${actor_id}`);
    return response.data;
}

export async function createActor(data) {
    const response = await apiClient.post('/actors/manage/', data);
    return response.data
}

export async function changeActor(actor_id, data) {
    const response = await apiClient.put(`/actors/manage/${actor_id}/`, data);
    return response.data;
}

export async function deleteActor(actor_id) {
    const response = await apiClient.delete(`/actors/manage/${actor_id}/`);
    return response.data;
}
