import React, { useEffect } from 'react';
import { useAiStore } from '@/stores/useAiStore';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

export const AssistantSelector = () => {
    const assistants = useAiStore((state) => state.assistants);
    const activeAssistant = useAiStore((state) => state.activeAssistant);
    const setActiveAssistant = useAiStore((state) => state.setActiveAssistant);

    const handleChange = (assistantId: string) => {
        setActiveAssistant(assistantId);
    };

    return (
        <div className='w-full p-5 rounded-lg bg-white flex-none'>
            <Select onValueChange={handleChange} value={activeAssistant?.id || ''}>
                <SelectTrigger className="w-full">
                    {activeAssistant ? activeAssistant.name : 'Select an assistant'}
                </SelectTrigger>
                <SelectContent>
                    {assistants.map((assistant) => (
                        <SelectItem key={assistant.id} value={assistant.id}>
                            {assistant.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};