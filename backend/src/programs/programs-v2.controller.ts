import { Controller, Get, Post, Body, Param, Version, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('programs-v2')
@Controller({ path: 'programs', version: '2' })
export class ProgramsV2Controller {
    @Get()
    @Version('2')
    @ApiOperation({ summary: 'Get programs (v2 - with enhanced filters)' })
    async getPrograms() {
        return {
            version: '2.0',
            message: 'Enhanced program listing with additional filters',
            data: [],
        };
    }

    @Get(':id')
    @Version('2')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get program by ID (v2)' })
    async getProgram(@Param('id') id: string) {
        return {
            version: '2.0',
            data: { id },
        };
    }
}
