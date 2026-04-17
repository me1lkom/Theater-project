import PredictForSession from "../../components/ml/PredictForSession";
import TrainingModel from "../../components/ml/TrainingModel";
import styles from "./StatisticsPage.module.css";

export default function StatisticsPage(){
    return(
        <div className={styles.container}>
            <TrainingModel />
            <PredictForSession />
        </div>
    )
}