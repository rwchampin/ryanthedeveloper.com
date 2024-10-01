import { openai } from 'utils/openai';
import { createClient } from 'utils/supabase/server';
interface Vector {
    id: string;
    values: number[];
    metadata?: Record<string, any>;
}
const supabase = createClient();
export class VectorStoreManager {
    private db: ReturnType<typeof createClient>;
    private openai: typeof openai;
    private logger: Console;

    constructor() {
        this.db = supabase;
        this.openai = openai;
        this.logger = console;
    }

    async addVector(vector: Vector): Promise<void> {
        try {
            await this.db.addVector(vector);
            this.logger.info(`Added vector: ${vector.id}`);
        } catch (error: any) {
            this.logger.error(`Error adding vector ${vector.id}: ${error.message}`);
            throw error;
        }
    }

    async getVector(id: string): Promise<Vector | null> {
        try {
            const vector = await this.db.getVector(id);
            if (vector) {
                this.logger.info(`Retrieved vector: ${id}`);
                return vector;
            }
            this.logger.info(`No vector found with ID: ${id}`);
            return null;
        } catch (error: any) {
            this.logger.error(`Error retrieving vector ${id}: ${error.message}`);
            throw error;
        }
    }

    async updateVector(id: string, newValues: number[], newMetadata?: Record<string, any>): Promise<void> {
        try {
            await this.db.updateVector(id, newValues, newMetadata);
            this.logger.info(`Updated vector: ${id}`);
        } catch (error: any) {
            this.logger.error(`Error updating vector ${id}: ${error.message}`);
            throw error;
        }
    }

    async deleteVector(id: string): Promise<void> {
        try {
            await this.db.deleteVector(id);
            this.logger.info(`Deleted vector: ${id}`);
        } catch (error: any) {
            this.logger.error(`Error deleting vector ${id}: ${error.message}`);
            throw error;
        }
    }

    async searchSimilarVectors(queryVector: number[], k: number = 10): Promise<Vector[]> {
        try {
            const similarVectors = await this.db.searchSimilarVectors(queryVector, k);
            this.logger.info(`Found ${similarVectors.length} similar vectors`);
            return similarVectors;
        } catch (error: any) {
            this.logger.error(`Error searching similar vectors: ${error.message}`);
            throw error;
        }
    }

    async bulkAddVectors(vectors: Vector[]): Promise<void> {
        try {
            await this.db.bulkAddVectors(vectors);
            this.logger.info(`Added ${vectors.length} vectors in bulk`);
        } catch (error: any) {
            this.logger.error(`Error adding vectors in bulk: ${error.message}`);
            throw error;
        }
    }

    async getVectorsByMetadata(metadata: Record<string, any>): Promise<Vector[]> {
        try {
            const vectors = await this.db.getVectorsByMetadata(metadata);
            this.logger.info(`Found ${vectors.length} vectors matching metadata`);
            return vectors;
        } catch (error: any) {
            this.logger.error(`Error getting vectors by metadata: ${error.message}`);
            throw error;
        }
    }

    async createEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: text,
            });
            this.logger.info(`Created embedding for text`);
            return response.data[0].embedding;
        } catch (error: any) {
            this.logger.error(`Error creating embedding: ${error.message}`);
            throw error;
        }
    }
}