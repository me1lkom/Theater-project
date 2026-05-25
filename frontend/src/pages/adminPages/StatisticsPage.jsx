import PredictForSession from "../../components/admin/ml/PredictForSession";
import TrainingModel from "../../components/admin/ml/TrainingModel";
import HistoryPredictions from "../../components/admin/ml/HistoryPredictions";
import styles from "./StatisticsPage.module.css";

export default function StatisticsPage() {
    return (
        <div className={styles.container}>
            <div className={styles.neededContainer}>
                <TrainingModel />
                <PredictForSession />
                <HistoryPredictions />
            </div>
        </div>
    )
}