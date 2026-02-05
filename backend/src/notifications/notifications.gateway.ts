import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets = new Map<string, string>(); // userId -> socketId

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        // Remove from userSockets
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                break;
            }
        }
    }

    @SubscribeMessage('register')
    handleRegister(client: Socket, userId: string) {
        this.userSockets.set(userId, client.id);
        console.log(`User ${userId} registered with socket ${client.id}`);
        return { event: 'registered', data: { success: true } };
    }

    // Send notification to specific user
    sendNotificationToUser(userId: string, notification: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('notification', notification);
        }
    }

    // Broadcast to all connected clients
    broadcastNotification(notification: any) {
        this.server.emit('notification', notification);
    }

    // Send report update to specific user
    sendReportUpdate(userId: string, reportUpdate: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('report-update', reportUpdate);
        }
    }

    // Broadcast activity feed update
    broadcastActivity(activity: any) {
        this.server.emit('activity', activity);
    }
}
