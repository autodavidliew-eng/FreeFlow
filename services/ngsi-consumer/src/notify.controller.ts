import { Body, Controller, Headers, Post } from '@nestjs/common';
import { NotifyService } from './notify.service';

@Controller()
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Post('/notify/ngsi-ld')
  async notify(
    @Body() body: Record<string, any>,
    @Headers('ngsild-tenant') tenantHeader?: string,
    @Headers('x-tenant') xTenant?: string,
  ) {
    const processed = await this.notifyService.handleNotification(
      body,
      tenantHeader || xTenant,
    );

    return { status: 'ok', processed };
  }
}
