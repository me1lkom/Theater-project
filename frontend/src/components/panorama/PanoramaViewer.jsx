import { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

export default function PanoramaViewer({ defaultImageUrl, imageUrl }) {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const loadPanorama = async (url, viewer) => {
        if (!url || !viewer) return;

        try {
            console.log('Загружаем через fetch:', url);
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            viewer.setPanorama(blobUrl);

        } catch (error) {
            console.error('Ошибка загрузки:', error);
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;
        if (viewerRef.current) return;

        const placeholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg==';

        viewerRef.current = new Viewer({
            container: containerRef.current,
            panorama: placeholder,
            loadingTxt: 'Загрузка...',
            navbar: [
                'zoom',
                'move',
                'caption',
                'fullscreen',
            ],
            defaultZoomLvl: 0,
        });

        setIsInitialized(true);

        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isInitialized || !viewerRef.current) return;
        if (!defaultImageUrl) return;

        loadPanorama(defaultImageUrl, viewerRef.current);
    }, [isInitialized, defaultImageUrl]);

    useEffect(() => {
        if (!isInitialized || !viewerRef.current) return;
        if (!imageUrl) return;

        const seatMatch = imageUrl.match(/(\d+)-(\d+)/);
        if (seatMatch) {
            viewerRef.current.setOption('caption', `Ряд: ${seatMatch[1]} Место: ${seatMatch[2]}`);
        }

        loadPanorama(imageUrl, viewerRef.current);
    }, [imageUrl, isInitialized]);

    return <div ref={containerRef} style={{ width: '100%', height: '500px' }} />;
}