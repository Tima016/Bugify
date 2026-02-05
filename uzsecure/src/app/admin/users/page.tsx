'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Users, Search, Shield, Ban, CheckCircle, AlertCircle, Edit, Trash2, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'RESEARCHER' | 'COMPANY' | 'ADMIN';
    isVerified: boolean;
    isBanned: boolean;
    banReason?: string;
    reputationScore: number;
    totalEarnings: number;
    createdAt: string;
    profilePictureUrl?: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [verifiedFilter, setVerifiedFilter] = useState<string>('');
    const [bannedFilter, setBannedFilter] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionType, setActionType] = useState<'verify' | 'ban' | 'edit' | 'delete' | 'bulk-verify' | 'bulk-ban' | 'bulk-delete' | null>(null);
    const [banReason, setBanReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', role: '' });
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    useEffect(() => {
        fetchUsers();
    }, [searchQuery, roleFilter, verifiedFilter, bannedFilter, pagination.page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const filters: any = {
                page: pagination.page,
                limit: pagination.limit,
            };

            if (searchQuery) filters.search = searchQuery;
            if (roleFilter && roleFilter !== 'ALL') filters.role = roleFilter;
            if (verifiedFilter && verifiedFilter !== 'ALL') filters.isVerified = verifiedFilter === 'true';
            if (bannedFilter && bannedFilter !== 'ALL') filters.isBanned = bannedFilter === 'true';

            const data = await api.admin.getUsers(filters);
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!selectedUser) return;

        setProcessing(true);
        try {
            await api.admin.verifyCompany(selectedUser.id);
            toast.success('Company verified successfully');
            fetchUsers();
            setSelectedUser(null);
            setActionType(null);
        } catch (error: any) {
            console.error('Failed to verify company:', error);
            toast.error(error.response?.data?.message || 'Failed to verify company');
        } finally {
            setProcessing(false);
        }
    };

    const handleBan = async () => {
        if (!selectedUser) return;

        if (!selectedUser.isBanned && !banReason.trim()) {
            toast.error('Please provide a reason for banning');
            return;
        }

        setProcessing(true);
        try {
            await api.admin.banUser(selectedUser.id, banReason);
            toast.success(
                selectedUser.isBanned ? 'User unbanned successfully' : 'User banned successfully'
            );
            setSelectedUser(null);
            setBanReason('');
            fetchUsers();
        } catch (error: any) {
            console.error('Failed to ban user:', error);
            toast.error(error.response?.data?.message || 'Failed to ban user');
        } finally {
            setProcessing(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedUser) return;

        setProcessing(true);
        try {
            await api.admin.updateUser(selectedUser.id, editForm);
            toast.success('User updated successfully');
            setSelectedUser(null);
            fetchUsers();
        } catch (error: any) {
            console.error('Failed to update user:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        setProcessing(true);
        try {
            await api.admin.deleteUser(selectedUser.id);
            toast.success('User deleted successfully');
            setSelectedUser(null);
            fetchUsers();
        } catch (error: any) {
            console.error('Failed to delete user:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setProcessing(false);
        }
    };

    const handleBulkAction = async () => {
        if (selectedUserIds.length === 0) return;

        setProcessing(true);
        try {
            let result;
            if (actionType === 'bulk-verify') {
                result = await api.admin.bulkVerifyCompanies(selectedUserIds);
                toast.success(`Verified ${result.successful} users successfully`);
            } else if (actionType === 'bulk-ban') {
                if (!banReason.trim()) {
                    toast.error('Please provide a ban reason');
                    setProcessing(false);
                    return;
                }
                result = await api.admin.bulkBanUsers(selectedUserIds, banReason);
                toast.success(`Banned ${result.successful} users successfully`);
            } else if (actionType === 'bulk-delete') {
                result = await api.admin.bulkDeleteUsers(selectedUserIds);
                toast.success(`Deleted ${result.successful} users successfully`);
            }

            if (result && result.failed > 0) {
                toast.warning(`${result.failed} operations failed`);
            }

            setActionType(null);
            setSelectedUserIds([]);
            setBanReason('');
            fetchUsers();
        } catch (error: any) {
            console.error('Bulk action failed:', error);
            toast.error(error.response?.data?.message || 'Bulk action failed');
        } finally {
            setProcessing(false);
        }
    };

    const toggleSelectUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUserIds.length === users.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(users.map(u => u.id));
        }
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            RESEARCHER: 'bg-blue-100 text-blue-800',
            COMPANY: 'bg-green-100 text-green-800',
            ADMIN: 'bg-purple-100 text-purple-800',
        };
        return (
            <Badge variant="secondary" className={colors[role as keyof typeof colors]}>
                {role}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage researchers, companies, and administrators
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Email, username, name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Roles</SelectItem>
                                    <SelectItem value="RESEARCHER">Researcher</SelectItem>
                                    <SelectItem value="COMPANY">Company</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Verified</Label>
                            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value="true">Verified</SelectItem>
                                    <SelectItem value="false">Unverified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={bannedFilter} onValueChange={setBannedFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value="false">Active</SelectItem>
                                    <SelectItem value="true">Banned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Users ({pagination.total})
                        </CardTitle>
                        {selectedUserIds.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    {selectedUserIds.length} selected
                                </Badge>
                                <Select onValueChange={(value) => setActionType(value as any)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Bulk Actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bulk-verify">Verify Selected</SelectItem>
                                        <SelectItem value="bulk-ban">Ban Selected</SelectItem>
                                        <SelectItem value="bulk-delete">Delete Selected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No users found</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <button
                                                onClick={toggleSelectAll}
                                                className="flex items-center justify-center w-full"
                                            >
                                                {selectedUserIds.length === users.length ? (
                                                    <CheckSquare className="h-5 w-5" />
                                                ) : (
                                                    <Square className="h-5 w-5" />
                                                )}
                                            </button>
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Reputation</TableHead>
                                        <TableHead>Earnings</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <button
                                                    onClick={() => toggleSelectUser(user.id)}
                                                    className="flex items-center justify-center w-full"
                                                >
                                                    {selectedUserIds.includes(user.id) ? (
                                                        <CheckSquare className="h-5 w-5 text-primary" />
                                                    ) : (
                                                        <Square className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-semibold">
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            @{user.username}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Shield className="h-4 w-4 text-yellow-600" />
                                                    <span>{user.reputationScore}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                ${user.totalEarnings.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {user.isVerified && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Verified
                                                        </Badge>
                                                    )}
                                                    {user.isBanned && (
                                                        <Badge variant="secondary" className="bg-red-100 text-red-800 w-fit">
                                                            <Ban className="h-3 w-3 mr-1" />
                                                            Banned
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(user.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {user.role === 'COMPANY' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setActionType('verify');
                                                            }}
                                                        >
                                                            {user.isVerified ? 'Unverify' : 'Verify'}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant={user.isBanned ? 'default' : 'destructive'}
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setActionType('ban');
                                                            setBanReason(user.banReason || '');
                                                        }}
                                                    >
                                                        {user.isBanned ? 'Unban' : 'Ban'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setActionType('edit');
                                                            setEditForm({
                                                                firstName: user.firstName || '',
                                                                lastName: user.lastName || '',
                                                                email: user.email,
                                                                role: user.role
                                                            });
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setActionType('delete');
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
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

            {/* Verify Dialog */}
            <Dialog
                open={actionType === 'verify' && !!selectedUser}
                onOpenChange={() => setSelectedUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser?.isVerified ? 'Remove Verification' : 'Verify Company'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUser?.isVerified
                                ? 'This will remove the verified badge from this company.'
                                : 'This will mark this company as verified and display a verified badge.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Company:</span>
                                <span className="font-medium">
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Email:</span>
                                <span>{selectedUser.email}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleVerify} disabled={processing}>
                            {processing ? 'Processing...' : selectedUser?.isVerified ? 'Remove Verification' : 'Verify Company'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Ban Dialog */}
            <Dialog
                open={actionType === 'ban' && !!selectedUser}
                onOpenChange={() => setSelectedUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser?.isBanned ? 'Unban User' : 'Ban User'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUser?.isBanned
                                ? 'This will restore access for this user.'
                                : 'This will prevent the user from accessing the platform.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">User:</span>
                                    <span className="font-medium">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Email:</span>
                                    <span>{selectedUser.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Role:</span>
                                    <span>{selectedUser.role}</span>
                                </div>
                            </div>

                            {!selectedUser.isBanned && (
                                <div className="space-y-2">
                                    <Label htmlFor="banReason">Reason for Ban *</Label>
                                    <Textarea
                                        id="banReason"
                                        placeholder="Explain why this user is being banned..."
                                        value={banReason}
                                        onChange={(e) => setBanReason(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            )}

                            {selectedUser.isBanned && selectedUser.banReason && (
                                <div className="space-y-2">
                                    <Label>Current Ban Reason</Label>
                                    <p className="text-sm bg-muted p-3 rounded-lg">
                                        {selectedUser.banReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBan}
                            disabled={processing}
                            variant={selectedUser?.isBanned ? 'default' : 'destructive'}
                        >
                            {processing ? 'Processing...' : selectedUser?.isBanned ? 'Unban User' : 'Ban User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={actionType === 'edit' && !!selectedUser}
                onOpenChange={() => setSelectedUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RESEARCHER">Researcher</SelectItem>
                                    <SelectItem value="COMPANY">Company</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                open={actionType === 'delete' && !!selectedUser}
                onOpenChange={() => setSelectedUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">User:</span>
                                <span className="font-medium">
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Email:</span>
                                <span>{selectedUser.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Role:</span>
                                <span>{selectedUser.role}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} disabled={processing} variant="destructive">
                            {processing ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Action Dialog */}
            <Dialog
                open={actionType === 'bulk-verify' || actionType === 'bulk-ban' || actionType === 'bulk-delete'}
                onOpenChange={() => {
                    setActionType(null);
                    setBanReason('');
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'bulk-verify' && 'Bulk Verify Companies'}
                            {actionType === 'bulk-ban' && 'Bulk Ban Users'}
                            {actionType === 'bulk-delete' && 'Bulk Delete Users'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'bulk-verify' && `Verify ${selectedUserIds.length} selected companies?`}
                            {actionType === 'bulk-ban' && `Ban ${selectedUserIds.length} selected users?`}
                            {actionType === 'bulk-delete' && `Delete ${selectedUserIds.length} selected users? This action cannot be undone.`}
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === 'bulk-ban' && (
                        <div className="space-y-2">
                            <Label htmlFor="bulk-ban-reason">Ban Reason *</Label>
                            <Textarea
                                id="bulk-ban-reason"
                                placeholder="Provide a reason for banning these users..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}

                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            {selectedUserIds.length} user(s) selected
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setActionType(null);
                                setBanReason('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkAction}
                            disabled={processing}
                            variant={actionType === 'bulk-delete' ? 'destructive' : 'default'}
                        >
                            {processing ? 'Processing...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
