import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuhtService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuhtService],
})
export class AuthModule {}
