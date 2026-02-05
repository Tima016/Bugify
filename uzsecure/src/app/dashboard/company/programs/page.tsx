'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Program } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function MyProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPrograms = async () => {
        try {
            const data = await api.programs.getMyPrograms();
            setPrograms(data);
        } catch (error) {
            console.error('Failed to fetch programs:', error);
            toast.error('Failed to load programs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    const filteredPrograms = programs.filter(p =>
        p.programName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading programs...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Programs</h2>
                    <p className="text-muted-foreground">Manage your bug bounty programs</p>
                </div>
                <Link href="/dashboard/company/programs/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Program
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search programs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="grid gap-6">
                {filteredPrograms.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Plus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No programs found</h3>
                            <p className="text-muted-foreground max-w-sm mt-2 mb-4">
                                You haven&apos;t created any programs yet, or no programs match your search.
                            </p>
                            <Link href="/dashboard/company/programs/new">
                                <Button variant="outline">Create Program</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    filteredPrograms.map((program) => (
                        <Card key={program.id} className="overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{program.programName}</h3>
                                            <Badge variant={program.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                {program.status}
                                            </Badge>
                                            <Badge variant="outline">{program.programType}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-2xl">
                                            {program.description}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <Link href={`/programs/${program.slug}`}>
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4" /> View Public Page
                                                </DropdownMenuItem>
                                            </Link>
                                            <Link href={`/dashboard/company/programs/${program.id}/edit`}>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Program
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Total Reports</p>
                                        <p className="font-medium">{program.totalReportsReceived || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Valid Reports</p>
                                        <p className="font-medium">{program.totalValidReports || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Paid Out</p>
                                        <p className="font-medium text-green-600">${Number(program.totalPaidOut).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Avg. Triage</p>
                                        <p className="font-medium">{program.averageTriageTime || 0} hrs</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
