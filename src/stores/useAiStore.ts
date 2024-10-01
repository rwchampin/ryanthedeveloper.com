import { create } from 'zustand';

import {
    getAssistants,

} from '@/app/actions';
// import openai type

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
}
interface Thread {
    id: string;
    name: string;
}

interface Assistant {
    id: string;
    name: string;
    model: string;
    tools: any[];
}

interface AIState {
    assistants: Assistant[];
    activeAssistant: number | string | null;
 
    threads: Thread[];
    activeThread: Thread | null;
    messages: Message[];
    inputMessage: string;
    loading: boolean;
    error: string | null;


    setActiveAssistant: (assistantId: any) => void;
 
    createThread: (chatId: string, name: string) => Promise<void>;
    setActiveThread: (threadId: string) => void;
    sendMessage: (content: string) => Promise<void>;
    getMessages: (threadId: string) => Promise<void>;

    handleThreadRunStepCancelled: () => void;
    handleMessageInProgress: () => void;
    handleMessageIncomplete: () => void;
    handleMessageCompleted: () => void;
    handleMessageError: (error: string) => void;
    handleMessageStreamEnd: () => void;
}

export const useAiStore = create<AIState>((set, get) => ({
    assistants: [],
    activeAssistant: null,
 
    threads: [],
    activeThread: null,
    messages: [],
    inputMessage: '',
    loading: false,
    error: null,
  

    setActiveAssistant: (assistantId: string) => {
        if (!assistantId) {
            const assistant = get().assistants.find(a => a.name === 'JARVIS');
            set({ activeAssistant: assistant.id || null });
            return
        }
        const assistant = get().assistants.find(a => a.id === assistantId);
        set({ activeAssistant: assistant.id || null });
    },


    createThread: async (chatId: string, name: string) => {
        set({ loading: true, error: null });
        try {
            const thread = await openai.beta.threads.create({ chatId, name });
            set(state => ({ threads: [...state.threads, thread] }));
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    setActiveThread: (threadId: string) => {
        const thread = get().threads.find(t => t.id === threadId);
        set({ activeThread: thread || null });
    },

    sendMessage: async (content: string) => {
        set({ loading: true, error: null });
        try {
            const { activeAssistant, activeThread } = get();
            if (!activeAssistant) throw new Error('No active assistant selected');
            if (!activeThread) throw new Error('No active thread selected');
            const message = await openai.beta.messages.create({
                content,
                assistantId: activeAssistant.id,
                threadId: activeThread.id,
            });
            set(state => ({ messages: [...state.messages, message] }));
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    getMessages: async (threadId: string) => {
        set({ loading: true, error: null });
        try {
            const messages = await openai.beta.messages.list({ threadId });
            set({ messages });
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    handleThreadRunStepCancelled: () => {
        console.log('Thread run step cancelled');
        // Handle the cancellation logic here
    },

    handleMessageInProgress: () => {
        console.log('Message in progress');
        // Handle the in-progress logic here
    },

    handleMessageIncomplete: () => {
        console.log('Message incomplete');
        // Handle the incomplete message logic here
    },

    handleMessageCompleted: () => {
        console.log('Message completed');
        // Handle the completed message logic here
    },

    handleMessageError: (error: string) => {
        console.error('Message error:', error);
        set({ error });
        // Handle the error logic here
    },

    handleMessageStreamEnd: () => {
        console.log('Message stream ended');
        // Handle the stream end logic here
    },
}));