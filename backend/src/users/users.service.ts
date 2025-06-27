import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable() 
export class UsersService{
    constructor(private readonly prisma: PrismaService){} 

    async findByEmail(email: string) {
       
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
            }
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }
}