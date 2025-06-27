import { Module } from "@nestjs/common"; //obj "module" es para crear modulos
import { PrismaService } from "./prisma.service";

@Module({  
    providers: [PrismaService],  
    exports: [PrismaService],   
})
export class PrismaModule {}
