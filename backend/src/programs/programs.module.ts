import { Module } from '@nestjs/common';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { ProgramVisibilityService } from './program-visibility.service';
import { ProgramInviteService } from './program-invite.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ProgramsController],
    providers: [ProgramsService, ProgramVisibilityService, ProgramInviteService],
    exports: [ProgramsService, ProgramVisibilityService, ProgramInviteService],
})
export class ProgramsModule { }
