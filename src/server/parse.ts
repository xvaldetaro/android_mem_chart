import {DumpRow} from './SharedTypes';
import {RawKind, SummaryKind} from './memkinds';

export const SummaryKinds = [
    SummaryKind.JavaHeap,
    SummaryKind.NativeHeap,
    SummaryKind.Code,
    SummaryKind.Stack,
    SummaryKind.Graphics,
    SummaryKind.PrivateOther,
    SummaryKind.System,
    SummaryKind.Total,
    SummaryKind.TotalSwapPss,
];

export const SummaryMatchers = {
    [SummaryKind.JavaHeap]: /Java\s+Heap:\s+(\d+)/,
    [SummaryKind.NativeHeap]: /Native\s+Heap:\s+(\d+)/,
    [SummaryKind.Code]: /Code:\s+(\d+)/,
    [SummaryKind.Stack]: /Stack:\s+(\d+)/,
    [SummaryKind.Graphics]: /Graphics:\s+(\d+)/,
    [SummaryKind.PrivateOther]: /Private\s+Other:\s+(\d+)/,
    [SummaryKind.System]: /System:\s+(\d+)/,
    [SummaryKind.Total]: /TOTAL:\s+(\d+)/,
    [SummaryKind.TotalSwapPss]: /TOTAL\s+SWAP\s+PSS:\s+(\d+)/,
};

export function parseSummary(data: string): DumpRow | null {
    const index = data.search(/App Summary/);
    if (index === -1) {
        return null
    }
    const cut = data.substring(index)
    const endIndex = cut.search(/Objects/)
    const relevantPiece = cut.substring(0, endIndex)
    return parseByType(relevantPiece, SummaryKinds, SummaryMatchers);
}

export function parseRaw(data: string): DumpRow | null {
    const index = data.search(/------/)
    if (index === -1) {
        return null
    }
    const cut = data.substring(index)
    const endIndex = cut.search(/App Summary/)
    const relevantPiece = cut.substring(0, endIndex)
    return parseByType(relevantPiece, RawKinds, RawMatchers);
}

export const RawKinds = [
    RawKind.NativeHeap,
    RawKind.DalvikHeap,
    RawKind.DalvikOther,
    RawKind.Stack,
    RawKind.Ashmem,
    RawKind.GfxDev,
    RawKind.OtherDev,
    RawKind.soMmap,
    RawKind.apkMmap,
    RawKind.ttfMmap,
    RawKind.dexMmap,
    RawKind.oatMmap,
    RawKind.artMmap,
    RawKind.OtherMmap,
    RawKind.Unknown,
    RawKind.TotalRaw,
];

export const RawMatchers = {
    [RawKind.NativeHeap]: /Native Heap\s+(\d+)/,
    [RawKind.DalvikHeap]: /Dalvik Heap\s+(\d+)/,
    [RawKind.DalvikOther]: /Dalvik Other\s+(\d+)/,
    [RawKind.Stack]: /Stack\s+(\d+)/,
    [RawKind.Ashmem]: /Ashmem\s+(\d+)/,
    [RawKind.GfxDev]: /Gfx dev\s+(\d+)/,
    [RawKind.OtherDev]: /Other dev\s+(\d+)/,
    [RawKind.soMmap]: /\.so mmap\s+(\d+)/,
    [RawKind.apkMmap]: /\.apk mmap\s+(\d+)/,
    [RawKind.ttfMmap]: /\.ttf mmap\s+(\d+)/,
    [RawKind.dexMmap]: /\.dex mmap\s+(\d+)/,
    [RawKind.oatMmap]: /\.oat mmap\s+(\d+)/,
    [RawKind.artMmap]: /\.art mmap\s+(\d+)/,
    [RawKind.OtherMmap]: /Other mmap\s+(\d+)/,
    [RawKind.Unknown]: /Unknown\s+(\d+)/,
    [RawKind.TotalRaw]: /TOTAL\s+(\d+)/,
};

function parseByType(data: string, kinds: string[], matchers: {[key: string]: RegExp}): DumpRow | null {
    try {
        return kinds.map((kind) => {
            const matcher = matchers[kind];
            const matched = data.match(matcher);
            if (matched && matched.length > 0) {
                return parseInt(matched[1], 10);
            }
            return 0;
        })
    } catch (e) {
        return null
    }
}

