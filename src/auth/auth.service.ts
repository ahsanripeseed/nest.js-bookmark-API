import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  /**
   * Creates a new user with the provided email and password hash.
   *
   * @param {AuthDto} dto - An object containing the email and password of the user.
   * @return {Promise<User>} The created user object without the password hash.
   */
  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    //save the new user in the DB
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
        },
      });
      delete user.hash;
      //return the saved user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'p2002') {
          throw new ForbiddenException(
            'User with the same email already exists',
          );
        }
        throw error;
      }
    }
  }
  async signin(dto: AuthDto) {
    //find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //if the user doesnot exist then throw an error
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    //compare password
    const mathes = await argon.verify(user.hash, dto.password);
    //if the password is incorrect then throw an error
    if (!mathes) {
      throw new ForbiddenException('Credentials incorrect');
    }

    //send back the user
    delete user.hash;
    return user;
  }
}
