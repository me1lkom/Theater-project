import { useModelTraining } from '../../hooks/useModelTraining';
import { useGetMLInfo } from '../../hooks/useGetMLInfo';
import GraphTrainingModel from './GraphTrainingModel';
import styles from './TrainingModel.module.css';

export default function TrainingModel() {
    const { info, loading, error } = useGetMLInfo();
    const { train, loading: loadingTraining, error: errorTraining, data } = useModelTraining();

    const handleTrainingModel = async () => {
        const result = await train();
        if (result.success) {
            alert('Модель успешно обучена!');
        } else {
            alert(`Ошибка: ${result.error}`);
        }
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.TrainingModel}>
            <h2>Обучение модели</h2>
            {info.is_trained == true ? (
                <div className={`${styles.status} ${styles.modelTrained}`}>
                    <p>Статус модели: уже обучена</p>
                    <button onClick={handleTrainingModel} disabled={loadingTraining}>
                        {loadingTraining ? 'Обучение...' : 'Обучить модель заново'}
                    </button>
                </div>

            ) : (
                <div className={`${styles.status} ${styles.modelNotTrained}`}>
                    <p>Статус модели: не обучена</p>
                    <button onClick={handleTrainingModel} disabled={loadingTraining}>
                        {loadingTraining ? 'Обучение...' : 'Обучить заново'}
                    </button>
                </div>
            )}

            {data && (
                <div className={styles.result}>
                    <h3>Результат обучения:</h3>
                    <p>{data.message}</p>
                    {data.metrics && (
                        <div className={styles.resultInfo}>
                            <p>R²: {data.metrics.r2}</p>
                            <p>MAE: {data.metrics.mae}</p>
                        </div>
                    )}
                </div>
            )}

            {errorTraining && <p>Ошибка обучения: {errorTraining}</p>}

            <GraphTrainingModel dataSet={data}/>
        </div>
    )
}