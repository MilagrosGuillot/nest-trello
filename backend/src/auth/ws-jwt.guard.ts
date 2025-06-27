// Guard de WebSocket para proteger rutas usando autenticación JWT en NestJS
// Permite validar el token JWT de las rutas

import { CanActivate, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  // Método principal que determina si la conexión puede continuar
  async canActivate(context: any): Promise<boolean> {
    try {
      // Obtiene el cliente de la conexión WebSocket
      const client: Socket = context.switchToWs().getClient();
      // Extrae el token JWT del handshake
      const token = this.extractTokenFromHeader(client);
      
      if (!token) {
        // Si no hay token, lanza excepción de WebSocket
        throw new WsException('Token not found');
      }

      // Verifica y decodifica el token JWT
      const payload = await this.jwtService.verifyAsync(token);
      // Adjunta el usuario decodificado al socket para uso posterior
      client.data.user = payload;
      
      return true; 
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  // Extrae el token JWT del header de autorización o del campo auth del handshake
  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth = client.handshake.auth.token || client.handshake.headers.authorization;
    
    if (!auth) {
      return undefined;
    }

    if (auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }

    return auth; 
  }
} 