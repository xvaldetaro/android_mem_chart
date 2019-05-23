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
                                text: ds.kind,
                                fillStyle: ds.backgroundColor,
                                hidden: ds.hidden,
                                kind: ds.kind,
                            };
                        });
                        return out;
                    },
                },
                onClick: (e, legendItem) => {
                    this.onLabelClick(legendItem.kind);
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
