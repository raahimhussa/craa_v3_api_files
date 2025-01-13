import { Injectable } from '@nestjs/common';

@Injectable()
export default class AppService {
  getHello(): string {
    return 'Welcome to CRAA API v1 Home!';
  }
}
