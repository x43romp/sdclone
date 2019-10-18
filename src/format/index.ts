import { directPath, expectDir } from "../tools";
import { HashInterface } from "../hash";
import { Archive } from "../archive";
import { parse, join } from "path";
import { FormatTemplate } from "./formatTemplate";
import { FormatMD5 } from "./formatMD5";

export const Formats = [FormatTemplate, FormatMD5];

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
        let filepath = this.createFileName();
        this._format.save(filepath, this._files);
    }

    _findType() {
        console.log(parse(this._filepath).ext);
    }


    createFileName(): string {
        let ext = (this._format) ? this._format._fileExt : '.md5';
        let folder = parse(this._directory).base;
        let date = new Date().toISOString().split(".")[0].split(":").join("").split("T").join("_");
        let filename = `${folder}_${date}${ext}`;
        let filepath = join(this._directory, filename);
        return filepath;
    }
}

export class FormatLoader {
    constructor(archivePath: string) {
        let ext = parse(archivePath).ext;
        for (let format of Formats) {
            if (format.extension.includes(ext)) {
                return new format(archivePath);
            }
        }
        return FormatTemplate;
    }
}