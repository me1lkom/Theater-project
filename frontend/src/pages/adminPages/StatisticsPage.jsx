import PredictForSession from "../../components/ml/PredictForSession";
import TrainingModel from "../../components/ml/TrainingModel";

export default function StatisticsPage(){
    return(
        <div className="container">
            <TrainingModel />
            
            <PredictForSession />
        </div>
    )
}