import {Line, mixins} from "vue-chartjs";

const {reactiveProp} = mixins;

export default {
    extends: Line,
    mixins: [reactiveProp],
    props: ["chartData", "onLabelClick"],
    mounted() {
        this.renderChart(this.chartData, {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0,
            },
            hover: {
                animationDuration: 300,
            },
            responsiveAnimationDuration: 0,
            legend: {
                display: true,
                labels: {
                    generateLabels: (chart) => {
                        if (!chart.data.datasets) {
                            return null;
                        }
                        const out = chart.data.datasets.map((ds) => {
                            return {
                                text: ds.name,
                                fillStyle: ds.backgroundColor,
                                hidden: ds.hidden,
                                index: ds.index,
                            };
                        });
                        return out;
                    },
                },
                onClick: (e, legendItem) => {
                    this.onLabelClick(legendItem.index);
                },
            },
            scales: {
                xAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true,
                        labelString: "Type",
                    },
                }],
                yAxes: [{
                    stacked: true,
                    display: true,
                    ticks: {
                        beginAtZero: true,
                        labelString: "mem",
                    },
                }],
            },
        });
    },
};
