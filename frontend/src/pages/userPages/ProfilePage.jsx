import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import UserInfo from '../../components/user/UserInfo';
import UserTickets from '../../components/user/UserTickets';
export default function ProfilePage() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogoutClick = () => {
        logout();
        navigate(`/`);
    }
    return (
        <div className="container">
            <UserInfo />
            <UserTickets />
            <button onClick={handleLogoutClick}>Выйти</button>
        </div>
    )
}