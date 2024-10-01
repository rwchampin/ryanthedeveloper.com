import { openai } from 'utils/openai';
import { type OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

/**
 * FileManager class to manage OpenAI files
 */
export class FileManager {
    private openai: any;

    constructor() {
        this.openai = openai;
    }

    /**
     * Retrieve all files
     */
    async getAllFiles(): Promise<OpenAI.FileObject[]> {
        const response = await this.openai.files.list();
        return response.data;
    }

    /**
     * Retrieve a file by ID
     */
    async getFileById(fileId: string): Promise<OpenAI.FileObject> {
        return await this.openai.files.retrieve(fileId);
    }

    /**
     * Retrieve files by name
     */
    async getFilesByName(fileName: string): Promise<OpenAI.FileObject[]> {
        const allFiles = await this.getAllFiles();
        return allFiles.filter(file => file.filename === fileName);
    }

    /**
     * Delete all files
     */
    async deleteAllFiles(): Promise<void> {
        const allFiles = await this.getAllFiles();
        await Promise.all(allFiles.map(file => this.openai.files.del(file.id)));
    }

    /**
     * Delete a file by ID
     */
    async deleteFileById(fileId: string): Promise<any> {
        return await this.openai.files.del(fileId);
    }

    /**
     * Delete files by name
     */
    async deleteFilesByName(fileName: string): Promise<any> {
        const filesToDelete = await this.getFilesByName(fileName);
        return await Promise.all(filesToDelete.map(file => this.openai.files.del(file.id)));
    }

    /**
     * Create a file if it doesn't exist, otherwise return the existing file
     */
    async createFileIfNotExists(filePath: string, purpose: 'fine-tune' | 'assistants'): Promise<OpenAI.FileObject> {
        const fileName = path.basename(filePath);
        const existingFiles = await this.getFilesByName(fileName);

        if (existingFiles.length > 0) {
            console.log(`File ${fileName} already exists. Returning existing file.`);
            return existingFiles[0];
        }

        const file = await this.openai.files.create({
            file: fs.createReadStream(filePath),
            purpose: purpose,
        });

        console.log(`File ${fileName} created successfully.`);
        return file;
    }

    /**
     * Retrieve file content
     */
    async retrieveFileContent(fileId: string): Promise<string> {
        const response = await this.openai.files.retrieveContent(fileId);
        return response;
    }

    /**
     * Wait for file processing to complete
     */
    async waitForFileProcessing(fileId: string, maxRetries: number = 10, delayMs: number = 1000): Promise<OpenAI.FileObject> {
        let retries = 0;
        while (retries < maxRetries) {
            const file = await this.getFileById(fileId);
            if (file.status === 'processed') {
                return file;
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
            retries++;
        }
        throw new Error(`File processing did not complete after ${maxRetries} retries.`);
    }

    /**
     * Get total size of all files
     */
    async getTotalFileSize(): Promise<number> {
        const allFiles = await this.getAllFiles();
        return allFiles.reduce((total, file) => total + file.bytes, 0);
    }

    /**
     * Find files by purpose
     */
    async getFilesByPurpose(purpose: 'fine-tune' | 'assistants'): Promise<OpenAI.FileObject[]> {
        const allFiles = await this.getAllFiles();
        return allFiles.filter(file => file.purpose === purpose);
    }

    /**
     * Batch create files
     */
    async batchCreateFiles(filePaths: string[], purpose: 'fine-tune' | 'assistants'): Promise<OpenAI.FileObject[]> {
        return await Promise.all(filePaths.map(filePath => this.createFileIfNotExists(filePath, purpose)));
    }

    /**
     * Find duplicate files
     */
    async findDuplicateFiles(): Promise<{ [filename: string]: OpenAI.FileObject[] }> {
        const allFiles = await this.getAllFiles();
        const fileMap: { [filename: string]: OpenAI.FileObject[] } = {};

        allFiles.forEach(file => {
            if (!fileMap[file.filename]) {
                fileMap[file.filename] = [];
            }
            fileMap[file.filename].push(file);
        });

        return Object.fromEntries(
            Object.entries(fileMap).filter(([_, files]) => files.length > 1)
        );
    }

    /**
  * Delete file if not attached to any thread, assistant, or message
  */
    async deleteFileIfNotAttached(fileId: string): Promise<boolean> {
        try {
            // Check if file is attached to any assistant
            const assistants = await this.openai.assistants.list();
            const isAttachedToAssistant = assistants.data.some(assistant =>
                assistant.file_ids.includes(fileId)
            );
            if (isAttachedToAssistant) return false;

            // Check if file is attached to any thread
            const threads = await this.openai.threads.list();
            for (const thread of threads.data) {
                const messages = await this.openai.threads.messages.list(thread.id);
                const isAttachedToMessage = messages.data.some(message =>
                    message.file_ids.includes(fileId)
                );
                if (isAttachedToMessage) return false;
            }

            // If not attached, delete the file
            await this.deleteFileById(fileId);
            return true;
        } catch (error) {
            console.error(`Error checking and deleting file ${fileId}:`, error);
            return false;
        }
    }
}
