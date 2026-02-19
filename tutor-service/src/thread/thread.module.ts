import { Module } from "@nestjs/common";
import { ThreadService } from "./services/thread.service"
import { CommentService } from "./services/comment.service"
import { ThreadController } from "./controllers/thread.controller";
import { CommentController } from "./controllers/comment.controller";
import { ResourceModule } from "src/resource/resource.module";
import { CommentGateway } from "./controllers/comment.gateway";

@Module({
  imports: [ResourceModule],
  controllers: [ThreadController, CommentController],
  providers: [ThreadService, CommentService, CommentGateway],
  exports: [],
})
export class ThreadModule {}