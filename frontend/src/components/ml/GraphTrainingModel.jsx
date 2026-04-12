import ReactECharts from "echarts-for-react";


export default function GraphTrainingModel({ dataSet }) {

    const day_of_week = dataSet?.feature_importance?.day_of_week || 0;
    const month = dataSet?.feature_importance?.month || 0;
    const is_weekend = dataSet?.feature_importance?.is_weekend || 0;
    const price = dataSet?.feature_importance?.price || 0;
    const duration = dataSet?.feature_importance?.duration || 0;
    const avg_sales_7d = dataSet?.feature_importance?.avg_sales_7d || 0;
    const avg_sales_30d = dataSet?.feature_importance?.avg_sales_30d || 0;

    var option = {
        title: {
            text: 'Влияние на продажи'
        },
        tooltip: {},
        xAxis: {
            type: 'category',
            data: ['День недели', 'Месяц', 'Выходной', 'Цена', 'Продолжительность', 'Средние продажи за 7 дней', 'Средние продажи за 30 дней'],
            axisLabel: {
                rotate: 45,
                interval: 0,
                fontSize: 11
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                type: 'bar',
                data: [day_of_week, month, is_weekend, price, duration, avg_sales_7d, avg_sales_30d]
            }
        ]
    };

    return (
        <div>
            {dataSet ? (
                <ReactECharts
                    option={option}
                />
            ) : (
                null
            )}
        </div>

    )

}