'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Search, Filter } from 'lucide-react';

interface Report {
    id: string;
    reportNumber: string;
    title: string;
    severity: string;
    status: string;
    bountyAmount: string | null;
    submittedDate: string;
    program: {
        programName: string;
        slug: string;
        company: {
            companyName: string;
            logoUrl: string;
        };
    };
}

export default function MyReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [severityFilter, setSeverityFilter] = useState('ALL');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await api.reports.getMyReports();
                setReports(data);
                setFilteredReports(data);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    useEffect(() => {
        let filtered = reports;

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (report) =>
                    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    report.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    report.program.programName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter((report) => report.status === statusFilter);
        }

        // Apply severity filter
        if (severityFilter !== 'ALL') {
            filtered = filtered.filter((report) => report.severity === severityFilter);
        }

        setFilteredReports(filtered);
    }, [searchQuery, statusFilter, severityFilter, reports]);

    const getSeverityColor = (severity: string) => {
        const colors: Record<string, string> = {
            CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        };
        return colors[severity] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            TRIAGED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            RESOLVED: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
            DUPLICATE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">My Reports</h2>
                    <p className="text-muted-foreground">
                        {filteredReports.length} of {reports.length} reports
                    </p>
                </div>
                <Link href="/programs">
                    <Button>
                        Submit New Report
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="NEW">New</option>
                            <option value="TRIAGED">Triaged</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="DUPLICATE">Duplicate</option>
                            <option value="CLOSED">Closed</option>
                        </select>

                        {/* Severity Filter */}
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        >
                            <option value="ALL">All Severities</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {reports.length === 0
                                    ? 'No reports yet. Start by browsing programs!'
                                    : 'No reports match your filters'}
                            </p>
                            {reports.length === 0 && (
                                <Link href="/programs">
                                    <Button className="mt-4">
                                        Browse Programs
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredReports.map((report) => (
                        <Link
                            key={report.id}
                            href={`/dashboard/reports/${report.id}`}
                            className="block"
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-mono text-sm text-muted-foreground">
                                                    {report.reportNumber}
                                                </span>
                                                <Badge className={getSeverityColor(report.severity)}>
                                                    {report.severity}
                                                </Badge>
                                                <Badge className={getStatusColor(report.status)}>
                                                    {report.status}
                                                </Badge>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{report.program.company.companyName}</span>
                                                <span>•</span>
                                                <span>{report.program.programName}</span>
                                                <span>•</span>
                                                <span>{new Date(report.submittedDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {report.bountyAmount && (
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">
                                                    ${parseFloat(report.bountyAmount).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Bounty</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
