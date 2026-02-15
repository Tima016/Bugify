'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api-client';
import { Report } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Shield,
    AlertTriangle,
    CheckCircle,
    FileText,
    MessageSquare,
    Link as LinkIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getSeverityColor } from '@/lib/utils';
import Link from 'next/link';
import { CommentsSection } from '@/components/dashboard/comments-section';

export default function ReportDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchReport = async () => {
            try {
                const data = await api.reports.getById(id);
                setReport(data);
            } catch (err: any) {
                console.error('Failed to fetch report:', err);
                setError(err.response?.data?.message || 'Failed to load report details');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-destructive font-medium">{error || 'Report not found'}</p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'TRIAGED': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'RESOLVED': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'CLOSED': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in-50">
            {/* Header / Nav */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/dashboard/reports" className="hover:text-primary transition-colors">
                    My Reports
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">#{report.id.substring(0, 8)}</span>
            </div>

            {/* Title Section */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{report.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            {report.program?.programName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {report.createdAt ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true }) : 'Just now'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`border ${getStatusColor(report.status)}`}>
                        {report.status}
                    </Badge>
                    {/* Placeholder for future specific actions like "Request Update" */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-primary" />
                                Vulnerability Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                                    <p className="font-medium mt-1">{report.vulnerabilityType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Severity</label>
                                    <div className="mt-1">
                                        <Badge className={`${getSeverityColor(report.severity)} text-white border-0`}>
                                            {report.severity}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-medium mb-2">Description</h3>
                                <div className="prose dark:prose-invert max-w-none text-sm bg-muted/30 p-4 rounded-lg">
                                    <p className="whitespace-pre-wrap">{report.description}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Impact</h3>
                                <div className="prose dark:prose-invert max-w-none text-sm bg-muted/30 p-4 rounded-lg">
                                    <p className="whitespace-pre-wrap">{report.impact}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Reproduction Steps</h3>
                                <div className="prose dark:prose-invert max-w-none text-sm bg-muted/30 p-4 rounded-lg">
                                    <p className="whitespace-pre-wrap">{report.reproductionSteps}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Comments Section */}
                    <div className="h-full">
                        <CommentsSection reportId={report.id} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Report ID</span>
                                <span className="font-mono">{report.id.substring(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Created</span>
                                <span>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span>{report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            {report.bountyAmount && (
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">Bounty Awarded</span>
                                    <span className="text-green-500 font-bold">${report.bountyAmount}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Attachments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Simplified attachments view (assuming future array of urls) */}
                            <div className="text-sm text-muted-foreground italic">
                                No attachments.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
