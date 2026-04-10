import { 
    MessageBody,
    SubscribeMessage,
    WebSocketGateway, 
    WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ 
    cors: { origin: "*" }
})
export class BadgeGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('bagde-fetch')
    handleEvent(client: Socket, uid: string): void {
      client.join(uid)
    }
    
    sendBadgeUpdate(uid: string, badgeData: any) {
        this.server.to(uid).emit('badge-update', badgeData)
    }
}