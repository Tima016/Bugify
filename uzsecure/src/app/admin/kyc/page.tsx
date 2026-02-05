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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface KycSubmission {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    kycStatus: string;
    kycDocuments?: any;
    createdAt: string;
}

export default function AdminKycPage() {
    const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const data = await api.admin.getKycQueue();
            setSubmissions(data);
        } catch (error: any) {
            console.error('Failed to fetch KYC queue:', error);
            toast.error('Failed to load KYC submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async () => {
        if (!selectedSubmission || !actionType) return;

        if (actionType === 'reject' && !notes.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        setProcessing(true);
        try {
            await api.admin.reviewKyc(
                selectedSubmission.id,
                actionType === 'approve' ? 'APPROVED' : 'REJECTED',
                notes
            );
            toast.success(
                actionType === 'approve' ? 'KYC approved successfully' : 'KYC rejected'
            );
            setSelectedSubmission(null);
            setActionType(null);
            setNotes('');
            fetchSubmissions();
        } catch (error: any) {
            console.error('Failed to review KYC:', error);
            toast.error(error.response?.data?.message || 'Failed to review KYC');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">KYC Review Queue</h1>
                <p className="text-muted-foreground mt-1">
                    Review pending KYC submissions
                </p>
            </div>

            {/* KYC Queue */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Pending Submissions ({submissions.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No pending KYC submissions</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {submission.firstName} {submission.lastName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    @{submission.username}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{submission.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{submission.role}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(submission.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {submission.kycDocuments ? (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <FileText className="h-4 w-4" />
                                                    <span>Available</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => {
                                                        setSelectedSubmission(submission);
                                                        setActionType('approve');
                                                    }}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setSelectedSubmission(submission);
                                                        setActionType('reject');
                                                    }}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog
                open={!!selectedSubmission && !!actionType}
                onOpenChange={() => {
                    setSelectedSubmission(null);
                    setActionType(null);
                    setNotes('');
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' ? 'Approve KYC' : 'Reject KYC'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'approve'
                                ? 'This will approve the KYC submission and verify the user.'
                                : 'This will reject the KYC submission. Please provide a reason.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">User:</span>
                                    <span className="font-medium">
                                        {selectedSubmission.firstName} {selectedSubmission.lastName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Email:</span>
                                    <span>{selectedSubmission.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Role:</span>
                                    <span>{selectedSubmission.role}</span>
                                </div>
                            </div>

                            {actionType === 'reject' && (
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Rejection Reason *</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Explain why the KYC is being rejected..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            )}

                            {actionType === 'approve' && (
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any notes about this approval..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedSubmission(null);
                                setActionType(null);
                                setNotes('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReview}
                            disabled={processing}
                            variant={actionType === 'approve' ? 'default' : 'destructive'}
                        >
                            {processing
                                ? 'Processing...'
                                : actionType === 'approve'
                                    ? 'Approve KYC'
                                    : 'Reject KYC'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
