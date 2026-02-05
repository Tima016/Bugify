'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wallet, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface PayoutRequest {
    id: string;
    amount: number;
    method: string;
    destination: string;
    status: 'PENDING' | 'COMPLETED' | 'REJECTED';
    createdAt: string;
    processedAt?: string;
    transactionRef?: string;
    researcher: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [transactionRef, setTransactionRef] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPayouts();
    }, [statusFilter]);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const data = await api.admin.getAllPayouts(statusFilter || undefined);
            setPayouts(data);
        } catch (error: any) {
            console.error('Failed to fetch payouts:', error);
            toast.error('Failed to load payout requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (payout: PayoutRequest, type: 'approve' | 'reject') => {
        setSelectedPayout(payout);
        setActionType(type);
        setTransactionRef('');
        setAdminNotes('');
    };

    const handleSubmit = async () => {
        if (!selectedPayout || !actionType) return;

        if (actionType === 'approve' && !transactionRef.trim()) {
            toast.error('Transaction reference is required');
            return;
        }

        setProcessing(true);
        try {
            await api.admin.processPayout(selectedPayout.id, {
                status: actionType === 'approve' ? 'COMPLETED' : 'REJECTED',
                transactionRef: actionType === 'approve' ? transactionRef : undefined,
                adminNotes: adminNotes || undefined,
            });

            toast.success(
                actionType === 'approve'
                    ? 'Payout approved successfully'
                    : 'Payout rejected successfully'
            );

            setSelectedPayout(null);
            setActionType(null);
            fetchPayouts();
        } catch (error: any) {
            console.error('Failed to process payout:', error);
            toast.error(error.response?.data?.message || 'Failed to process payout');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'COMPLETED':
                return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
            case 'REJECTED':
                return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Payout Processing</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and process researcher withdrawal requests
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter by Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        {['PENDING', 'COMPLETED', 'REJECTED', ''].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? 'default' : 'outline'}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status || 'All'}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Payouts Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Payout Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : payouts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No payout requests found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Researcher</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Requested</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payouts.map((payout) => (
                                    <TableRow key={payout.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {payout.researcher.firstName} {payout.researcher.lastName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    @{payout.researcher.username}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            ${payout.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{payout.method}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {payout.destination}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(payout.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {payout.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => handleAction(payout, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleAction(payout, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {payout.status === 'COMPLETED' && payout.transactionRef && (
                                                <p className="text-sm text-muted-foreground">
                                                    Ref: {payout.transactionRef}
                                                </p>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Action Dialog */}
            <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' ? 'Approve Payout' : 'Reject Payout'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'approve'
                                ? 'Confirm the payout details and enter the transaction reference.'
                                : 'Provide a reason for rejecting this payout request.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayout && (
                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Researcher:</span>
                                    <span className="font-medium">
                                        {selectedPayout.researcher.firstName}{' '}
                                        {selectedPayout.researcher.lastName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Amount:</span>
                                    <span className="font-semibold text-lg">
                                        ${selectedPayout.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Method:</span>
                                    <span>{selectedPayout.method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Destination:</span>
                                    <span className="text-sm">{selectedPayout.destination}</span>
                                </div>
                            </div>

                            {actionType === 'approve' && (
                                <div className="space-y-2">
                                    <Label htmlFor="txRef">Transaction Reference *</Label>
                                    <Input
                                        id="txRef"
                                        placeholder="Enter transaction ID or reference"
                                        value={transactionRef}
                                        onChange={(e) => setTransactionRef(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="notes">
                                    Admin Notes {actionType === 'reject' && '(Optional)'}
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder={
                                        actionType === 'approve'
                                            ? 'Add any notes about this payout...'
                                            : 'Explain why this payout is being rejected...'
                                    }
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedPayout(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            variant={actionType === 'approve' ? 'default' : 'destructive'}
                        >
                            {processing ? 'Processing...' : actionType === 'approve' ? 'Approve Payout' : 'Reject Payout'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
