import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private userSockets;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegister(client: Socket, userId: string): {
        event: string;
        data: {
            success: boolean;
        };
    };
    sendNotificationToUser(userId: string, notification: any): void;
    broadcastNotification(notification: any): void;
    sendReportUpdate(userId: string, reportUpdate: any): void;
    broadcastActivity(activity: any): void;
}
