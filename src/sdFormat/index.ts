import { directPath, expectDir } from "../sdTools";
import { HashInterface } from "../sdHash";
import { Archive } from "../sdArchive";
import { parse, join } from "path";
import { FormatTemplate } from "./forrmateTemplate";
import { FormatMD5 } from "./formatMD5";

export interface FormatInterface {
    archivepath: string;
    archivefile?: string;                   // This one is for the archive file *.{md5,mhl}
    archivefiles?: string[];
    archivehash?: HashInterface[];
    archivedate?: string;
}

export class Format {
    _directory: string;
    _filepath: string;
    _date: string;
    _files: HashInterface[];

    _format: FormatTemplate;
    _formatLength: number;

    constructor(archive: Archive) {
        this._directory = archive.directory;
        this._filepath = archive.filepath;
        this._date = archive.archiveDate;
        this._files = archive.files;

        this._format = new FormatMD5(this._filepath);
    }

    readFile() {
    }

    save() {
        let folder = parse(this._directory).base;
        let filename = `${folder}_${new Date().toISOString()}${this._format.extension}`;
        let filepath = join(this._directory, filename);
        this._format.save(filepath, this._files);
    }

    _findType() {
        console.log(parse(this._filepath).ext);
    }


}
