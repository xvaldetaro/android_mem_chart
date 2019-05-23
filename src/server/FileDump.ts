import * as fs from 'fs';
import * as path from 'path';
import {Base64} from 'js-base64';

export function getParamFromFile(filePath: string): Promise<string> {
    return new Promise<string>((res, rej) => {
        fs.readFile(path.resolve(process.cwd(), filePath), 'utf8', (err, jsonString) => {
            if (err) {
                console.log(err)
                return rej()
            }
            res(Base64.encode(jsonString));
        })
    })
}
