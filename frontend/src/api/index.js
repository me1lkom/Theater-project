import axios from "axios";

export const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    },
});


apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);


// –– Запросы
export async function getPlays() {
    const response = await apiClient.get('/plays/');
    return response.data;
};

export async function getPlayById(id) {
    const response = await apiClient.get(`/plays/${id}`)
    return response.data;
};

export async function getSessionByPlay(playId) {
    const response = await apiClient.get('/sessions/', {
        params: { play_id: playId }
    });
    return response.data;
};

export async function getAvailableSeats(sessionId) {
    const response = await apiClient.get(`/sessions/${sessionId}/available-seats/`);
    return response.data;
};



