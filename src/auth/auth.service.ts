import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
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
      console.log('user', dto);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
        },
      });
      return this.signToken(user.id, user.email);
    } catch (error) {
      console.log('instance of error', error.constructor.name);
      console.log('error message', error.message);
      console.log('error', error instanceof PrismaClientKnownRequestError);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Adjust the code comparison based on the actual error code
          throw new ForbiddenException(
            'User with the same email already exists',
          );
        }
      }
      throw error;
    }
  }

  /**
   * Asynchronously signs in a user with authentication data.
   *
   * @param {AuthDto} dto - An object containing the user's email and password.
   * @return {Promise<User>} The signed in user sans the password hash.
   * @throws {ForbiddenException} If the credentials are incorrect.
   */
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

    return await this.signToken(user.id, user.email);
  }

  /**
   * Asynchronously signs a token with a user ID and email to create an access token.
   *
   * @param {number} userId - The ID of the user to sign the token for.
   * @param {string} email - The email address of the user to sign the token for.
   * @return {Promise<{ access_token: string }>} A Promise that resolves to an object containing the access_token.
   */
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '55m',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: accessToken,
    };
  }
}
