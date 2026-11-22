import { Module } from '@nestjs/common';
import { EmailProducer } from './email.producer';

@Module({
  providers: [EmailProducer],
  exports: [EmailProducer],
})
export class EmailModule {}
