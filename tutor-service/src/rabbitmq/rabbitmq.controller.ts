// import { Controller } from '@nestjs/common';
// import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

// @Controller()
// export class RabbitMQController {
  
//   @EventPattern('prior_receiver') // Lắng nghe pattern 'order_created'
//   handlePriorReceiver(@Payload() data: any, @Ctx() context: RmqContext) {
//     console.log('Nhận được tin nhắn:', data);
    
//     // Nếu muốn lấy thông tin chi tiết về message/channel:
//     const channel = context.getChannelRef();
//     const originalMsg = context.getMessage();
    
//     // Nếu bạn không dùng auto-ack trong options, hãy gọi:
//     // channel.ack(originalMsg);
//   }
// }