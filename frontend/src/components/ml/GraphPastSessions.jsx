import ReactECharts from "echarts-for-react";
import styles from './GraphPastSessions.module.css';

export default function GraphPastSessions({ dataSet, predict }) {

    console.log('дата сет', dataSet);
    console.log('прогноз', predict);
    
    const dates = dataSet?.map(session => session.date) || [];
    const soldTickets = dataSet?.map(session => session.statistics.sold_tickets) || [];
    // const occupancy = dataSet?.map(session => session.statistics.occupancy) || [];


    const predictionDate = predict?.date;
    const predictionValue = predict?.prediction?.predicted_tickets;

    // console.log(predictionDate, predictionValue)
    // console.log(dates, soldTickets)

    var optionSeats = {
        title: {
            text: 'Линейный график продажи билетов'
        },
        legend: {
            data: ['Фактические продажи', 'Прогноз'],
            left: 'center',
            top: 'bottom',
        },
        xAxis: {
            name: 'Дата',
            type: 'category',
            data: [...dates, predictionDate]
        },
        yAxis: {
            type: 'value',
            name: 'Продано билетов'
        },
        series: [
            {
                name: 'Фактические продажи',
                data: soldTickets,
                type: 'line',
                lineStyle: { color: '#4caf50' },
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: { color: '#4caf50' }
            },
            {
                name: 'Прогноз',
                data: [[predictionDate, predictionValue]],
                type: 'scatter',
                symbolSize: 16,
                symbol: 'circle',
                itemStyle: { color: '#e91e63' },
                label: {
                    show: true,
                    formatter: `${predictionValue} билетов`,
                    position: 'top'
                }
            }
        ]
    };

    var optionOccupancy = {
        title: {
            text: 'Продажи билетов'
        },
        legend: {
            data: ['Фактические продажи', 'Прогноз'],
            left: 'center',
            top: 'bottom',
        },
        xAxis: {
            name: 'Дата',
            type: 'category',
            data: [...dates, predictionDate]
        },
        yAxis: {
            name: 'Продано билетов',
            type: 'value'
        },
        series: [
            {
                name: 'Фактические продажи',
                data: soldTickets,
                type: 'bar',
                itemStyle: { color: '#2196f3' }
            },
            {
                name: 'Прогноз',
                data: [[predictionDate, predictionValue]],
                type: 'bar',
                itemStyle: { color: '#e91e63' }
            }
        ]
    };

    return (
        <div className={styles.graphContainer}>
            {dataSet ? (
                <>
                    <ReactECharts
                        option={optionSeats}
                    />

                    <ReactECharts
                        option={optionOccupancy}
                    />
                </>
            ) : (
                null
            )}
        </div>
    )
}