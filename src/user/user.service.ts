import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  /**
   * Asynchronously edits a user with the provided userId using the provided data.
   *
   * @param {number} userId - The unique identifier of the user to be edited.
   * @param {EditUserDto} dto - The data to update the user with.
   * @return {Promise<User>} The updated user object.
   */
  async edituser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;

    return user;
  }
}
