const PredefinedColors = [
    '#fabebe',
    '#ffd8b1',
    '#aaffc3',
    '#e6beff',
    '#e6194b',
    '#f58231',
    '#ff3119',
    '#bcf60c',
    '#46f0f0',
    '#4363d8',
    '#f032e6',
    '#808080',
    '#800000',
    '#9a6324',
    '#008080',
    '#fffac8',
];

export function kindToColor(kind: string, index: number): string {
    if (index >= PredefinedColors.length) {
        const color = intToRGB(hashCode(kind))
        return '#' + color
    } else {
        return PredefinedColors[index];
    }
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
