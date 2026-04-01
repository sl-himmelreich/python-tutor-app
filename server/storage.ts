import {
  type Lesson, type InsertLesson, lessons,
  type LessonStep, type InsertLessonStep, lessonSteps,
  type UserProgress, type InsertProgress, userProgress,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

// Auto-migrate: create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    category TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS lesson_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    hint TEXT,
    solution TEXT
  );
  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_slug TEXT NOT NULL,
    step_id INTEGER NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    user_code TEXT,
    attempts INTEGER NOT NULL DEFAULT 0
  );
`);

export interface IStorage {
  // Lessons
  getAllLessons(): Promise<Lesson[]>;
  getLessonBySlug(slug: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  getLessonsCount(): Promise<number>;

  // Steps
  getStepsByLessonId(lessonId: number): Promise<LessonStep[]>;
  getStepById(id: number): Promise<LessonStep | undefined>;
  createStep(step: InsertLessonStep): Promise<LessonStep>;

  // Progress
  getProgressByLessonSlug(lessonSlug: string): Promise<UserProgress[]>;
  getProgressByStepId(lessonSlug: string, stepId: number): Promise<UserProgress | undefined>;
  upsertProgress(progress: InsertProgress): Promise<UserProgress>;
  getAllProgress(): Promise<UserProgress[]>;
}

export class DatabaseStorage implements IStorage {
  async getAllLessons(): Promise<Lesson[]> {
    return db.select().from(lessons).all();
  }

  async getLessonBySlug(slug: string): Promise<Lesson | undefined> {
    return db.select().from(lessons).where(eq(lessons.slug, slug)).get();
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    return db.insert(lessons).values(lesson).returning().get();
  }

  async getLessonsCount(): Promise<number> {
    const result = db.select().from(lessons).all();
    return result.length;
  }

  async getStepsByLessonId(lessonId: number): Promise<LessonStep[]> {
    return db.select().from(lessonSteps).where(eq(lessonSteps.lessonId, lessonId)).all();
  }

  async getStepById(id: number): Promise<LessonStep | undefined> {
    return db.select().from(lessonSteps).where(eq(lessonSteps.id, id)).get();
  }

  async createStep(step: InsertLessonStep): Promise<LessonStep> {
    return db.insert(lessonSteps).values(step).returning().get();
  }

  async getProgressByLessonSlug(lessonSlug: string): Promise<UserProgress[]> {
    return db.select().from(userProgress).where(eq(userProgress.lessonSlug, lessonSlug)).all();
  }

  async getProgressByStepId(lessonSlug: string, stepId: number): Promise<UserProgress | undefined> {
    return db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.lessonSlug, lessonSlug), eq(userProgress.stepId, stepId)))
      .get();
  }

  async upsertProgress(progress: InsertProgress): Promise<UserProgress> {
    const existing = await this.getProgressByStepId(progress.lessonSlug, progress.stepId);
    if (existing) {
      return db
        .update(userProgress)
        .set({
          completed: progress.completed,
          userCode: progress.userCode,
          attempts: (existing.attempts || 0) + 1,
        })
        .where(eq(userProgress.id, existing.id))
        .returning()
        .get();
    } else {
      return db.insert(userProgress).values(progress).returning().get();
    }
  }

  async getAllProgress(): Promise<UserProgress[]> {
    return db.select().from(userProgress).all();
  }
}

export const storage = new DatabaseStorage();
