import { io, Socket } from 'socket.io-client';

class WebSocketService {
    private socket: Socket | null = null;

    connect(userId?: string) {
        if (this.socket?.connected) return;

        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        if (!token) return;

        this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
            auth: {
                token,
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            if (userId) {
                this.socket?.emit('register', userId);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    subscribe(event: string, callback: (data: any) => void) {
        if (!this.socket) this.connect(); // Ensure connected
        this.socket?.on(event, callback);
    }

    unsubscribe(event: string) {
        if (!this.socket) return;
        this.socket.off(event);
    }

    emit(event: string, data: any) {
        if (!this.socket) return;
        this.socket.emit(event, data);
    }
}

export const wsService = new WebSocketService();
export default wsService;
