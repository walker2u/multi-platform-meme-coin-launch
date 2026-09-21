import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LaunchStatusEvent } from './events/launch-status.event';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/events',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_launch')
  handleSubscribeLaunch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { launchId: string },
  ) {
    if (data?.launchId) {
      client.join(`launch:${data.launchId}`);
      this.logger.log(`Client ${client.id} joined room launch:${data.launchId}`);
      return { event: 'subscribed', launchId: data.launchId };
    }
  }

  /**
   * Broadcasts real-time updates to connected clients watching a specific launch room.
   */
  broadcastLaunchUpdate(launchId: string, event: LaunchStatusEvent) {
    const payload = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    if (this.server) {
      this.server.to(`launch:${launchId}`).emit('launch_update', payload);
      this.server.emit('global_launch_update', payload);
    }
    this.logger.log(`[WS Broadcast] Launch ${launchId} -> Step: ${event.step}`);
  }
}
