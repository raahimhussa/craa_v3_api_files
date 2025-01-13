import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';
import UsersRepository from 'src/modules/routes/v1/users/users.repository';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export default class UsersGateway {
  constructor(private readonly usersRepository: UsersRepository) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  @SubscribeMessage('login')
  async login(
    @MessageBody() userId: string,
    @ConnectedSocket() client,
  ): Promise<any> {
    this.usersRepository.updateMany({
      filter: { _id: userId },
      update: {
        'status.online': true,
        'status.signinAt': new Date(),
        'status.socketId': client.id,
      },
    });
  }

  @SubscribeMessage('logout')
  async logout(
    @MessageBody() userId: string,
    @ConnectedSocket() client,
  ): Promise<any> {
    // const res = await this.usersRepository.updateOfflineBySocketId(client.id);
    this.usersRepository.updateOne({
      filter: {
        'status.socketId': client.id,
      },
      update: {
        'status.online': false,
        'status.logoutAt': new Date(),
      },
    });
  }

  @SubscribeMessage('disconnect')
  async disconnect(@MessageBody() data: number): Promise<number> {
    return data;
  }

  @SubscribeMessage('disconnecting')
  async disconnecting(
    @MessageBody() data: number,
    @ConnectedSocket() client,
  ): Promise<any> {
    this.usersRepository.updateOne({
      filter: {
        'status.socketId': client.id,
      },
      update: {
        'status.online': false,
        'status.logoutAt': new Date(),
      },
    });
  }
}
