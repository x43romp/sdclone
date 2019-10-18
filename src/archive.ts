import { HashInterface, Hash, HashProgress, HashTypes } from "./hash";
import { directPath, expectDir, scandir, printProgress, expectFile } from "./tools";
import { parse } from "path";
import { EventEmitter } from "events";
import { Format } from "./format";

export type ArchiveStatus = "idle" | "hashing" | "done";

export class Archive extends EventEmitter {

    directory: string;
    filepath: string;
    files: Hash[];
    archiveDate: string;
    archiveType: HashTypes;

    path: string;
    savepath?: string;

    private _interval: number = -1;
    private _status: ArchiveStatus;
    private _current: HashProgress;
    private _queue: HashProgress[] = [];

    constructor(path: string, options?: string) {
        super();

        // cleanup path
        path = directPath(path);
        if (expectFile(path)) {
            // if a file is selected
            this.directory = parse(path).dir;
            this.filepath = path;
        } else if (expectDir(path)) {
            // if a directory is selected
            this.directory = path;
            this.filepath = null;
        } else {
            this.directory = null;
            this.filepath = null;
            throw new Error("invalid path - must be a real ")
        }

        // TODO: create a code that scans for mhl or md5 files in the directory

        let fileList: string[] = scandir(this.directory);
        this.files = fileList.map(file => { return new Hash(file, this.directory); });
    }

    public async stream(options?) {
        if (this.directory == null) throw new Error("archive path is not valid");

        if (options) this.setOptions(options);

        let counter = 0;
        for (let file of this.files) {
            counter++;
            await file.stream({ interval: this._interval }, (data: HashProgress, error) => {
                this.emit('data', data, counter);
            }).then((data) => {
                this.emit('hash', data, counter);
                this._queue.push(data);
            });
        }
        let format = new Format(this);
        format.save();
        this.emit('done');
    }

    public getType() { return ["md5", 32]; }

    public getFiles(): Hash[] { return this.files; }

    public getQueue() {
        let data = this._queue;
        this._queue = [];
        return data;
    }

    public setOptions(options: any[]) {
        this._interval = (options['interval']) ? options['interval'] : 1000;
    }

}
