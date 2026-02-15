'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const programSchema = z.object({
    programName: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    programType: z.enum(['PUBLIC', 'PRIVATE', 'INVITE_ONLY']),
    status: z.enum(['ACTIVE', 'PAUSED', 'CLOSED']),
    targetTypes: z.string().min(1, 'At least one target type is required'),
    vulnerabilityTypes: z.string().min(1, 'At least one vulnerability type is required'),
    minimumPayout: z.coerce.number().min(0),
    maximumPayout: z.coerce.number().min(0),
    scope: z.string().min(10, 'Please define the scope'),
    rulesAndGuidelines: z.string().optional(),
    safeHarborPolicy: z.string().optional(),
});

type ProgramFormValues = z.infer<typeof programSchema>;

export default function EditProgramPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm<ProgramFormValues>({
        resolver: zodResolver(programSchema) as any,
        defaultValues: {
            // Defaults will be overridden by reset()
            programName: '',
            description: '',
            programType: 'PUBLIC',
            status: 'ACTIVE',
            targetTypes: '',
            vulnerabilityTypes: '',
            minimumPayout: 0,
            maximumPayout: 0,
            scope: '',
            rulesAndGuidelines: '',
            safeHarborPolicy: '',
        },
    });

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                // We need to fetch by ID. The API client has getBySlug but checking if update needs ID.
                // Assuming we can use getStats logic or need a getById endpoint.
                // Or if getBySlug accepts ID.
                // Let's assume we implement/use getBySlug for now but maybe we need getById.
                // Wait, api-client has getStats(id) but getBySlug(slug).
                // Let's check api-client again or assume we can fetch by slug if params.id is actually a slug?
                // The folder is [id], so it's likely an ID.
                // Check ProgramsController: @Get(':slug') findOne(@Param('slug') slug: string).
                // It treats the param as a slug.
                // IF the param IS the ID, we might need a dedicated ID endpoint or ensure findOne handles IDs too.
                // BUT, MyProgramsPage links to `/dashboard/company/programs/${program.id}/edit`.
                // So it passes an ID.
                // Backend `findOne` searches by `slug`.
                // We might need to update Controller to search by ID or Slug, OR add `getById`.

                // Let's try to fetch using the existing list and filtering (inefficient but works without backend change for now)
                // OR better: use `getMyPrograms` and find it.
                const programs = await api.programs.getMyPrograms();
                const program = programs.find(p => p.id === params.id);

                if (!program) {
                    toast.error('Program not found');
                    router.push('/dashboard/company/programs');
                    return;
                }

                // Populate form
                form.reset({
                    programName: program.programName,
                    description: program.description,
                    programType: program.programType as any,
                    status: program.status as any,
                    targetTypes: program.targetTypes.join(', '),
                    vulnerabilityTypes: program.vulnerabilityTypes.join(', '),
                    minimumPayout: Number(program.minimumPayout),
                    maximumPayout: Number(program.maximumPayout),
                    scope: typeof program.scope === 'string' ? program.scope : (program.scope as any).description || JSON.stringify(program.scope),
                    rulesAndGuidelines: (program as any).rulesAndGuidelines || '',
                    safeHarborPolicy: (program as any).safeHarborPolicy || '',
                });
            } catch (error) {
                console.error('Failed to load program:', error);
                toast.error('Failed to load program details');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProgram();
        }
    }, [params.id, form, router]);

    const onSubmit = async (data: ProgramFormValues) => {
        setSaving(true);
        try {
            const formattedData = {
                ...data,
                targetTypes: data.targetTypes.split(',').map(s => s.trim()).filter(Boolean),
                vulnerabilityTypes: data.vulnerabilityTypes.split(',').map(s => s.trim()).filter(Boolean),
                scope: { description: data.scope, inScope: [], outOfScope: [] },
                disclosurePolicy: 'LIMITED'
            };

            await api.programs.update(params.id as string, formattedData);
            toast.success('Program updated successfully!');
            router.push('/dashboard/company/programs');
        } catch (error) {
            console.error('Failed to update program:', error);
            toast.error('Failed to update program. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading program details...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Edit Program</h2>
                <p className="text-muted-foreground">Update your program details and settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Program Configuration</CardTitle>
                    <CardDescription>Make changes to your bug bounty program.</CardDescription>
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
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
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
                                                    <SelectItem value="PUBLIC">Public</SelectItem>
                                                    <SelectItem value="PRIVATE">Private</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                                    <SelectItem value="PAUSED">Paused</SelectItem>
                                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-[100px]" {...field} />
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
                                            <Input {...field} />
                                        </FormControl>
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
                                            <Input {...field} />
                                        </FormControl>
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
                                            <Textarea className="min-h-[120px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
