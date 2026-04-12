import ReactECharts from "echarts-for-react";

export default function GraphPredict({ dataSet }) {

    const predictedTickets = dataSet?.prediction?.predicted_tickets || 0;
    const totalSeats = dataSet?.prediction?.total_seats || 0;
    const count = totalSeats - predictedTickets;

    var option = {
        title: {
            text: 'Прогноз продажи билетов'
        },
        tooltip: {},
        series: [
            {
                type: 'pie',
                data: [
                    { value: predictedTickets, name: 'Продано билетов' },
                    { value: count, name: 'Свободно' }
                ]
            }
        ]
    };

    return (
        <div>
            {dataSet ? (
                <ReactECharts
                option={option}
            />
            ): (
                null
            )}
        </div>

    )

}