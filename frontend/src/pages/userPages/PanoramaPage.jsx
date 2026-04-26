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
        '8-1', '8-5', '8-10', '8-11', '8-15', '8-20',

        '9-1', '9-5', '9-10', '9-11', '9-15', '9-20',
        '10-3', '10-8', '10-13', '10-18',
        '11-1', '11-5', '11-10', '11-11', '11-15', '11-20',
        '12-3', '12-8', '12-13', '12-18',

        '13-1', '13-6', '13-7', '13-12',
        '14-2', '14-5', '14-8', '14-11',
        '15-1', '15-6', '15-7', '15-12',
        '16-2', '16-5', '16-8', '16-11',
        '17-1', '17-6', '17-7', '17-12'
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