'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, History, AlertCircle } from 'lucide-react';
import api from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { PayoutRequest } from '@/types';
import { toast } from 'sonner';

export default function WalletPage() {
    const [balance, setBalance] = useState({ currentBalance: 0, totalEarnings: 0 });
    const [history, setHistory] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Payout Form State
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [balanceData, historyData] = await Promise.all([
                api.payments.getBalance(),
                api.payments.getHistory(),
            ]);
            setBalance({
                currentBalance: Number(balanceData.currentBalance),
                totalEarnings: Number(balanceData.totalEarnings)
            });
            setHistory(historyData);
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
            toast.error('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequestPayout = async () => {
        if (!amount || !method || !cardNumber) return;
        if (Number(amount) > balance.currentBalance) {
            alert('Insufficient balance');
            return;
        }

        setSubmitting(true);
        try {
            await api.payments.requestPayout({
                amount: Number(amount),
                currency: 'USD', // Defaulting to USD for now, but backend handles multi-currency support conceptually
                method,
                destination: { cardNumber },
            });
            setIsDialogOpen(false);
            setAmount('');
            setCardNumber('');
            setMethod('');
            fetchData(); // Refresh data
            toast.success('Payout requested successfully');
        } catch (error) {
            console.error('Payout failed:', error);
            alert('Failed to request payout');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading wallet...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Wallet & Payouts</h2>
                <p className="text-muted-foreground">Manage your earnings and withdraw funds.</p>
            </div>

            {/* Balance Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(balance.currentBalance)}</div>
                        <p className="text-xs text-muted-foreground">Available for withdrawal</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(balance.totalEarnings)}</div>
                        <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="gap-2">
                            <CreditCard className="h-4 w-4" />
                            Request Payout
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Request Payout</DialogTitle>
                            <DialogDescription>
                                Withdraw your earnings to your preferred payment method.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label>Amount (USD)</label>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Available: {formatCurrency(balance.currentBalance)}
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <label>Payment Method</label>
                                <Select value={method} onValueChange={setMethod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UZCARD">UzCard</SelectItem>
                                        <SelectItem value="HUMO">Humo</SelectItem>
                                        <SelectItem value="PAYPAL">PayPal</SelectItem>
                                        <SelectItem value="CRYPTOCURRENCY">Crypto (USDT)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <label>Card Number / Wallet Address</label>
                                <Input
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="8600 0000 0000 0000"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleRequestPayout} disabled={submitting}>
                                {submitting ? 'Processing...' : 'Submit Request'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Payout History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No payout history yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{item.method}</TableCell>
                                        <TableCell>{formatCurrency(item.amount, item.currency)}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(item.status)} variant="outline">
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
