// import { useState } from 'react';
import DataInfo from '../../components/payment/DataInfo';
import { useLocation } from 'react-router-dom';


export default function PaymentPage() {

    const location = useLocation();
    const { sessionId, selectedSeats } = location.state || {};

    return(
        <div>
            <DataInfo sessionId={sessionId} selectedSeats={selectedSeats} />
        </div>
    )
}