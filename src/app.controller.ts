import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getAppInfo(): { name: string; description: string; docs: string } {
    return this.appService.getAppInfo();
  }
}
