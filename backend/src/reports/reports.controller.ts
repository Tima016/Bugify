import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportStatusDto } from './dto/report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('reports')
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Request() req, @Body() createReportDto: CreateReportDto) {
        return this.reportsService.create(req.user.id, createReportDto);
    }

    @Get()
    async findAll(
        @Query('status') status?: string,
        @Query('severity') severity?: string,
        @Query('programId') programId?: string,
    ) {
        return this.reportsService.findAll({ status, severity, programId });
    }

    @Get('my-reports')
    @UseGuards(JwtAuthGuard)
    async findMyReports(@Request() req) {
        return this.reportsService.findByResearcher(req.user.id);
    }

    @Get('company-reports')
    @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(UserRole.COMPANY) // Optional: strict role check
    async findCompanyReports(@Request() req) {
        return this.reportsService.findByCompany(req.user.id);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.reportsService.findOne(id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    async updateStatus(
        @Param('id') id: string,
        @Request() req,
        @Body() updateStatusDto: UpdateReportStatusDto,
    ) {
        return this.reportsService.updateStatus(id, req.user.id, updateStatusDto);
    }

    @Get('stats/:programId')
    async getStats(@Param('programId') programId: string) {
        return this.reportsService.getStatsByProgram(programId);
    }
}
