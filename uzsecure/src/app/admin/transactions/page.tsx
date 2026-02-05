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
import { Receipt, Search, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
    id: string;
    amount: number;
    status: string;
    transactionRef?: string;
    createdAt: string;
    processedAt?: string;
    researcher: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    report?: {
        id: string;
        reportNumber: string;
        title: string;
    };
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    useEffect(() => {
        fetchTransactions();
    }, [statusFilter, searchQuery, pagination.page]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const filters: any = {
                page: pagination.page,
                limit: pagination.limit,
            };

            if (statusFilter) filters.status = statusFilter;
            if (searchQuery) filters.userId = searchQuery;

            const data = await api.admin.getTransactions(filters);
            setTransactions(data.transactions);
            setPagination(data.pagination);
        } catch (error: any) {
            console.error('Failed to fetch transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            COMPLETED: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
        };
        return (
            <Badge variant="secondary" className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Transaction Logs</h1>
                <p className="text-muted-foreground mt-1">
                    View all payment transactions
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Search User</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="User ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={statusFilter || 'ALL'} onValueChange={(value) => setStatusFilter(value === 'ALL' ? '' : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Transactions ({pagination.total})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No transactions found</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Report</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Processed</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(transaction.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {transaction.researcher.firstName} {transaction.researcher.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        @{transaction.researcher.username}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {transaction.report ? (
                                                    <div>
                                                        <p className="font-mono text-xs">
                                                            {transaction.report.reportNumber}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {transaction.report.title}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 font-semibold">
                                                    <DollarSign className="h-4 w-4" />
                                                    {transaction.amount.toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {transaction.transactionRef || '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {transaction.processedAt
                                                    ? formatDistanceToNow(new Date(transaction.processedAt), {
                                                        addSuffix: true,
                                                    })
                                                    : '-'}
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
