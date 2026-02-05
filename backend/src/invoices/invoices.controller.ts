import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import * as express from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get(':id/download')
    async downloadInvoice(@Param('id') id: string, @Res() res: express.Response) {
        const buffer = await this.invoicesService.generatePdf(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
