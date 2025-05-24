import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecipientService } from './recipient.service';

@Module({
  imports: [ConfigModule],
  providers: [RecipientService],
  exports: [RecipientService],
})
export class RecipientModule {}
