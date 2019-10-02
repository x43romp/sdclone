import { HashInterface, Hash, HashProgress, HashTypes } from "./sdHash";
import { directPath, expectDir, scandir, printProgress } from "./sdTools";
import { parse } from "path";

export interface ArchiveInterface {
    directory: string;
    filepath?: string;
    files?: Hash[];
    archiveDate?: string;
    archiveType?: HashTypes;
}

export class Archive implements ArchiveInterface {

    directory: string;
    filepath: string;
    files: Hash[];
    archiveDate: string;
    archiveType: HashTypes;

    path: string;
    savepath?: string;

    constructor(path: string, options?: string) {
        // cleanup path
        this.directory = directPath(path);
        if (!expectDir(this.directory)) {
            this.directory = null;
            throw new Error("invalid path - must be a real ")
        }

        // TODO: create a code that scans for mhl or md5 files in the directory

        let fileList: string[] = scandir(this.directory);
        this.files = fileList.map(file => { return new Hash(file, this.directory); });

    }

    public stream() {
        try {
            if (this.directory == null) throw "archive path not valid";

            for (let file of this.files) {
                file.stream({ interval: 1000 }, (data: HashProgress, error) => {
                    // console.log(`${file.}`)
                }).then((data) => {
                    console.log(`${data.hash} ${data.filename}`);
                })
            }
        } catch (error) {
            console.log(error);
        }

    }

    public getFiles(): Hash[] {
        return this.files;
    }
}
