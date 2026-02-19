import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class CommentGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_thread')
  handleJoinRoom(client: Socket, threadId: string) {
    console.log("Join: ", threadId)
    client.join(threadId);
  }

  sendNewComment(threadId: string, commentData: any) {
    console.log(commentData)
    this.server.to(threadId).emit('receive_comment', commentData);
  }
}