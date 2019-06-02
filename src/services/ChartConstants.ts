export interface Dataset {
    data: number[],
    backgroundColor: string,
}

export interface ChartData {
    labels: string[],
    datasets: Dataset[],
}

export interface LegendLabel {
    text: string,
    hidden: boolean,
}

