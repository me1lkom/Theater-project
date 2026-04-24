import { useState } from 'react';
import PanoramaViewer from '../../components/panorama/PanoramaViewer';
import HallPlan from '../../components/panorama/HallPlan';
import styles from './PanoramaPage.module.css';

export default function PanoramaPage() {
    const defaultImage = '/panoramas/default.png';
    const [imageUrl, setImageUrl] = useState(null);

    const placesWithPanoramas = [
        '1-1', '1-10', '1-11', '1-20', 
        '2-6', '2-16', 
        '3-1', '3-10', '3-11', '3-20', 
        '4-5', '4-15', 
        '5-1', '5-10', '5-11', '5-20', 
        '6-6', '6-16', 
        '8-1', '8-5', '8-10', '8-11', '8-15', '8-20'
    ];

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

            <HallPlan placesWithPanoramas={placesWithPanoramas} onClick={(seatData) => handleСhangePhoto(seatData)} />
        </div>
    );
}