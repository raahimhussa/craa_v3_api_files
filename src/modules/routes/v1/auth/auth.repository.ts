import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import authConstants from './auth-constants';

@Injectable()
export default class AuthRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async addRefreshToken(
    userEmail: string,
    refreshToken: string,
  ): Promise<void> {
    await this.cacheManager.set(
      userEmail,
      refreshToken,
      authConstants.redis.expirationTime.jwt.refreshToken,
    );
  }

  public getToken(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  public removeToken(key: string): Promise<number> {
    return this.cacheManager.del(key);
  }

  public removeAllTokens(): Promise<any> {
    return this.cacheManager.reset();
  }
}
