import { normalize, parse, join } from "path";
import { expectFile } from "./tools";
import { statSync, createReadStream, createWriteStream } from "fs";
import { createHash } from "crypto";

export type HashTypes = "md5" | "sha1";
export type HashStatus = "match" | "different" | "outdated" | "not-found" | "new-file";

export interface streamOptions {
    hashtype?: HashTypes;
    interval?: number;
};

const streamDefaults: streamOptions = {
    hashtype: "md5",
    interval: 1000,
}

export interface HashProgress extends HashInterface {
    sizeread?: number;
}

export interface HashInterface {
    filename: string;
    filepath: string;
    filedate?: string;
    filesize?: number;

    hash?: string;
    hashtype?: HashTypes;
    hashdate?: string;
}

export interface HashOptions {
    dir?: string;
    target?: HashInterface;
}

export class Hash implements HashInterface {

    public filename: string;
    public filepath: string;
    public filedate: string;
    public filesize: number;

    public hash: string;
    public hashtype: HashTypes;
    public hashdate: string;

    private _target: HashInterface;

    /**
     * Create a new Hash object - must define the filepath
     * @param path string filepath
     * @param options optional configurations
     */
    constructor(path: string, options?: HashOptions | string) {

        // configure options
        options =
            (!options) ? {} :
                (typeof options == "string") ? { dir: options } :
                    options;

        let filename = path;
        path = normalize(path);
        path = (options.dir) ? join(options.dir, path) : normalize(path);
        if (!expectFile(path)) throw new Error(`invalid file ${path}`);

        this.filename = (options.dir) ? filename : parse(path).base;
        this.filepath = (options.dir) ? join(options.dir, filename) : path;
        this.filedate = statSync(path).mtime.toISOString();
        this.filesize = statSync(path).size;

        // sets target
        this._target = (options.target) ? options.target : null;
    }

    /**
     * File streaming - for hasing and copying files
     * @param options streamOptions optional configuration
     * @param callback fn(data, error) optional callback to view progress
     */
    public stream(options?: streamOptions, callback?: (data, error?) => void): Promise<HashProgress> {
        return new Promise((resolve, reject) => {
            try {

                // Load HashProgress defaults
                let progress: HashProgress = {
                    filename: this.filename,
                    filepath: this.filepath,
                    filesize: this.filesize,
                    sizeread: 0
                }

                // create streams
                let hash = createHash(this.hashtype || "md5").setEncoding('hex');
                let read = createReadStream(this.filepath);

                // pipe streams
                read.pipe(hash);

                // update callbacks
                if (callback) {
                    // initalize timers
                    let timer = (callback) ? new Date().getTime() : 0;
                    read.on('data', (data) => {
                        progress.sizeread += data.length;
                        if (new Date().getTime() >= timer) {
                            timer = new Date().getTime() + options.interval;
                            callback(progress);
                        }
                    });
                }

                // on read finished
                read.on('end', () => {
                    // get hash
                    this.hash = hash.read();

                    // get hashdate
                    this.hashdate = new Date().toISOString();

                    resolve(this);
                });

            } catch (error) { reject(error); }
        })
    }

    /**
     * Compare the current Hash to another HashInterface
     * @param target HashInterface - the original file to compare to
     */
    public compare(target?: HashInterface): HashStatus {
        target = (target) ? target : this._target;
        if (!target) throw new Error("No target file");

        if (this.hash == target.hash) return "match";
        if (target.filedate && target.filedate != this.filedate) return "outdated";
        return "different";
    }
}
