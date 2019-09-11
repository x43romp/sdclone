import { HashInterface, Hash, HashProgress, HashTypes } from "./sdHash";
import { directPath, expectDir, scandir, printProgress } from "./sdTools";
import { join } from "path";

export interface ArchiveInterface {
    archivepath: string;
    archivefile?: string;
    archivedate?: string;
    archivefiles?: string[];
    archivehash?: Hash[];
    archivetype?: HashTypes;
}

export class Archive implements ArchiveInterface {

    archivepath: string;
    archivefile: string;
    archivedate: string;
    archivefiles: string[];
    archivehash: Hash[];
    archivetype: HashTypes;

    path: string;
    files?: Hash[];
    savepath?: string;

    constructor(path: string, options?: string) {
        // cleanup path
        try {
            this.archivepath = directPath(path);
            if (!expectDir(this.archivepath)) {
                this.archivepath = null;
                throw "invalid archivepath";
            }
            
            // TODO: create a code that scans for mhl or md5 files in the directory

            this.archivefiles = scandir(this.archivepath);
            this.archivehash = this.archivefiles.map(file => new Hash(file, path));
        } catch (error) {
            console.error(error);
        }
    }

    public stream() {
        try {
            if (this.archivepath == null) throw "archive path not valid";

            for (let file of this.archivehash) {
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
