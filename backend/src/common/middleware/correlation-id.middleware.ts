// ============================================
// Correlation ID Middleware
// Injects X-Correlation-ID into every request for distributed tracing
// ============================================
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Use existing correlation ID from upstream (e.g., NGINX) or generate new one
        const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || randomUUID();

        // Attach to request for downstream use
        req.headers[CORRELATION_ID_HEADER] = correlationId;
        (req as any).correlationId = correlationId;

        // Include in response headers for client-side debugging
        res.setHeader(CORRELATION_ID_HEADER, correlationId);

        next();
    }
}
