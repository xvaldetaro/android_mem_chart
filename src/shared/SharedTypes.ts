export interface DumpRow { [key: string]: number }

export interface Payload {
    dumpRow?: DumpRow,
    schema?: string[],
}

