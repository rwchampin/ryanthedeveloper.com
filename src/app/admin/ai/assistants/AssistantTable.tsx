"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    deleteAssistant,
    getAssistants

} from '@/app/actions';
import { Table, TableBody, TableHeader, TableCell, TableHead, TableRow } from '@/components/ui/table';

 

interface Assistant {
    id: number;
    name: string;
    description: string;
}

interface AssistantTableProps {
    assistants: Assistant[];
}

export const AssistantTable = ({ w }: any) => {
    const [selected, setSelected] = useState<any[]>([]);
    const [allAssistants, setAllAssistants] = useState<any[]>(w);
    const columns = Object.keys(w[0] || {});

    if (!columns.length) {
        return null;
    }

    const selectAll = () => {
        if (selected.length === allAssistants.length) {
            setSelected([]);
        } else {
            setSelected(allAssistants.map((assistant) => assistant.id));
        }
    };

    const setRow = (id: any) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((selectedId) => selectedId !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    

    const handleDelete = async (id: any) => {
       const res =  await deleteAssistant(id);
         console.log(res);
    };

    const handleDeleteSelected = async () => {

        for (const id of selected) {
           const e = await deleteAssistant(id);
           console.log(e);
        }
        setSelected([]);

    };

    const handleDeleteAll = async () => {
        for (const assistant of allAssistants) {
            await deleteAssistant(assistant.id);
        }
        setSelected([]);
    };

    return (
        <div>
            <Button  onClick={handleDeleteSelected} disabled={selected.length === 0}>
                Delete Selected
            </Button>
            <Button  onClick={handleDeleteAll} disabled={allAssistants.length === 0}>
                Delete All
            </Button>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <Checkbox
                                checked={selected.length === allAssistants.length}
                                onCheckedChange={selectAll}
                            />
                        </TableHead>
                        {columns.map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                        ))}
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allAssistants.map((assistant) => (
                        <TableRow key={assistant.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selected.includes(assistant.id)}
                                    onCheckedChange={() => setRow(assistant.id)}
                                />
                            </TableCell>
                            {columns.map((column) => (
                                <TableCell key={column}>{assistant[column as keyof Assistant]}</TableCell>
                            ))}
                            <TableCell>
                                <Button   onClick={() => handleDelete(assistant.id)}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};