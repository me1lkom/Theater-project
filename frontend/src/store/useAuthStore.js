import { create } from 'zustand';
import { logout as logoutByApi } from '../api/index';
const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => {
        set({ user: user, isAuthenticated: true, isLoading: false });
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Данные получены');
        console.log('Текущий localStorage:', { ...localStorage });
    },

    logout: async () => {
        try {
            await logoutByApi();
        } catch (err) {
            console.log(err.message || 'Ошибка при выходе');
        }

        set({ user: null, isAuthenticated: false, isLoading: false });
        localStorage.removeItem('user');

    },


    hydrate: () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            set({
                user: JSON.parse(savedUser),
                isAuthenticated: true,
                isLoading: false
            });
        } else {
            set({ isLoading: false });
        }
    }
}));

export default useAuthStore;