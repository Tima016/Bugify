import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, SuperAdminController],
  providers: [AdminService, SuperAdminGuard],
  exports: [SuperAdminGuard],
})
export class AdminModule { }
