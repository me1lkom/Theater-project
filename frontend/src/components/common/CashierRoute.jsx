import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export function CashierRoute({ children }) {
    const { user, isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) return <div>Загрузка...</div>

    if (user?.role !== 'cashier') {
        return <Navigate to="/" />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }


    return children;
}