import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export function AuthenticatedRoute({ children }) {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    return children;
}