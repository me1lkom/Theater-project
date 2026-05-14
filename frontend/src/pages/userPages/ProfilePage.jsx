import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import UserInfo from '../../components/user/UserInfo';
import UserTickets from '../../components/user/UserTickets';
import TicketManagement from '../../components/admin/ticketManagement/TicketManagement'
import styles from './ProfilePage.module.css';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function ProfilePage() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const userRole = useAuthStore(state => state.userRole);
    const location = useLocation();
    const { text, icon } = location.state || { text: '', icon: '' }

    const MySwal = withReactContent(Swal);


    const handleLogoutClick = () => {
        logout();
        navigate(`/`);
    }

    useEffect(() => {
        if (text) {
            MySwal.fire({
                icon: icon,
                title: text,
                showConfirmButton: true,
                confirmButtonText: `Ок`,
            })
        }
    }, [text])

    return (
        <div className={styles.container}>
            <UserInfo />
            {userRole === 'admin' || userRole === 'cashier' ? <TicketManagement /> : <UserTickets />}

            <button className={styles.logoutButton} onClick={handleLogoutClick}>Выйти</button>
        </div>
    )
}