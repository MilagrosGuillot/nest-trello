import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Get('search')
    async searchByEmail(@Query('email') email: string) {
        return this.usersService.findByEmail(email);
    }
}

