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
import { Building2, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Company {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    createdAt: string;
}

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');

    useEffect(() => {
        fetchCompanies();
    }, [filter]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const filters: any = { role: 'COMPANY' };

            if (filter === 'pending') {
                filters.isVerified = false;
            } else if (filter === 'verified') {
                filters.isVerified = true;
            }

            const data = await api.admin.getUsers(filters);
            setCompanies(data.users);
        } catch (error: any) {
            console.error('Failed to fetch companies:', error);
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (companyId: string, currentStatus: boolean) => {
        try {
            await api.admin.verifyCompany(companyId);
            toast.success(
                currentStatus
                    ? 'Company verification removed'
                    : 'Company verified successfully'
            );
            fetchCompanies();
        } catch (error: any) {
            console.error('Failed to verify company:', error);
            toast.error(error.response?.data?.message || 'Failed to verify company');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Company Verification</h1>
                <p className="text-muted-foreground mt-1">
                    Review and verify company registrations
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter by Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'pending' ? 'default' : 'outline'}
                            onClick={() => setFilter('pending')}
                        >
                            Pending Verification
                        </Button>
                        <Button
                            variant={filter === 'verified' ? 'default' : 'outline'}
                            onClick={() => setFilter('verified')}
                        >
                            Verified
                        </Button>
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                        >
                            All Companies
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Companies Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Companies
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No companies found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Registered</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.map((company) => (
                                    <TableRow key={company.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
                                                    {company.firstName?.[0]}{company.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {company.firstName} {company.lastName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        @{company.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{company.email}</TableCell>
                                        <TableCell>
                                            {company.isVerified ? (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(company.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={company.isVerified ? 'outline' : 'default'}
                                                    onClick={() => handleVerify(company.id, company.isVerified)}
                                                >
                                                    {company.isVerified ? (
                                                        <>
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Unverify
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Verify
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <a href={`/dashboard/company/programs`} target="_blank">
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        View Programs
                                                    </a>
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
        </div>
    );
}
