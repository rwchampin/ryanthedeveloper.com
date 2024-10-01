import { OpenAI } from 'openai';
import { Database } from './Database';
import { Logger } from './Logger';
import { ThreadManager } from './ThreadManager';

export class MessageManager {
    private openai: OpenAI;
    private db: Database;
    private logger: Logger;
    private threadManager: ThreadManager;

    constructor(apiKey: string, db: Database, logger: Logger, threadManager: ThreadManager) {
        this.openai = new OpenAI({ apiKey });
        this.db = db;
        this.logger = logger;
        this.threadManager = threadManager;
    }

    async createMessage(threadId: string, content: string, role: 'user' | 'assistant' = 'user'): Promise<OpenAI.ThreadMessage> {
        try {
            const message = await this.openai.beta.threads.messages.create(threadId, { role, content });
            this.logger.info(`Created message in thread ${threadId}`);
            return message;
        } catch (error) {
            this.logger.error(`Error creating message in thread ${threadId}: ${error.message}`);
            throw error;
        }
    }

    async getMessage(threadId: string, messageId: string): Promise<OpenAI.ThreadMessage> {
        try {
            const message = await this.openai.beta.threads.messages.retrieve(threadId, messageId);
            this.logger.info(`Retrieved message ${messageId} from thread ${threadId}`);
            return message;
        } catch (error) {
            this.logger.error(`Error retrieving message ${messageId} from thread ${threadId}: ${error.message}`);
            throw error;
        }
    }

    async updateMessage(threadId: string, messageId: string, content: string): Promise<OpenAI.ThreadMessage> {
        try {
            const message = await this.openai.beta.threads.messages.update(threadId, messageId, { content });
            this.logger.info(`Updated message ${messageId} in thread ${threadId}`);
            return message;
        } catch (error) {
            this.logger.error(`Error updating message ${messageId} in thread ${threadId}: ${error.message}`);
            throw error;
        }
    }

    async deleteMessage(threadId: string, messageId: string): Promise<boolean> {
        try {
            await this.openai.beta.threads.messages.del(threadId, messageId);
            this.logger.info(`Deleted message ${messageId} from thread ${threadId}`);
            return true;
        } catch (error) {
            this.logger.error(`Error deleting message ${messageId} from thread ${threadId}: ${error.message}`);
            return false;
        }
    }

    async getAllMessagesInThread(threadId: string): Promise<OpenAI.ThreadMessage[]> {
        try {
            const response = await this.openai.beta.threads.messages.list(threadId);
            this.logger.info(`Retrieved ${response.data.length} messages from thread ${threadId}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error retrieving messages from thread ${threadId}: ${error.message}`);
            throw error;
        }
    }

    async getMessagesByAssistant(assistantId: string): Promise<OpenAI.ThreadMessage[]> {
        try {
            const threads = await this.threadManager.getThreadsByAssistant(assistantId);
            let messages: OpenAI.ThreadMessage[] = [];
            for (const thread of threads) {
                const threadMessages = await this.getAllMessagesInThread(thread.id);
                messages = messages.concat(threadMessages);
            }
            this.logger.info(`Retrieved ${messages.length} messages for assistant ${assistantId}`);
            return messages;
        } catch (error) {
            this.logger.error(`Error retrieving messages for assistant ${assistantId}: ${error.message}`);
            throw error;
        }
    }

    async addFileToMessage(threadId: string, messageId: string, fileId: string): Promise<OpenAI.ThreadMessage> {
        try {
            const message = await this.openai.beta.threads.messages.update(threadId, messageId, {
                file_ids: [fileId]
            });
            this.logger.info(`Added file ${fileId} to message ${messageId} in thread ${threadId}`);
            return message;
        } catch (error) {
            this.logger.error(`Error adding file ${fileId} to message ${messageId} in thread ${threadId}: ${error.message}`);
            throw error;
        }
    }

    async saveMessageToDB(message: OpenAI.ThreadMessage): Promise<void> {
        try {
            await this.db.saveMessage(message);
            this.logger.info(`Saved message to DB: ${message.id}`);
        } catch (error) {
            this.logger.error(`Error saving message ${message.id} to DB: ${error.message}`);
            throw error;
        }
    }

    async getMessageFromDB(messageId: string): Promise<OpenAI.ThreadMessage | null> {
        try {
            const message = await this.db.getMessage(messageId);
            if (message) {
                this.logger.info(`Retrieved message from DB: ${messageId}`);
                return message;
            }
            this.logger.info(`No message found in DB with ID: ${messageId}`);
            return null;
        } catch (error) {
            this.logger.error(`Error retrieving message ${messageId} from DB: ${error.message}`);
            throw error;
        }
    }
}