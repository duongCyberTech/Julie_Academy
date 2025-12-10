import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets'

import { Server, Socket } from 'socket.io'

import { GoogleDriveService } from '../google/google.service'

import { InternalServerErrorException } from '@nestjs/common'

import { Readable } from 'stream'
import { PrismaService } from 'src/prisma/prisma.service'

const CHUNK_SIZE = 1024 * 1024

@WebSocketGateway({
  cors: {
    origin: '*', // Cho phép kết nối từ mọi nguồn (thay đổi trong môi trường production)
  },
})
export class DriveGateway {
    @WebSocketServer() server: Server;

    constructor(
        private readonly driveService: GoogleDriveService,
        private readonly prisma: PrismaService
    ){}

    private streamToBuffer(stream: Readable): Promise<Buffer> {
        return new Promise((res, rej) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(chunk))
            stream.on('error', rej)
            stream.on('end', () => res(Buffer.concat(chunks)))
        })
    }
    handleConnection(@ConnectedSocket() client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    // Xử lý sự kiện khi client ngắt kết nối
    handleDisconnect(@ConnectedSocket() client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }
    @SubscribeMessage('HELLO')
    handleTest(@ConnectedSocket() client: Socket): string {
      console.log("Hello from", client.id)
      client.emit('HI', {
        message: "Nice to meet u"
      })
      return "hello";
    }

    @SubscribeMessage('START_DOWNLOAD')
    async handleStartDownload(
        @MessageBody() payload: { docsId: string, startByte: number },
        @ConnectedSocket() client: Socket,
    ) {
      console.log("Message payload: ", payload)
      const { docsId, startByte = 0 } = payload;
      const fileToDownload = await this.prisma.resources.findUnique({where: {did: docsId}})
      if (!fileToDownload) {
        client.emit('ERROR', {
            message: "Fail Downloading"
        })
        console.log("Failure")
        return
      }
      console.log("prepare: ", fileToDownload)
      const fileParsing = fileToDownload.file_path.split("/")

      const fileId = fileParsing[fileParsing.indexOf("d") + 1]

      let totalSize = 0;
      try {
            const metadata = await this.driveService.getFileMetadata(fileId);
            totalSize = parseInt(metadata.size); // Chuyển đổi string sang number
            console.log(`Real File Size: ${totalSize} bytes`);
        } catch (e) {
            client.emit('ERROR', { message: "Cannot fetch file size from Drive" });
            return;
        }
      let currentByte = startByte;
      if (currentByte >= totalSize) {
            client.emit('COMPLETE', { docsId, fileId, totalSize });
            return;
      }
      try {
        client.emit('INFO', {
            fileId,
            totalSize,
            resuming: startByte > 0
        })

        while (currentByte < totalSize) {
            const endByte = Math.min(currentByte + CHUNK_SIZE - 1, totalSize - 1);
            const rangeHeader = `bytes=${currentByte}-${endByte}`;

            const driveRes = await this.driveService.downloadFile(fileId, rangeHeader);

            const buffer = await this.streamToBuffer(driveRes.data);

            client.emit('CHUNK', {
                fileId: fileId,
                data: buffer.toString('base64'),
                start: currentByte,
                end: endByte,
                progress: Math.floor(((endByte + 1) / totalSize) * 100)
            })

            currentByte = endByte + 1;

            if (client.disconnected) {
                return;
            }

            client.emit('COMPLETE', {docsId, fileId, totalSize})
        }
      } catch (error) {
        client.emit('ERROR', {
            docsId, fileId,
            message: error.message
        })
      }
    }
}