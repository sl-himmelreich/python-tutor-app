import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Lessons table
export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  category: text("category").notNull(), // "Основы", "Условия", "Циклы", "Функции", "Списки", etc.
});

export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

// Lesson steps table
export const lessonSteps = sqliteTable("lesson_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonId: integer("lesson_id").notNull(),
  order: integer("order").notNull(),
  type: text("type").notNull(), // "theory" | "quiz" | "coding"
  title: text("title").notNull(),
  // JSON string: theory = { html: string }, quiz = { question, options[], correct, explanation },
  // coding = { description, starterCode, expectedOutput?, checkType }
  content: text("content").notNull(),
  hint: text("hint"),
  solution: text("solution"),
});

export const insertLessonStepSchema = createInsertSchema(lessonSteps).omit({ id: true });
export type InsertLessonStep = z.infer<typeof insertLessonStepSchema>;
export type LessonStep = typeof lessonSteps.$inferSelect;

// User progress table
export const userProgress = sqliteTable("user_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonSlug: text("lesson_slug").notNull(),
  stepId: integer("step_id").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  userCode: text("user_code"),
  attempts: integer("attempts").notNull().default(0),
});

export const insertProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
