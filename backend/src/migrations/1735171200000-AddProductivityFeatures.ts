import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductivityFeatures1735171200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS energyLevel ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        ADD COLUMN IF NOT EXISTS estimatedMinutes INT NULL,
        ADD COLUMN IF NOT EXISTS completedAt DATETIME NULL
    `);

    await queryRunner.query(`
      ALTER TABLE tasks
        MODIFY COLUMN status ENUM('todo', 'in_progress', 'blocked', 'done') NOT NULL DEFAULT 'todo'
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS task_subtasks (
        id CHAR(36) NOT NULL PRIMARY KEY,
        taskId CHAR(36) NOT NULL,
        title VARCHAR(200) NOT NULL,
        isCompleted TINYINT(1) NOT NULL DEFAULT 0,
        completedAt DATETIME NULL,
        position INT NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_task_subtasks_task FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_task_subtasks_task ON task_subtasks(taskId)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id CHAR(36) NOT NULL PRIMARY KEY,
        taskId CHAR(36) NOT NULL,
        authorId CHAR(36) NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_task_comments_task FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
        CONSTRAINT FK_task_comments_user FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_task_comments_task ON task_comments(taskId)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS task_activity_logs (
        id CHAR(36) NOT NULL PRIMARY KEY,
        taskId CHAR(36) NOT NULL,
        actorId CHAR(36) NULL,
        type VARCHAR(50) NOT NULL,
        metadata JSON NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FK_task_activity_task FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
        CONSTRAINT FK_task_activity_user FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_task_activity_task ON task_activity_logs(taskId)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS focus_tasks (
        id CHAR(36) NOT NULL PRIMARY KEY,
        userId CHAR(36) NOT NULL,
        taskId CHAR(36) NOT NULL,
        focusDate DATE NOT NULL,
        position INT NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FK_focus_tasks_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT FK_focus_tasks_task FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
        CONSTRAINT UQ_focus_user_date_task UNIQUE (userId, focusDate, taskId)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_focus_user_date ON focus_tasks(userId, focusDate)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS daily_reflections (
        id CHAR(36) NOT NULL PRIMARY KEY,
        userId CHAR(36) NOT NULL,
        reflectDate DATE NOT NULL,
        wentWell TEXT NULL,
        blockers TEXT NULL,
        winOfDay TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_reflection_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT UQ_reflection_user_date UNIQUE (userId, reflectDate)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_reflection_date ON daily_reflections(reflectDate)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS daily_reflections`);
    await queryRunner.query(`DROP TABLE IF EXISTS focus_tasks`);
    await queryRunner.query(`DROP TABLE IF EXISTS task_activity_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS task_comments`);
    await queryRunner.query(`DROP TABLE IF EXISTS task_subtasks`);
    await queryRunner.query(`
      ALTER TABLE tasks
        DROP COLUMN IF EXISTS energyLevel,
        DROP COLUMN IF EXISTS estimatedMinutes,
        DROP COLUMN IF EXISTS completedAt
    `);
    await queryRunner.query(`
      ALTER TABLE tasks
        MODIFY COLUMN status ENUM('todo', 'in_progress', 'done') NOT NULL DEFAULT 'todo'
    `);
  }
}


