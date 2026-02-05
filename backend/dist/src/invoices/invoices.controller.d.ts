import { InvoicesService } from './invoices.service';
import * as express from 'express';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    downloadInvoice(id: string, res: express.Response): Promise<void>;
}
