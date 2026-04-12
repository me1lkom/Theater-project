import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export function AdminRoute({ children }) {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/" />;
    }
    return children;
}