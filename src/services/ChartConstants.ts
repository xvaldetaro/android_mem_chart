export const kindToColor = (kind: string) => {
    const color = intToRGB(hashCode(kind))
    return '#' + color
};

function hashCode(str: string): number { // java String#hashCode
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i: number) {
    const c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return '00000'.substring(0, 6 - c.length) + c;
}

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

