import { OpenAI } from 'openai';
import { Database } from './Database';
import { Logger } from './Logger';
import { AIAssistantManager } from './AIAssistantManager';

export class ThreadManager {
    private openai: OpenAI;
    private db: Database;
    private logger: Logger;
    private assistantManager: AIAssistantManager;

    constructor(apiKey: string, db: Database, logger: Logger, assistantManager: AIAssistantManager) {
        this.openai = new OpenAI({ apiKey });
        this.db = db;
        this.logger = logger;
        this.assistantManager = assistantManager;
    }

    async createThread(initialMessage?: string): Promise<OpenAI.Thread> {
        try {
            const thread = await this.openai.beta.threads.create(initialMessage ? { messages: [{ role: 'user', content: initialMessage }] } : {});
            this.logger.info(`Created new thread: ${thread.id}`);
            return thread;
        } catch (error) {
            this.logger.error(`Error creating thread: ${error.message}`);
            throw error;
        }
    }

    async getThread(threadId: string): Promise<OpenAI.Thread> {
        try {
            const thread = await this.openai.beta.threads.retrieve(threadId);
            this.logger.info(`Retrieved thread: ${threadId}`);
            return thread;
        } catch (error) {
            this.logger.error(`Error retrieving thread ${threadId}: ${error.message}`);
            throw error;
        }
    }

    async deleteThread(threadId: string): Promise<boolean> {
        try {
            await this.openai.beta.threads.del(threadId);
            this.logger.info(`Deleted thread: ${threadId}`);
            return true;
        } catch (error) {
            this.logger.error(`Error deleting thread ${threadId}: ${error.message}`);
            return false;
        }
    }

    async getAllThreads(): Promise<OpenAI.Thread[]> {
        try {
            const response = await this.openai.beta.threads.list();
            this.logger.info(`Retrieved ${response.data.length} threads`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error retrieving all threads: ${error.message}`);
            throw error;
        }
    }

    async getThreadsByAssistant(assistantId: string): Promise<OpenAI.Thread[]> {
        try {
            const allThreads = await this.getAllThreads();
            const filteredThreads = allThreads.filter(thread =>
                thread.metadata && thread.metadata.assistant_id === assistantId
            );
            this.logger.info(`Retrieved ${filteredThreads.length} threads for assistant ${assistantId}`);
            return filteredThreads;
        } catch (error) {
            this.logger.error(`Error retrieving threads for assistant ${assistantId}: ${error.message}`);
            throw error;
        }
    }

    async addMessageToThread(threadId: string, content: string, role: 'user' | 'assistant' = 'user'): Promise<OpenAI.ThreadMessage> {
        try {
            const message = await this.openai.beta.threads.messages.create(threadId, { role, content });
            this.logger.info(`Added message to thread ${threadId}`);
            return message;
        } catch (error) {
            this.logger.error(`Error adding message to thread ${threadId}: ${error.message}`);
            throw error;
        }
    }

    async runThread(threadId: string, assistantId: string, instructions?: string): Promise<OpenAI.Run> {
        try {
            const run = await this.openai.beta.threads.runs.create(threadId, {
                assistant_id: assistantId,
                instructions
            });
            this.logger.info(`Started run for thread ${threadId} with assistant ${assistantId}`);
            return run;
        } catch (error) {
            this.logger.error(`Error running thread ${threadId} with assistant ${assistantId}: ${error.message}`);
            throw error;
        }
    }

    async getRunStatus(threadId: string, runId: string): Promise<OpenAI.Run> {
        try {
            const run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
            this.logger.info(`Retrieved run status for thread ${threadId}, run ${runId}: ${run.status}`);
            return run;
        } catch (error) {
            this.logger.error(`Error retrieving run status for thread ${threadId}, run ${runId}: ${error.message}`);
            throw error;
        }
    }

    async saveThreadToDB(thread: OpenAI.Thread): Promise<void> {
        try {
            await this.db.saveThread(thread);
            this.logger.info(`Saved thread to DB: ${thread.id}`);
        } catch (error) {
            this.logger.error(`Error saving thread ${thread.id} to DB: ${error.message}`);
            throw error;
        }
    }

    async getThreadFromDB(threadId: string): Promise<OpenAI.Thread | null> {
        try {
            const thread = await this.db.getThread(threadId);
            if (thread) {
                this.logger.info(`Retrieved thread from DB: ${threadId}`);
                return thread;
            }
            this.logger.info(`No thread found in DB with ID: ${threadId}`);
            return null;
        } catch (error) {
            this.logger.error(`Error retrieving thread ${threadId} from DB: ${error.message}`);
            throw error;
        }
    }
}