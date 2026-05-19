import styles from './ContactPage.module.css'

export default function ContactPage() {

    return (
        <div className={styles.container}>
            <div className={styles.contact}>
                <h2>Контактная информация</h2>
                <p>Адрес: Мой адрес не дом и не улица</p>
                <p>Телефон: +7 (905) 789-12-12</p>
                <p>Email: emailtheater@gmail.com</p>
                <p>Часы работы: Пн–Вс: 10:00 – 20:00</p>

            </div>
            <div className={styles.infoContainer}>
                <h2>История Нашего театра</h2>
                <p>Наш театр был основан в 2015 году группой молодых актёров и режиссёров, мечтавших о своём пространстве. 
                    Первый спектакль прошёл в арендованном подвале при свечах — зрители сидели на полу, но аплодировали стоя. 
                    С тех пор мы выросли, но душу не потеряли. 
                    Сегодня это полноценная сцена с мягкими креслами и современным светом, но мы всё так же любим экспериментировать и искать новые формы.</p>
            </div>
            <div className={styles.mapContainer}>
                <iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3Aed8f0526508bd7e65739988419883a7f59617ebbd38f7061a307023f907ffc94&amp;source=constructor" frameborder="0"></iframe>
            </div>
        </div>
    )
}