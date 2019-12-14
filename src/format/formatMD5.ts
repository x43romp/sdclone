import { FormatTemplate } from "./formatTemplate";
import { readFileSync, writeFileSync } from "fs";
import { Hash, HashInterface } from "../hash";
import { parse, normalize } from "path";
import { directPath } from "../tools";

export class FormatMD5 extends FormatTemplate {

    extension = ".md5";
    static extensionList = ['.md5'];

    constructor(path: string) {
        super(path);
    }

    public static save(filepath: string, data: HashInterface[]) {
        let savefile: string = "";
        savefile = data.map(file => { return `${file.hash}  ${file.filename}`; }).join('\n');
        writeFileSync(filepath, savefile);
    }

    public static read(): HashInterface[] {
        return [];
    }

}
