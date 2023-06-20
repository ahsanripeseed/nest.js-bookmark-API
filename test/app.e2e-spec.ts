/* eslint-disable @typescript-eslint/no-empty-function */
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpCode, INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'demo@demo.com',
      password: '123',
    };
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      }),
        it('should throw if password empty', () => {
          return pactum
            .spec()
            .post('/auth/signup')
            .withBody({
              email: dto.email,
            })
            .expectStatus(400);
        }),
        it('should throw if no body', () => {
          return pactum
            .spec()
            .post('/auth/signup')
            .withBody({})
            .expectStatus(400);
        }),
        it('should signup', () => {
          return pactum
            .spec()
            .post('/auth/signup')
            .withBody(dto)
            .expectStatus(201);
        });
    });
    describe('Signin', () => {
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      }),
        it('should throw if password empty', () => {
          return pactum
            .spec()
            .post('/auth/signin')
            .withBody({
              email: dto.email,
            })
            .expectStatus(400);
        }),
        it('should throw if no body', () => {
          return pactum
            .spec()
            .post('/auth/signin')
            .withBody({})
            .expectStatus(400);
        });
    });
  });
  describe('User', () => {
    describe('Get me', () => {});
    describe('Edit User', () => {});
  });
  describe('Bookmarks', () => {
    describe('Create Bookmark', () => {});
    describe('Get Bookmark', () => {});
    describe('Get Bookmark By Id', () => {});
    describe('Delete Bookmark', () => {});
    describe('Edit Bookmark', () => {});
  });
});
