import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';

@Injectable()
export class AuthMongoService {
  private client = new MongoClient(process.env.DATABASE_URL || 'mongodb://localhost:27017/trello');
  private dbName = process.env.DATABASE_NAME || 'trello';

  // Conexión segura reutilizable
  private async connect() {
    try {
      await this.client.connect();
    } catch (error: any) {
      if (error.message && error.message.includes('already connected')) {
        // Ya está conectada, no hacemos nada
      } else {
        throw error;
      }
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.connect(); // Usamos el método connect() que maneja conexión
      const db = this.client.db(this.dbName);
      await db.command({ ping: 1 });
      return true;
    } catch (error) {
      console.error('Error de conexión:', error);
      return false;
    }
  }

  async initDatabase(): Promise<{ message: string }> {
    await this.connect();
    const users = this.client.db(this.dbName).collection('User');
  
    const demoUsers = [
      { email: 'caro@example.com', name: 'Caroline Kaufman', password: '123456' },
      { email: 'sim@example.com', name: 'Simone Compton', password: '123456' },
      { email: 'dono@example.com', name: 'Donovan Hanson', password: '123456' },
      { email: 'ste@example.com', name: 'Stephen Woodward', password: '123456' },
      { email: 'je@example.com', name: 'Joe Mooney', password: '123456' },
    ];
  
    let insertedCount = 0;
  
    for (const user of demoUsers) {
      const exists = await users.findOne({ email: user.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await users.insertOne({ ...user, password: hashedPassword });
        insertedCount++;
      }
    }
  
    if (insertedCount === 0) {
      return { message: 'Todos los usuarios ya existían. No se insertó ninguno.' };
    } else {
      return { message: `Se insertaron ${insertedCount} usuario(s) de prueba.` };
    }
  }
}  
