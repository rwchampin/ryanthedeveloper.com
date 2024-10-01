import fs from 'fs/promises';
import path from 'path';
import { createClient } from 'utils/supabase/server';
import { VectorStoreManager } from './VectorStoreManager';

interface VectorFile {
    id: string;
    filename: string;
    vectorIds: string[];
    metadata?: Record<string, any>;
}
const supabase = createClient();
export class VectorFileManager {
    private logger: Console
    private vectorStoreManager: VectorStoreManager;
    private fileStoragePath: string;

    constructor() {
        this.logger = console;
        this.fileStoragePath = fileStoragePath;
    }

    async saveVectorFile(file: Buffer, filename: string, metadata?: Record<string, any>): Promise<VectorFile> {
        try {
            const fileId = `file_${Date.now()}`;
            const filePath = path.join(this.fileStoragePath, fileId);
            await fs.writeFile(filePath, file);

            const text = file.toString('utf-8');
            const embedding = await this.vectorStoreManager.createEmbedding(text);
            const vectorId = `vec_${Date.now()}`;
            await this.vectorStoreManager.addVector({ id: vectorId, values: embedding, metadata });

            const vectorFile: VectorFile = {
                id: fileId,
                filename,
                vectorIds: [vectorId],
                metadata,
            };

            this.logger.info(`Saved vector file: ${fileId}`);
            return vectorFile;
        } catch (error: any) {
            this.logger.error(`Error saving vector file: ${error.message}`);
            throw error;
        }
    }

    async getVectorFile(fileId: string): Promise<Buffer> {
        try {
            const filePath = path.join(this.fileStoragePath, fileId);
            const file = await fs.readFile(filePath);
            this.logger.info(`Retrieved vector file: ${fileId}`);
            return file;
        } catch (error) {
            this.logger.error(`Error retrieving vector file ${fileId}: ${error.message}`);
            throw error;
        }
    }

    async deleteVectorFile(fileId: string): Promise<void> {
        try {
            const filePath = path.join(this.fileStoragePath, fileId);
            await fs.unlink(filePath);
            this.logger.info(`Deleted vector file: ${fileId}`);
        } catch (error) {
            this.logger.error(`Error deleting vector file ${fileId}: ${error.message}`);
            throw error;
        }
    }

    async updateVectorFileMetadata(fileId: string, newMetadata: Record<string, any>): Promise<void> {
        try {
            // Assume we have a method to update metadata in the database
            await this.db.updateVectorFileMetadata(fileId, newMetadata);
            this.logger.info(`Updated metadata for vector file: ${fileId}`);
        } catch (error) {
            this.logger.error(`Error updating metadata for vector file ${fileId}: ${error.message}`);
            throw error;
        }
    }

    async searchSimilarFiles(queryText: string, k: number = 10): Promise<VectorFile[]> {
        try {
            const queryEmbedding = await this.vectorStoreManager.createEmbedding(queryText);
            const similarVectors = await this.vectorStoreManager.searchSimilarVectors(queryEmbedding, k);

            // Assume we have a method to get vector files by vector IDs
            const similarFiles = await this.db.getVectorFilesByVectorIds(similarVectors.map(v => v.id));

            this.logger.info(`Found ${similarFiles.length} similar files`);
            return similarFiles;
        } catch (error) {
            this.logger.error(`Error searching similar files: ${error.message}`);
            throw error;
        }
    }
}