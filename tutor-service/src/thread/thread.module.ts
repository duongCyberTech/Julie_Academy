import { Module } from "@nestjs/common";
import { ThreadService } from "./services/thread.service"
import { CommentService } from "./services/comment.service"
import { ThreadController } from "./controllers/thread.controller";
import { CommentController } from "./controllers/comment.controller";
import { ResourceModule } from "src/resource/resource.module";

@Module({
  imports: [ResourceModule],
  controllers: [ThreadController, CommentController],
  providers: [ThreadService, CommentService],
  exports: [],
})
export class ThreadModule {}