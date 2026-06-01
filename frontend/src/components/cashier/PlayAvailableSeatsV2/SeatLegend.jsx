import styles from './SeatLegend.module.css';

export default function SeatLegend({ sectorPrices }) {
    return (
        <div className={styles.legend}>
            <div className={styles.legendGrid}>
                <div className={styles.legendItem}>
                    <div className={styles.colorBox} style={{ background: '#2ecc71' }}></div>
                    <span> {sectorPrices.Партер && `— ${sectorPrices.Партер} ₽`}</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.colorBox} style={{ background: '#3498db' }}></div>
                    <span> {sectorPrices.Амфитеатр && `— ${sectorPrices.Амфитеатр} ₽`}</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.colorBox} style={{ background: '#e67e22' }}></div>
                    <span> {sectorPrices.Балкон && `— ${sectorPrices.Балкон} ₽`}</span>
                </div>
            </div>
        </div>
    );
}