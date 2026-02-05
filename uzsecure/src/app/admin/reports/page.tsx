'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileText, Search, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Report {
    id: string;
    reportNumber: string;
    title: string;
    status: string;
    severity: string;
    createdAt: string;
    researcher: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
    };
    program: {
        id: string;
        programName: string;
        company: {
            companyName: string;
        };
    };
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [severityFilter, setSeverityFilter] = useState<string>('ALL');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    useEffect(() => {
        fetchReports();
    }, [searchQuery, statusFilter, severityFilter, pagination.page]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const filters: any = {
                page: pagination.page,
                limit: pagination.limit,
            };

            if (searchQuery) filters.search = searchQuery;
            if (statusFilter && statusFilter !== 'ALL') filters.status = statusFilter;
            if (severityFilter && severityFilter !== 'ALL') filters.severity = severityFilter;

            const data = await api.admin.getAllReports(filters);
            setReports(data.reports);
            setPagination(data.pagination);
        } catch (error: any) {
            console.error('Failed to fetch reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityBadge = (severity: string) => {
        const colors = {
            CRITICAL: 'bg-red-100 text-red-800',
            HIGH: 'bg-orange-100 text-orange-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            LOW: 'bg-blue-100 text-blue-800',
            INFO: 'bg-gray-100 text-gray-800',
        };
        return (
            <Badge variant="secondary" className={colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
                {severity}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            NEW: 'bg-blue-100 text-blue-800',
            TRIAGED: 'bg-purple-100 text-purple-800',
            ACCEPTED: 'bg-green-100 text-green-800',
            NEEDS_MORE_INFO: 'bg-yellow-100 text-yellow-800',
            RESOLVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
        };
        return (
            <Badge variant="secondary" className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
                {status.replace(/_/g, ' ')}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Report Moderation</h1>
                <p className="text-muted-foreground mt-1">
                    Global view of all vulnerability reports
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Report ID, title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="NEW">New</SelectItem>
                                    <SelectItem value="TRIAGED">Triaged</SelectItem>
                                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                    <SelectItem value="NEEDS_MORE_INFO">Needs More Info</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Severity</Label>
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Severities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Severities</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="INFO">Info</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Reports ({pagination.total})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No reports found</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Report ID</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Researcher</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-mono text-sm">
                                                {report.reportNumber}
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <p className="font-medium truncate">{report.title}</p>
                                            </TableCell>
                                            <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {report.program.programName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {report.program.company.companyName}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">
                                                    {report.researcher.firstName} {report.researcher.lastName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    @{report.researcher.username}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(report.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/admin/reports/${report.id}`}>
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Page {pagination.page} of {pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page === 1}
                                        onClick={() =>
                                            setPagination({ ...pagination, page: pagination.page - 1 })
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() =>
                                            setPagination({ ...pagination, page: pagination.page + 1 })
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
