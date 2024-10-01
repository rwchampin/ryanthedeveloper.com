import { openai } from '../utils/openai';
import fs from "fs";
import { tmpdir } from 'os';
import { join } from 'path';

export class AIManager {
    openai: any
    constructor() {
        this.openai = openai;
    }

    /*
    turn files into buffers
    */
    async sfilesToBuffers(files: File[]): Promise<Buffer[]> {
        const buffers = await Promise.all(files.map(file => file.arrayBuffer().then(buffer => Buffer.from(buffer))));
        return buffers;
    }

    async buffersToFiles(buffers: Buffer[]): Promise<any[]> {
        const tempDir = tmpdir();

        const files = await Promise.all(buffers.map(async (buffer, index) => {
            const tempFilePath = join(tempDir, `tempfile_${index}.jsonl`);
            await fs.writeFile(tempFilePath, buffer);

            const file = await openai.files.create({
                file: fs.createReadStream(tempFilePath),
                purpose: "fine-tune",
            });

            // Optionally, you can delete the temp file after uploading
            await fs.unlink(tempFilePath);

            return file;
        }));

        return files;
    }
}