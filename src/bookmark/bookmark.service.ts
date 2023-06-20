import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../../src/prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  /**
   * Retrieves all bookmarks belonging to a specific user.
   *
   * @param {number} userId - The ID of the user whose bookmarks are being retrieved.
   * @return {Promise<Bookmark[]>} - An array of Bookmark objects belonging to the specified user.
   */
  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId: userId,
      },
    });
  }

  /**
   * Asynchronously retrieves a bookmark by its ID and its associated user ID.
   *
   * @param {number} userId - The ID of the user associated with the bookmark.
   * @param {number} bookmarkId - The ID of the bookmark to retrieve.
   * @return {Promise<Bookmark>} A Promise that resolves to the retrieved Bookmark object.
   */
  async getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  /**
   * Creates a bookmark for a given user.
   *
   * @param {number} userId - The unique identifier of the user.
   * @param {CreateBookmarkDto} dto - The data necessary to create the bookmark.
   * @return {Promise<Bookmark>} A promise that resolves with the newly created bookmark.
   */
  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        ...dto,
        userId,
      },
    });

    return bookmark;
  }

  /**
   * Edits a bookmark if it exists and belongs to the user.
   *
   * @param {number} userId - the ID of the user editing the bookmark.
   * @param {number} bookmarkId - the ID of the bookmark to edit.
   * @param {EditBookmarkDto} dto - the data to use to edit the bookmark.
   * @return {Promise<type>} A Promise that resolves to the updated bookmark.
   * @throws {ForbiddenException} If the bookmark doesn't exist or doesn't belong to the user.
   */
  async editBookmark(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
    //get the bookmark by id
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
    if (!bookmark) {
      throw new ForbiddenException('Access to resource denied');
    }

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
    //check if the user owns the bookmark
  }

  /**
   * Deletes a bookmark if the user is authorized to do so.
   *
   * @param {number} userId - the ID of the user who wants to delete the bookmark.
   * @param {number} bookmarkId - the ID of the bookmark to be deleted.
   * @throws {ForbiddenException} if the user is not authorized to delete the bookmark.
   * @return {Promise<void>} - a Promise that resolves when the bookmark is deleted.
   */
  async deleteBookmark(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    await this.prisma.bookmark.delete({
      where: {
        id: bookmark.id,
      },
    });
  }
}
