import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';

@Injectable()
export default class PasswordService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public isPlainPassword(password: string) {
    if (password.includes('$')) return false;
    return true;
  }

  public async hash(plainText: string) {
    return await bcrypt.hash(plainText, 10);
  }
}
