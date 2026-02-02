import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskComment } from './entities/task-comment.entity';
import { Task } from './entities/task.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthUser } from '../auth/types/auth-user.type';
import { User } from '../users/entities/user.entity';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityType } from './enums/task-activity-type.enum';

@Injectable()
export class TaskCommentsService {
  constructor(
    @InjectRepository(TaskComment)
    private readonly commentsRepository: Repository<TaskComment>,
    private readonly activityService: TaskActivityService,
  ) {}

  async list(task: Task): Promise<TaskComment[]> {
    return this.commentsRepository.find({
      where: { task: { id: task.id } as Task },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
  }

  async create(task: Task, user: AuthUser, dto: CreateCommentDto): Promise<TaskComment[]> {
    const comment = this.commentsRepository.create({
      content: dto.content.trim(),
      task: { id: task.id } as Task,
      author: { id: user.id } as User,
    });
    await this.commentsRepository.save(comment);

    await this.activityService.record(task, user, TaskActivityType.CommentAdded, {
      commentId: comment.id,
    });

    return this.list(task);
  }
}


