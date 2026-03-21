import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo(): { name: string; description: string; docs: string } {
    return {
      name: 'E-Shelf',
      description: 'E-book platform API',
      docs: '/api/docs',
    };
  }
}
