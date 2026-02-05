import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Platform')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Health check' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('platform/stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  async getPlatformStats() {
    return this.appService.getPlatformStats();
  }
}
