import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return 'Alarm service is online.';
  }
}
