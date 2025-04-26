import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  userType: text("user_type").notNull(), // "jobSeeker" or "employer"
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobSeekerProfiles = pgTable("jobseeker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  title: text("title"),
  bio: text("bio"),
  location: text("location"),
  skills: text("skills").array(),
  experience: jsonb("experience"),
  education: jsonb("education"),
  resumeUrl: text("resume_url"),
  avatarUrl: text("avatar_url"),
});

export const companyProfiles = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  industry: text("industry"),
  location: text("location"),
  website: text("website"),
  logoUrl: text("logo_url"),
  size: text("size"), // e.g., "1-10", "11-50", "51-200", etc.
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companyProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // "Full-time", "Part-time", "Contract", etc.
  salary: text("salary"),
  requirements: text("requirements"),
  benefits: text("benefits"),
  skills: text("skills").array(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  jobSeekerId: integer("jobseeker_id").notNull().references(() => jobSeekerProfiles.id),
  status: text("status").default("pending"), // "pending", "reviewing", "interviewed", "offered", "rejected", "accepted"
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  relatedToApplicationId: integer("related_to_application_id").references(() => applications.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users, {
  userType: z.enum(["jobSeeker", "employer"]),
}).omit({
  id: true,
  createdAt: true,
});

export const insertJobSeekerProfileSchema = createInsertSchema(jobSeekerProfiles).omit({
  id: true,
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({
  id: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  status: true,
  appliedAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  sentAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type JobSeekerProfile = typeof jobSeekerProfiles.$inferSelect;
export type InsertJobSeekerProfile = z.infer<typeof insertJobSeekerProfileSchema>;

export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Job categories for the app
export const jobCategories = [
  { id: 1, name: "Technology", icon: "Code", count: 1245 },
  { id: 2, name: "Finance", icon: "DollarSign", count: 879 },
  { id: 3, name: "Healthcare", icon: "Stethoscope", count: 1057 },
  { id: 4, name: "Education", icon: "GraduationCap", count: 624 },
  { id: 5, name: "Retail", icon: "ShoppingBag", count: 932 },
  { id: 6, name: "Marketing", icon: "BarChart", count: 548 },
  { id: 7, name: "Design", icon: "Paintbrush", count: 421 },
  { id: 8, name: "Customer Service", icon: "HeadphonesIcon", count: 756 },
];
