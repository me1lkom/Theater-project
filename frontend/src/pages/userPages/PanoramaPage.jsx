import { useState } from 'react';
import PanoramaViewer from '../../components/panorama/PanoramaViewer';
import HallPlan from '../../components/panorama/HallPlan';
import styles from './PanoramaPage.module.css';
import { useGetAllPanoramas } from '../../hooks/useGetAllPanoramas';

export default function PanoramaPage() {
    const defaultImage = 'https://s3.twcstorage.ru/f6d90d88-c142-44fd-b70d-0a879c5125f7/panoramas/1-1.jpg';
    const [imageUrl, setImageUrl] = useState(null);

    const { panoramas, loading, error } = useGetAllPanoramas();

    // const handleСhangePhoto = (seatData) => {
    //     setImageUrl(`/panoramas/${seatData.row}-${seatData.seat}.jpg`);
    // }

    const handleСhangePhoto = (seatData) => {
        const RowSeat = seatData.row + '-' + seatData.seat
        let needPanorama = panoramas.filter(panorama => panorama.title === RowSeat);
        setImageUrl(needPanorama.image_url);
    }

    if (loading) return <div>Загрузка панорам...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.container}>
            <h1>Панорама зала</h1>
            <PanoramaViewer
                defaultImageUrl={defaultImage}
                imageUrl={imageUrl}
            />

            <HallPlan panoramas={panoramas} onClick={(seatData) => handleСhangePhoto(seatData)} />
        </div>
    );
}