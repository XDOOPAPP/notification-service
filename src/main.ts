import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'notification_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  console.log(`🚀 Notification Microservice is listening on RabbitMQ queue: notification_queue`);
}
bootstrap();
