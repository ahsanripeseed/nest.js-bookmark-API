import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuhtService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    try {
      //generate the password
      const hasn = await argon.hash(dto.password);
      //save the new user in the DB
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hasn,
        },
      });
      //retuyrn the saved user
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('User with same email already exists');
        }
      }
    }
  }

  async signin(dto: AuthDto) {
    try {
      //find the user by email
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      //if user doesnot exists, throw exception
      if (!user) {
        throw new ForbiddenException(
          `user with email : ${dto.email} doesnot exists`,
        );
      }
      //compate passwords
      const pwMatches = await argon.verify(user.hash, dto.password);
      //if passwords incorrect, throw exception
      if (!pwMatches) {
        throw new ForbiddenException('Password incorrect');
      }
      delete user.hash;
      return user;
    } catch (error) {
      throw error;
    }
  }
}
