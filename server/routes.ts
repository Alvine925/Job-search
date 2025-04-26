import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertJobSeekerProfileSchema, insertCompanyProfileSchema, insertJobSchema, insertApplicationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

// Helper function to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Helper to check if the user is an employer
const isEmployer = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user.userType === "employer") {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Employers only" });
};

// Helper to check if the user is a job seeker
const isJobSeeker = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user.userType === "jobSeeker") {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Job seekers only" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Profile routes
  // Job Seeker Profile API
  app.post("/api/profiles/jobseeker", isAuthenticated, isJobSeeker, async (req, res, next) => {
    try {
      const validatedData = insertJobSeekerProfileSchema.parse(req.body);
      const profile = await storage.createJobSeekerProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/profiles/jobseeker/:userId", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getJobSeekerProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/profiles/jobseeker/:id", isAuthenticated, isJobSeeker, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      // Get the profile to check ownership
      const profile = await storage.getJobSeekerProfile(req.user.id);
      if (!profile || profile.id !== id) {
        return res.status(403).json({ message: "You don't have permission to update this profile" });
      }
      
      const updatedProfile = await storage.updateJobSeekerProfile(id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      next(error);
    }
  });

  // Company Profile API
  app.post("/api/profiles/company", isAuthenticated, isEmployer, async (req, res, next) => {
    try {
      const validatedData = insertCompanyProfileSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const profile = await storage.createCompanyProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/profiles/company/:userId", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getCompanyProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Company profile not found" });
      }
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/companies/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getCompanyProfileById(id);
      if (!profile) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/companies", async (req, res, next) => {
    try {
      const companies = await storage.getAllCompanyProfiles();
      res.json(companies);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/profiles/company/:id", isAuthenticated, isEmployer, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      // Get the profile to check ownership
      const profile = await storage.getCompanyProfile(req.user.id);
      if (!profile || profile.id !== id) {
        return res.status(403).json({ message: "You don't have permission to update this profile" });
      }
      
      const updatedProfile = await storage.updateCompanyProfile(id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      next(error);
    }
  });

  // Jobs API
  app.post("/api/jobs", isAuthenticated, isEmployer, async (req, res, next) => {
    try {
      // Get the company profile for this employer
      const companyProfile = await storage.getCompanyProfile(req.user.id);
      if (!companyProfile) {
        return res.status(400).json({ message: "You need to create a company profile first" });
      }
      
      const validatedData = insertJobSchema.parse({
        ...req.body,
        companyId: companyProfile.id
      });
      
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/jobs", async (req, res, next) => {
    try {
      const { query, location, type, companyId } = req.query;
      
      const filters: any = {};
      if (query) filters.query = query as string;
      if (location) filters.location = location as string;
      if (type) filters.type = type as string;
      if (companyId) filters.companyId = parseInt(companyId as string);
      
      const jobs = await storage.getAllJobs(filters);
      
      // For each job, get the company info
      const jobsWithCompany = await Promise.all(
        jobs.map(async (job) => {
          const company = await storage.getCompanyProfileById(job.companyId);
          return {
            ...job,
            company: company ? { id: company.id, name: company.name, logoUrl: company.logoUrl } : null
          };
        })
      );
      
      res.json(jobsWithCompany);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/jobs/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Get company info
      const company = await storage.getCompanyProfileById(job.companyId);
      
      // Get application count
      const applications = await storage.getApplicationsByJob(job.id);
      
      res.json({
        ...job,
        company: company ? { 
          id: company.id, 
          name: company.name, 
          description: company.description,
          industry: company.industry,
          location: company.location,
          website: company.website,
          logoUrl: company.logoUrl,
          size: company.size
        } : null,
        applicationCount: applications.length
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/jobs/company/:companyId", async (req, res, next) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const jobs = await storage.getJobsByCompany(companyId);
      res.json(jobs);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/jobs/:id", isAuthenticated, isEmployer, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Get company profile to check ownership
      const companyProfile = await storage.getCompanyProfile(req.user.id);
      if (!companyProfile || job.companyId !== companyProfile.id) {
        return res.status(403).json({ message: "You don't have permission to update this job" });
      }
      
      const updatedJob = await storage.updateJob(id, req.body);
      res.json(updatedJob);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/jobs/:id", isAuthenticated, isEmployer, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Get company profile to check ownership
      const companyProfile = await storage.getCompanyProfile(req.user.id);
      if (!companyProfile || job.companyId !== companyProfile.id) {
        return res.status(403).json({ message: "You don't have permission to delete this job" });
      }
      
      await storage.deleteJob(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Applications API
  app.post("/api/applications", isAuthenticated, isJobSeeker, async (req, res, next) => {
    try {
      // Get the job seeker profile
      const jobSeekerProfile = await storage.getJobSeekerProfile(req.user.id);
      if (!jobSeekerProfile) {
        return res.status(400).json({ message: "You need to create a job seeker profile first" });
      }
      
      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        jobSeekerId: jobSeekerProfile.id
      });
      
      // Check if the job exists
      const job = await storage.getJob(validatedData.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if already applied
      const existingApplications = await storage.getApplicationsByJobSeeker(jobSeekerProfile.id);
      const alreadyApplied = existingApplications.some(app => app.jobId === validatedData.jobId);
      
      if (alreadyApplied) {
        return res.status(409).json({ message: "You have already applied to this job" });
      }
      
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/applications/jobseeker", isAuthenticated, isJobSeeker, async (req, res, next) => {
    try {
      // Get the job seeker profile
      const jobSeekerProfile = await storage.getJobSeekerProfile(req.user.id);
      if (!jobSeekerProfile) {
        return res.json([]);
      }
      
      const applications = await storage.getApplicationsByJobSeeker(jobSeekerProfile.id);
      
      // For each application, get the job and company details
      const applicationsWithDetails = await Promise.all(
        applications.map(async (application) => {
          const job = await storage.getJob(application.jobId);
          const company = job ? await storage.getCompanyProfileById(job.companyId) : null;
          
          return {
            ...application,
            job: job ? {
              id: job.id,
              title: job.title,
              location: job.location,
              type: job.type,
              salary: job.salary,
              company: company ? {
                id: company.id,
                name: company.name,
                logoUrl: company.logoUrl
              } : null
            } : null
          };
        })
      );
      
      res.json(applicationsWithDetails);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/applications/employer", isAuthenticated, isEmployer, async (req, res, next) => {
    try {
      const applications = await storage.getApplicationsForEmployer(req.user.id);
      
      // For each application, get the job and job seeker details
      const applicationsWithDetails = await Promise.all(
        applications.map(async (application) => {
          const job = await storage.getJob(application.jobId);
          const jobSeeker = await storage.getJobSeekerProfile(application.jobSeekerId);
          
          return {
            ...application,
            job: job ? {
              id: job.id,
              title: job.title,
              location: job.location,
              type: job.type
            } : null,
            jobSeeker: jobSeeker ? {
              id: jobSeeker.id,
              firstName: jobSeeker.firstName,
              lastName: jobSeeker.lastName,
              title: jobSeeker.title,
              avatarUrl: jobSeeker.avatarUrl
            } : null
          };
        })
      );
      
      res.json(applicationsWithDetails);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/applications/:id/status", isAuthenticated, isEmployer, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "reviewing", "interviewed", "offered", "rejected", "accepted"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Verify that this application is for a job posted by this employer
      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const job = await storage.getJob(application.jobId);
      if (!job) {
        return res.status(404).json({ message: "Associated job not found" });
      }
      
      const companyProfile = await storage.getCompanyProfile(req.user.id);
      if (!companyProfile || job.companyId !== companyProfile.id) {
        return res.status(403).json({ message: "You don't have permission to update this application" });
      }
      
      const updatedApplication = await storage.updateApplicationStatus(id, status);
      res.json(updatedApplication);
    } catch (error) {
      next(error);
    }
  });

  // Messages API
  app.post("/api/messages", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        fromUserId: req.user.id
      });
      
      // Check if the recipient exists
      const recipient = await storage.getUser(validatedData.toUserId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/messages", isAuthenticated, async (req, res, next) => {
    try {
      const messages = await storage.getMessagesByUser(req.user.id);
      
      // Get unique conversation partners
      const conversationPartnerIds = [...new Set(
        messages.map(msg => 
          msg.fromUserId === req.user.id ? msg.toUserId : msg.fromUserId
        )
      )];
      
      // Get latest message and partner details for each conversation
      const conversations = await Promise.all(
        conversationPartnerIds.map(async (partnerId) => {
          const conversation = await storage.getConversation(req.user.id, partnerId);
          const partner = await storage.getUser(partnerId);
          const latestMessage = conversation[conversation.length - 1];
          
          let partnerProfile;
          if (partner?.userType === "jobSeeker") {
            partnerProfile = await storage.getJobSeekerProfile(partnerId);
          } else if (partner?.userType === "employer") {
            partnerProfile = await storage.getCompanyProfile(partnerId);
          }
          
          return {
            partnerId,
            partnerName: partner?.userType === "jobSeeker" 
              ? `${partnerProfile?.firstName || ""} ${partnerProfile?.lastName || ""}`
              : partnerProfile?.name || "Unknown",
            partnerAvatar: partner?.userType === "jobSeeker"
              ? partnerProfile?.avatarUrl
              : partnerProfile?.logoUrl,
            latestMessage: latestMessage ? {
              id: latestMessage.id,
              content: latestMessage.content,
              sentAt: latestMessage.sentAt,
              isRead: latestMessage.isRead,
              isSender: latestMessage.fromUserId === req.user.id
            } : null,
            unreadCount: conversation.filter(msg => 
              msg.toUserId === req.user.id && !msg.isRead
            ).length
          };
        })
      );
      
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/messages/:partnerId", isAuthenticated, async (req, res, next) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      
      // Check if partner exists
      const partner = await storage.getUser(partnerId);
      if (!partner) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const messages = await storage.getConversation(req.user.id, partnerId);
      
      // Mark messages as read
      for (const message of messages) {
        if (message.toUserId === req.user.id && !message.isRead) {
          await storage.markMessageAsRead(message.id);
        }
      }
      
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/messages/:id/read", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.getMessage(id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only the recipient can mark a message as read
      if (message.toUserId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to mark this message as read" });
      }
      
      const updatedMessage = await storage.markMessageAsRead(id);
      res.json(updatedMessage);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
