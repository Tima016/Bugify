'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Assuming we fixed Tabs or it works now
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, MessageSquare, DollarSign, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function CompanyReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>('');
    const [internalNotes, setInternalNotes] = useState('');
    const [bountyAmount, setBountyAmount] = useState<number>(0);
    const [bonusAmount, setBonusAmount] = useState<number>(0);
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    const fetchReport = async () => {
        try {
            const data = await api.reports.getOne(params.id as string);
            setReport(data);
            setStatus(data.status);
            setInternalNotes(data.internalNotes || '');
            setBountyAmount(Number(data.bountyAmount) || 0);
        } catch (error) {
            console.error('Failed to fetch report:', error);
            toast.error('Failed to load report details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchReport();
        }
    }, [params.id]);

    const handleStatusUpdate = async (newStatus: string) => {
        // If status is resolving, we might show a dialog, but for now direct update for simple statuses
        if (newStatus === 'RESOLVED' || newStatus === 'ACCEPTED') {
             // For resolved/accepted, we might strictly require opening the Bounty Modal
             // But for flexibility, let's allow status change without bounty first.
        }
        await updateReport({ status: newStatus });
    };

    const updateReport = async (data: any) => {
        setIsUpdating(true);
        try {
            await api.reports.updateStatus(params.id as string, data);
            toast.success('Report updated successfully');
            fetchReport(); // Refresh data
        } catch (error) {
            console.error('Failed to update report:', error);
            toast.error('Failed to update report');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAwardBounty = async () => {
        if (bountyAmount <= 0) {
            toast.error('Bounty amount must be greater than 0');
            return;
        }

        await updateReport({
            status: 'RESOLVED', // Auto-resolve when bounty paid? Or just AWARDED? usually resolved.
            bountyAmount: bountyAmount,
            bonusAmount: bonusAmount,
            internalNotes: internalNotes // Save notes too
        });
    };

    if (loading) return <div className="p-8 text-center">Loading report...</div>;
    if (!report) return <div className="p-8 text-center">Report not found</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header / Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono">{report.reportNumber}</Badge>
                         <Badge className={
                            report.severity === 'CRITICAL' ? 'bg-red-500' :
                            report.severity === 'HIGH' ? 'bg-orange-500' :
                            report.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                        }>{report.severity}</Badge>
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(report.submittedDate).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold">{report.title}</h1>
                    <p className="text-muted-foreground">
                        Submitted by <span className="font-semibold text-foreground">{report.researcher.username}</span> to <span className="font-semibold text-foreground">{report.program.programName}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                     <Select value={status} onValueChange={handleStatusUpdate} disabled={isUpdating}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Current Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="TRIAGED">Triaged</SelectItem>
                            <SelectItem value="NEEDS_MORE_INFO">Needs Info</SelectItem>
                            <SelectItem value="ACCEPTED">Accepted</SelectItem>
                            {/* <SelectItem value="RESOLVED">Resolved</SelectItem> handled via bounty dialog usually */}
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="DUPLICATE">Duplicate</SelectItem>
                            <SelectItem value="NOT_APPLICABLE">Not Applicable</SelectItem>
                            <SelectItem value="INFORMATIVE">Informative</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="default" className="bg-green-600 hover:bg-green-700">
                                <DollarSign className="w-4 h-4 mr-2" /> Award Bounty
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Award Bounty</DialogTitle>
                                <DialogDescription>
                                    Set the bounty amount for this confirmed vulnerability. This will create a pending payment record.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">Amount ($)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={bountyAmount}
                                        onChange={(e) => setBountyAmount(Number(e.target.value))}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="bonus" className="text-right">Bonus ($)</Label>
                                    <Input
                                        id="bonus"
                                        type="number"
                                        value={bonusAmount}
                                        onChange={(e) => setBonusAmount(Number(e.target.value))}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="notes" className="text-right">Note</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Internal notes about this decision..."
                                        value={internalNotes}
                                        onChange={(e) => setInternalNotes(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAwardBounty} disabled={isUpdating}>
                                    Confirm Award
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Report Details</TabsTrigger>
                    <TabsTrigger value="activity">Discussion & Activity</TabsTrigger>
                    {/* <TabsTrigger value="internal">Internal Notes</TabsTrigger> */}
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vulnerability Description</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-1">Description</h3>
                                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                                    {report.description}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Impact</h3>
                                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                                    {report.impactAnalysis}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Reproduction Steps</h3>
                                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                                    {report.reproductionSteps}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>Asset Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 bg-muted p-4 rounded-md">
                                <div>
                                    <span className="text-muted-foreground text-sm">Vulnerability Type</span>
                                    <p className="font-medium">{report.vulnerabilityType}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-sm">Asset Tested</span>
                                    <p className="font-medium">N/A (Add to View)</p> 
                                    {/* Asset not in top level DTO typically, likely part of scope or context. Assuming simple for now. */}
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity">
                     <Card>
                        <CardHeader>
                            <CardTitle>Comments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Comments functionality coming soon.</p>
                                {/* Placeholder for Comment Section Component */}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
