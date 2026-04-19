import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export function AuthenticatedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) return <div>Загрузка...</div>

    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    return children;
}