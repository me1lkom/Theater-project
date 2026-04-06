import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogoutClick = () => {
        logout();
        navigate(`/`);
    }
    return (
        <div className="container">
            <button onClick={handleLogoutClick}>Выйти</button>
        </div>
    )
}