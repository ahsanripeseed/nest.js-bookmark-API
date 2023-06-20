import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  /**
   * Asynchronously validates a payload by finding a user with the matching ID, deleting the user's hash, and returning the user.
   *
   * @param {Object} payload - An object containing the user's ID and email.
   * @param {number} payload.sub - The user's ID.
   * @param {string} payload.email - The user's email.
   * @return {Promise<Object>} Returns a promise that resolves with the user object.
   */
  async validate(payload: { sub: number; email: string }) {
    console.log(payload);
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    delete user.hash;
    return user;
  }
}
