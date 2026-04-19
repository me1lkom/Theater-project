import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export function AdminRoute({ children }) {
    const { user, isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) return <div>Загрузка...</div>

    if (user?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }


    return children;
}