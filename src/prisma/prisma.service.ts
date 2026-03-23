import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private config: ConfigService) {
    const connectionString = config.getOrThrow<string>('DATABASE_URL');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const adapter = new PrismaPg({
      connectionString,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    super({ adapter });
  }
}
