import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuhtService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({

    
  })],
  controllers: [AuthController],
  providers: [AuhtService],
})
export class AuthModule {}
