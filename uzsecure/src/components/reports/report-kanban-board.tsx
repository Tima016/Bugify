'use client';

import { Report } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ReportKanbanBoardProps {
    reports: Report[];
}

const statusColumns = [
    { key: 'NEW', label: 'New', icon: AlertCircle, color: 'text-red-500' },
    { key: 'TRIAGED', label: 'Triaged', icon: Clock, color: 'text-yellow-500' },
    { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2, color: 'text-blue-500' },
    { key: 'RESOLVED', label: 'Resolved', icon: CheckCircle2, color: 'text-green-500' },
];

const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    INFORMATIONAL: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function ReportKanbanBoard({ reports }: ReportKanbanBoardProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusColumns.map((column) => {
                const columnReports = reports.filter((r) => r.status === column.key);
                const Icon = column.icon;

                return (
                    <div key={column.key} className="flex flex-col">
                        <div className="mb-4 flex items-center gap-2">
                            <Icon className={`h-5 w-5 ${column.color}`} />
                            <h3 className="font-semibold text-lg">{column.label}</h3>
                            <Badge className="secondary ml-auto">
                                {columnReports.length}
                            </Badge>
                        </div>

                        <div className="space-y-3 flex-1">
                            {columnReports.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                    No reports
                                </div>
                            ) : (
                                columnReports.map((report) => (
                                    <Link
                                        key={report.id}
                                        href={`/dashboard/company/reports/${report.id}`}
                                    >
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <CardTitle className="text-sm font-medium line-clamp-2">
                                                        {report.title}
                                                    </CardTitle>
                                                    <Badge className={`${severityColors[report.severity] || 'bg-gray-100 text-gray-800'} border-0`}>
                                                        {report.severity}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="text-xs text-muted-foreground">
                                                    <div className="flex items-center justify-between">
                                                        <span>ID: {report.reportNumber}</span>
                                                    </div>
                                                    <div className="mt-1">
                                                        {report.program?.programName || 'Unknown Program'}
                                                    </div>
                                                    {report.researcher && (
                                                        <div className="mt-1">
                                                            By: {report.researcher.username}
                                                        </div>
                                                    )}
                                                    <div className="mt-1 text-[11px]">
                                                        {new Date(report.submittedDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
