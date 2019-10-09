import { HashInterface } from "../sdHash";

export class FormatTemplate {
    private _directory: string;
    private _filepath: string;

    private _files: HashInterface[];
    private _data: string;

    extension: string;

    constructor(path: string) { }

    save(filepath?: string, data?) { }

}
