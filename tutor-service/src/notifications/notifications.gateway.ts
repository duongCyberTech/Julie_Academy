import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ 
    cors: { origin: '*' }
})
export class NotificationGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('notify')
    handleConnectNotification(client: Socket, uid: string): void {
        client.join(uid)
    }

    sendNewNotification(uid: string, notificationData: any, cntUnRead: number = 0) {
        if (notificationData) {
            this.server.to(uid).emit('receive_notification', notificationData)
        }
        this.server.to(uid).emit('cnt_unread', cntUnRead)
    }
}