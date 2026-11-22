import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';

export interface ErrorLog {
  status: number;
  message: string | string[];
  stack?: string;
  method?: string;
  path?: string;
  timestamp: Date;
}

@Injectable()
export class MongoLoggerService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient | null = null;
  private collection: Collection<ErrorLog> | null = null;

  async onModuleInit() {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
    const dbName = process.env.MONGODB_DB || 'findjob';
    this.client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

    try {
      await this.client.connect();
      this.collection = this.client.db(dbName).collection<ErrorLog>('error_logs');
      await this.collection.createIndex({ timestamp: -1 });
    } catch (error) {
      console.error('MongoDB недоступна; логирование ошибок в БД отключено:', (error as Error).message);
    }
  }

  async onModuleDestroy() {
    await this.client?.close();
  }

  async write(log: ErrorLog): Promise<void> {
    if (!this.collection) return;
    try {
      await this.collection.insertOne(log);
    } catch (error) {
      console.error('Не удалось сохранить ошибку в MongoDB:', (error as Error).message);
    }
  }
}
