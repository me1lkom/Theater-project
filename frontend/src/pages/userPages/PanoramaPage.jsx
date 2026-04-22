import { useState } from 'react';
import PanoramaViewer from '../../components/panorama/PanoramaViewer';
import HallPlan from '../../components/panorama/HallPlan';
import styles from './PanoramaPage.module.css';

export default function PanoramaPage() {
    const defaultImage = '/panoramas/1-1.jpg';
    const [imageUrl, setImageUrl] = useState(null);



    const handleСhangePhoto = (seatData) => {
        setImageUrl(`/panoramas/${seatData.row}-${seatData.seat}.jpg`);
    }

    return (
        <div className={styles.container}>
            <h1>Панорама зала</h1>
            <PanoramaViewer
                defaultImageUrl={defaultImage}
                imageUrl={imageUrl}
            />

            <HallPlan onClick={(seatData) => handleСhangePhoto(seatData)} />
        </div>
    );
}