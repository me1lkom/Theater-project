import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import UserInfo from '../../components/user/UserInfo';
import UserTickets from '../../components/user/UserTickets';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogoutClick = () => {
        logout();
        navigate(`/`);
    }
    return (
        <div className={styles.container}>
            <UserInfo />
            <UserTickets />
            <button className={styles.logoutButton} onClick={handleLogoutClick}>Выйти</button>
        </div>
    )
}