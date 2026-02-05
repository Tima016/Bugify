'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { wsService } from '@/lib/websocket';
import { useAuthStore } from '@/store/auth-store';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
    link?: string;
}

export function NotificationCenter() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (user?.id) {
            wsService.connect(user.id);

            wsService.subscribe('notification', (data: any) => {
                const newNotification: Notification = {
                    id: Math.random().toString(36).substring(7), // Temporary ID generation
                    title: data.title || 'Notification',
                    message: data.message,
                    type: data.type || 'info',
                    timestamp: new Date(),
                    read: false,
                    link: data.link
                };

                setNotifications((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);

                // You could also show a toast here
            });

            return () => {
                wsService.unsubscribe('notification');
            };
        }
    }, [user]);

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const removeNotification = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        // If we removed an unread one, decrement unread count
        const notification = notifications.find((n) => n.id === id);
        if (notification && !notification.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-4">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto px-2 py-1"
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />

                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`relative flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0 ${!notification.read ? 'bg-muted/30' : ''
                                    }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                {!notification.read && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                                )}

                                <div className="flex-1 space-y-1 pl-2">
                                    <div className="flex items-start justify-between">
                                        <p className="text-sm font-medium leading-none">
                                            {notification.title}
                                        </p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:text-destructive absolute right-2 top-2"
                                    onClick={(e) => removeNotification(notification.id, e)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
