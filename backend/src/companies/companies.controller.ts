import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('companies')
export class CompaniesController {
    constructor(private companiesService: CompaniesService) { }

    @Get('dashboard-stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.COMPANY)
    async getDashboardStats(@Request() req) {
        // Assuming req.user.companyId exists or we use req.user.id as companyId
        // Based on the schema, User has companyId field
        const companyId = req.user.companyId || req.user.id;
        return this.companiesService.getDashboardStats(companyId);
    }
}
