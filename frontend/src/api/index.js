import axios from "axios";

export const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    // withCredentials: true, 
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    },
});


// –– Запросы данные
export async function getPlays() {
    const response = await apiClient.get('/plays/');
    return response.data;
};

export async function getPlayById(id) {
    const response = await apiClient.get(`/plays/${id}`)
    return response.data;
};

export async function getGenres(){
    const response = await apiClient.get('/genres/');
    return response.data;
}

export async function getSessions() {
    const response = await apiClient.get('/sessions/');
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

// –– Запросы auth
export async function login(credentials) {
    const response = await apiClient.post('/auth/login/', credentials, {
        withCredentials: true
    });
    return response.data;
}

export async function register(credentials) {
    const response = await apiClient.post('/auth/register/', credentials, {
        withCredentials: true
    });
    return response.data;
}

export async function logout(){
    await apiClient.post('/auth/logout/', {}, {
        withCredentials: true
    });
}