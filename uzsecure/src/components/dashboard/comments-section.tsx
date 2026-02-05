'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Send, MessageSquare, Reply } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        profilePictureUrl: string | null;
        role: string;
    };
    replies?: Comment[];
}

interface CommentsSectionProps {
    reportId: string;
}

export function CommentsSection({ reportId }: CommentsSectionProps) {
    const { user } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = async () => {
        try {
            const data = await api.comments.getByReportId(reportId);
            // Backend returns flat list or nested depending on implementation details. 
            // Assuming flat list with parentCommentId for now, but UI can handle generic structure.
            // If backend returns nested 'replies', use that. If flat, we might need client-side tree building.
            // Based on typical NestJS patterns, let's assume the API returns what we need. 
            // For now, simple list.
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [reportId]);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await api.comments.create({
                reportId,
                content: newComment,
                parentCommentId: replyTo || undefined,
            });
            setNewComment('');
            setReplyTo(null);
            fetchComments();
            toast.success('Comment posted');
        } catch (error) {
            console.error('Failed to post comment:', error);
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({comments.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Comments List */}
                <div className="flex-1 overflow-y-auto max-h-[600px] space-y-4 pr-2">
                    {loading ? (
                        <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                            No comments yet. Start the conversation!
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.user.profilePictureUrl || undefined} />
                                    <AvatarFallback>{comment.user.firstName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">
                                            {comment.user.firstName} {comment.user.lastName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                        {comment.user.role === 'COMPANY' && (
                                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-medium">
                                                Team
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm bg-muted/40 p-3 rounded-lg rounded-tl-none">
                                        {comment.content}
                                    </div>
                                    {/* Minimal Reply Action */}
                                    {/* <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={() => setReplyTo(comment.id)}
                                    >
                                        Reply
                                    </Button> */}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="pt-4 border-t mt-auto">
                    <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{user?.firstName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <Textarea
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-[80px]"
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || !newComment.trim()}
                                    size="sm"
                                >
                                    {submitting ? 'Posting...' : 'Post Comment'}
                                    <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
