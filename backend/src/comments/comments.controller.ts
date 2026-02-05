import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    create(@GetUser('id') userId: string, @Body() createCommentDto: CreateCommentDto) {
        return this.commentsService.create(userId, createCommentDto);
    }

    @Get('report/:reportId')
    findAllByReport(@Param('reportId') reportId: string, @GetUser() user: any) {
        return this.commentsService.findAllByReport(reportId, user);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @GetUser('id') userId: string,
        @Body() updateCommentDto: UpdateCommentDto
    ) {
        return this.commentsService.update(id, userId, updateCommentDto);
    }

    @Delete(':id')
    remove(
        @Param('id') id: string,
        @GetUser('id') userId: string,
        @GetUser('role') userRole: string
    ) {
        return this.commentsService.remove(id, userId, userRole);
    }
}
