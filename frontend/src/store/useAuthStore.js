import { create } from 'zustand';
import { logout as logoutByApi } from '../api/index';
const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    theme: 'light',

    paymentId: null,

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

    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        return { theme: newTheme };
    }),

    setPaymentId: (paymen_id) => {
        set({ paymentId: paymen_id });
        localStorage.setItem('paymentId', JSON.stringify(paymen_id));
        console.log('Текущий localStorage:', { ...localStorage });
    },

    clearPaymentId: () => {
        set({ paymentId: null });
        localStorage.removeItem('paymentId');
        console.log('Текущий localStorage:', { ...localStorage });
    },

    hydrate: () => {
        const savedUser = localStorage.getItem('user');
        const savedPaymentId = localStorage.getItem('paymentId');
        if (savedUser) {
            set({
                user: JSON.parse(savedUser),
                isAuthenticated: true,
                isLoading: false
            });
        } else {
            set({ isLoading: false });
        }

        if (savedPaymentId) {
            set({ paymentId: JSON.parse(savedPaymentId) });
        }
    }
}));

export default useAuthStore;