import { openai } from 'utils/openai';
import { createClient } from 'utils/supabase/server';

const supabase = createClient();

export class AssistantManager {
    private openai: typeof openai;
    private db: ReturnType<typeof createClient>;
    private logger: Console;

    constructor() {
        this.openai = openai;
        this.db = supabase;
        this.logger = console;
    }

    async getAssistant(assistantId: string): Promise<OpenAI.Assistant | null> {
        try {
            const assistant = await this.openai.beta.assistants.retrieve(assistantId);
            this.logger.info(`Retrieved assistant: ${assistantId}`);
            return assistant;
        } catch (error: any) {
            this.logger.error(`Error retrieving assistant ${assistantId}: ${error.message}`);
            return null;
        }
    }

    async getOrCreateAssistant(name: string, config: OpenAI.AssistantCreateParams): Promise<OpenAI.Assistant> {
        try {
            const existingAssistant = await this.getAssistantByName(name);
            if (existingAssistant) {
                this.logger.info(`Retrieved existing assistant: ${name}`);
                return existingAssistant;
            }

            const newAssistant = await this.openai.beta.assistants.create(config);
            this.logger.info(`Created new assistant: ${name}`);
            return newAssistant;
        } catch (error: any) {
            this.logger.error(`Error in getOrCreateAssistant for ${name}: ${error.message}`);
            throw error;
        }
    }

    // ... (other methods remain the same, just update error handling to use `error: any`)

    async saveAssistantToDB(assistant: OpenAI.Assistant): Promise<void> {
        try {
            const { error } = await this.db
                .from('assistants')
                .upsert({
                    id: assistant.id,
                    name: assistant.name,
                    created_at: assistant.created_at,
                    // Add other relevant fields
                });

            if (error) throw error;

            this.logger.info(`Saved assistant to DB: ${assistant.id}`);
        } catch (error: any) {
            this.logger.error(`Error saving assistant ${assistant.id} to DB: ${error.message}`);
            throw error;
        }
    }

    async getAssistantFromDB(assistantId: string): Promise<OpenAI.Assistant | null> {
        try {
            const { data, error } = await this.db
                .from('assistants')
                .select('*')
                .eq('id', assistantId)
                .single();

            if (error) throw error;

            if (data) {
                this.logger.info(`Retrieved assistant from DB: ${assistantId}`);
                return data as OpenAI.Assistant;
            }
            this.logger.info(`No assistant found in DB with ID: ${assistantId}`);
            return null;
        } catch (error: any) {
            this.logger.error(`Error retrieving assistant ${assistantId} from DB: ${error.message}`);
            throw error;
        }
    }

    // ... (other methods remain the same)
}