'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Search, Filter, AlertCircle, CheckCircle, Clock, LayoutGrid, List } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ReportKanbanBoard } from '@/components/reports/report-kanban-board';

export default function IncomingReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await api.reports.getCompanyReports();
                setReports(data);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
                toast.error('Failed to load reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.reportNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter ? report.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'LOW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-100 text-blue-800';
            case 'TRIAGED': return 'bg-purple-100 text-purple-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Incoming Reports</h2>
                <p className="text-muted-foreground">Triage and manage vulnerability reports</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter Status
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setStatusFilter(null)}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('NEW')}>New</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('TRIAGED')}>Triaged</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('RESOLVED')}>Resolved</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* View Toggle */}
                <div className="flex gap-1 border rounded-md p-1">
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="gap-2"
                    >
                        <List className="h-4 w-4" />
                        List
                    </Button>
                    <Button
                        variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('board')}
                        className="gap-2"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Board
                    </Button>
                </div>
            </div>


            {/* Conditional View Rendering */}
            {viewMode === 'board' ? (
                <ReportKanbanBoard reports={filteredReports} />
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Report ID</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Researcher</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                                </TableRow>
                            ) : filteredReports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No reports found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-mono text-xs">{report.reportNumber}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`border-0 ${getSeverityColor(report.severity)}`}>
                                                {report.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate" title={report.title}>
                                            {report.title}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{report.program.programName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs overflow-hidden">
                                                    {report.researcher.profilePictureUrl ? (
                                                        <img src={report.researcher.profilePictureUrl} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        report.researcher.username[0].toUpperCase()
                                                    )}
                                                </div>
                                                <span className="text-sm">{report.researcher.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`border-0 ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(report.submittedDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/company/reports/${report.id}`}>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}
