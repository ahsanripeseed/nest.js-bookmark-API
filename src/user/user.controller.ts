import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../../src/auth/decorator';
import { JwtGuard } from '../../src/guard';
import { EditUserDto } from './dto/';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    console.log({
      user: user,
    });
    return user;
  }

  @Patch()
  editUser(@Body() dto: EditUserDto, @GetUser('id') userId: number) {
    return this.userService.edituser(userId, dto);
  }
}
