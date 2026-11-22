import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import amqp from 'amqplib';

export interface RegistrationEmailMessage {
  to: string;
  name: string;
  role: 'applicant' | 'company';
  userId: number;
  registeredAt: string;
}

@Injectable()
export class EmailProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailProducer.name);
  private channel: amqp.Channel | null = null;
  private connection: amqp.ChannelModel | null = null;
  private readonly queue = process.env.RABBITMQ_EMAIL_QUEUE || 'email.registration';

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }

  private async connect(): Promise<boolean> {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queue, { durable: true });
      return true;
    } catch (error) {
      this.logger.warn(`RabbitMQ недоступен, письмо не будет поставлено в очередь: ${this.message(error)}`);
      return false;
    }
  }

  async publishRegistrationEmail(message: RegistrationEmailMessage): Promise<void> {
    if (!this.channel) {
      const connected = await this.connect();
      if (!connected) return;
    }

    try {
      this.channel!.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
        contentType: 'application/json',
        type: 'registration',
      });
    } catch (error) {
      this.channel = null;
      await this.connection?.close().catch(() => undefined);
      this.connection = null;
      this.logger.warn(`Не удалось отправить сообщение в RabbitMQ: ${this.message(error)}`);
    }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
