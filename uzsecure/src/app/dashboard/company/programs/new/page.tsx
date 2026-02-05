'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const programSchema = z.object({
    programName: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    programType: z.enum(['PUBLIC', 'PRIVATE', 'INVITE_ONLY']),
    targetTypes: z.string().min(1, 'At least one target type is required'),
    vulnerabilityTypes: z.string().min(1, 'At least one vulnerability type is required'),
    minimumPayout: z.coerce.number().min(0),
    maximumPayout: z.coerce.number().min(0),
    scope: z.string().min(10, 'Please define the scope'), // JSON string for now or simple text? DTO expects JSON.
    // Simplifying scope to just a text description that we'll wrap in an object for now, or use a proper JSON editor.
    // Let's assume text description for MVP and wrap it.
    rulesAndGuidelines: z.string().optional(),
    safeHarborPolicy: z.string().optional(),
});

type ProgramFormValues = z.infer<typeof programSchema>;

export default function CreateProgramPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<any>({
        resolver: zodResolver(programSchema),
        defaultValues: {
            programName: '',
            description: '',
            programType: 'PUBLIC',
            targetTypes: '',
            vulnerabilityTypes: '',
            minimumPayout: 100,
            maximumPayout: 5000,
            scope: '',
            rulesAndGuidelines: '',
            safeHarborPolicy: '',
        } as any,
    });

    const onSubmit = async (data: ProgramFormValues) => {
        setLoading(true);
        try {
            // Transform scope text to JSON structure expected by backend
            const formattedData = {
                ...data,
                targetTypes: data.targetTypes.split(',').map(s => s.trim()).filter(Boolean),
                vulnerabilityTypes: data.vulnerabilityTypes.split(',').map(s => s.trim()).filter(Boolean),
                scope: { description: data.scope, inScope: [], outOfScope: [] }, // Simple structure
                disclosurePolicy: 'LIMITED'
            };

            await api.programs.create(formattedData);
            toast.success('Program created successfully!');
            router.push('/dashboard/company/programs');
        } catch (error) {
            console.error('Failed to create program:', error);
            toast.error('Failed to create program. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create New Program</h2>
                <p className="text-muted-foreground">Launch a new bug bounty program for your assets.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Program Details</CardTitle>
                    <CardDescription>Define the scope and rewards for researchers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="programName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Program Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Acme Corp Web Bounty" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="programType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visibility</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select visibility" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PUBLIC">Public (Visible to everyone)</SelectItem>
                                                <SelectItem value="PRIVATE">Private (Invite only)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe your program..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="minimumPayout"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Min Payout ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maximumPayout"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Payout ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="targetTypes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset Types (comma separated)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Web, Mobile, API, IoT" {...field} />
                                        </FormControl>
                                        <FormDescription>e.g. Web, API, Mobile</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vulnerabilityTypes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vulnerability Types (comma separated)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="XSS, SQLi, RCE" {...field} />
                                        </FormControl>
                                        <FormDescription>List types you are interested in.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="scope"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Scope Definition</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="List the domains or assets in scope..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Program'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
