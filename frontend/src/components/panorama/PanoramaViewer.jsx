import { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';
import styles from './PanoramaViewer.module.css';

export default function PanoramaViewer({ defaultImageUrl, imageUrl }) {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [preloadedImage, setPreloadedImage] = useState(null);

    let seatRow = String(imageUrl).slice(11, 15).split('-');

    useEffect(() => {
        if (!defaultImageUrl) return;


        console.log(`Начинаем предзагрузку изображения:, ${defaultImageUrl}`);

        const img = new Image();
        img.onload = () => {
            console.log('Изображение загружено!');
            setImageLoaded(true);
            setPreloadedImage(img.src);
        };
        img.onerror = () => {
            console.error(`Ошибка загрузки изображения:, ${defaultImageUrl}`);
        };
        img.src = defaultImageUrl;
    }, [defaultImageUrl]);

    useEffect(() => {
        if (!imageLoaded) return;
        if (!containerRef.current) return;
        if (viewerRef.current) return;

        console.log(`Создаём плеер с предзагруженным изображением:, ${preloadedImage}`);

        viewerRef.current = new Viewer({
            container: containerRef.current,
            panorama: preloadedImage,
            loadingTxt: 'Загрузка...',
            navbar: [
                'zoom',
                'move',
                'caption',
                'fullscreen',
            ],
            defaultZoomLvl: 30,
        });

        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [imageLoaded, preloadedImage]);

    useEffect(() => {
        if (!viewerRef.current) return;
        if (!imageUrl) return;



        console.log(`Переключаем панораму на:, ${imageUrl}`);
        viewerRef.current.setOption('caption', ('Ряд: ' + seatRow[0] + ' Место: ' + seatRow[1]));
        viewerRef.current.setPanorama(imageUrl);
    }, [imageUrl]);

    return (
        <div
            ref={containerRef}
            className={styles.player}
        />
    );
}