import { 
  users, User, InsertUser, 
  jobSeekerProfiles, JobSeekerProfile, InsertJobSeekerProfile,
  companyProfiles, CompanyProfile, InsertCompanyProfile,
  jobs, Job, InsertJob,
  applications, Application, InsertApplication,
  messages, Message, InsertMessage
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for all CRUD operations
export interface IStorage {
  sessionStore: session.SessionStore;

  // User related
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job Seeker Profile
  getJobSeekerProfile(userId: number): Promise<JobSeekerProfile | undefined>;
  createJobSeekerProfile(profile: InsertJobSeekerProfile): Promise<JobSeekerProfile>;
  updateJobSeekerProfile(id: number, profile: Partial<InsertJobSeekerProfile>): Promise<JobSeekerProfile>;
  
  // Company Profile
  getCompanyProfile(userId: number): Promise<CompanyProfile | undefined>;
  getCompanyProfileById(id: number): Promise<CompanyProfile | undefined>;
  getAllCompanyProfiles(): Promise<CompanyProfile[]>;
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  updateCompanyProfile(id: number, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile>;
  
  // Jobs
  getJob(id: number): Promise<Job | undefined>;
  getJobsByCompany(companyId: number): Promise<Job[]>;
  getAllJobs(filters?: {
    query?: string;
    location?: string;
    type?: string;
    companyId?: number;
  }): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<boolean>;
  
  // Applications
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByJobSeeker(jobSeekerId: number): Promise<Application[]>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  getApplicationsForEmployer(userId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobSeekerProfiles: Map<number, JobSeekerProfile>;
  private companyProfiles: Map<number, CompanyProfile>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private messages: Map<number, Message>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private jobSeekerProfileIdCounter: number;
  private companyProfileIdCounter: number;
  private jobIdCounter: number;
  private applicationIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.jobSeekerProfiles = new Map();
    this.companyProfiles = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.jobSeekerProfileIdCounter = 1;
    this.companyProfileIdCounter = 1;
    this.jobIdCounter = 1;
    this.applicationIdCounter = 1;
    this.messageIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Job Seeker Profile methods
  async getJobSeekerProfile(userId: number): Promise<JobSeekerProfile | undefined> {
    return Array.from(this.jobSeekerProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createJobSeekerProfile(profile: InsertJobSeekerProfile): Promise<JobSeekerProfile> {
    const id = this.jobSeekerProfileIdCounter++;
    const jobSeekerProfile: JobSeekerProfile = { ...profile, id };
    this.jobSeekerProfiles.set(id, jobSeekerProfile);
    return jobSeekerProfile;
  }

  async updateJobSeekerProfile(id: number, profile: Partial<InsertJobSeekerProfile>): Promise<JobSeekerProfile> {
    const existingProfile = this.jobSeekerProfiles.get(id);
    if (!existingProfile) {
      throw new Error(`Job seeker profile with ID ${id} not found`);
    }
    
    const updatedProfile = { ...existingProfile, ...profile };
    this.jobSeekerProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Company Profile methods
  async getCompanyProfile(userId: number): Promise<CompanyProfile | undefined> {
    return Array.from(this.companyProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async getCompanyProfileById(id: number): Promise<CompanyProfile | undefined> {
    return this.companyProfiles.get(id);
  }
  
  async getAllCompanyProfiles(): Promise<CompanyProfile[]> {
    return Array.from(this.companyProfiles.values());
  }

  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const id = this.companyProfileIdCounter++;
    const companyProfile: CompanyProfile = { ...profile, id };
    this.companyProfiles.set(id, companyProfile);
    return companyProfile;
  }

  async updateCompanyProfile(id: number, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile> {
    const existingProfile = this.companyProfiles.get(id);
    if (!existingProfile) {
      throw new Error(`Company profile with ID ${id} not found`);
    }
    
    const updatedProfile = { ...existingProfile, ...profile };
    this.companyProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Jobs methods
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobsByCompany(companyId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.companyId === companyId
    );
  }

  async getAllJobs(filters?: {
    query?: string;
    location?: string;
    type?: string;
    companyId?: number;
  }): Promise<Job[]> {
    let result = Array.from(this.jobs.values());
    
    if (filters) {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        result = result.filter(job => 
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query)
        );
      }
      
      if (filters.location) {
        const location = filters.location.toLowerCase();
        result = result.filter(job => 
          job.location.toLowerCase().includes(location)
        );
      }
      
      if (filters.type) {
        result = result.filter(job => job.type === filters.type);
      }
      
      if (filters.companyId) {
        result = result.filter(job => job.companyId === filters.companyId);
      }
    }
    
    return result;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const id = this.jobIdCounter++;
    const now = new Date();
    const newJob: Job = { ...job, id, createdAt: now, isActive: true };
    this.jobs.set(id, newJob);
    return newJob;
  }

  async updateJob(id: number, updates: Partial<InsertJob>): Promise<Job> {
    const existingJob = this.jobs.get(id);
    if (!existingJob) {
      throw new Error(`Job with ID ${id} not found`);
    }
    
    const updatedJob = { ...existingJob, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // Applications methods
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByJobSeeker(jobSeekerId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.jobSeekerId === jobSeekerId
    );
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.jobId === jobId
    );
  }
  
  async getApplicationsForEmployer(userId: number): Promise<Application[]> {
    // Get company profile for this employer
    const companyProfile = await this.getCompanyProfile(userId);
    if (!companyProfile) {
      return [];
    }
    
    // Get all jobs for this company
    const companyJobs = await this.getJobsByCompany(companyProfile.id);
    if (companyJobs.length === 0) {
      return [];
    }
    
    // Get all applications for those jobs
    const jobIds = companyJobs.map(job => job.id);
    return Array.from(this.applications.values()).filter(
      application => jobIds.includes(application.jobId)
    );
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const now = new Date();
    const newApplication: Application = { 
      ...application, 
      id, 
      status: "pending", 
      appliedAt: now, 
      updatedAt: now 
    };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const existingApplication = this.applications.get(id);
    if (!existingApplication) {
      throw new Error(`Application with ID ${id} not found`);
    }
    
    const now = new Date();
    const updatedApplication = { ...existingApplication, status, updatedAt: now };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Messages methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.toUserId === userId || message.fromUserId === userId
    );
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) => 
          (message.fromUserId === user1Id && message.toUserId === user2Id) || 
          (message.fromUserId === user2Id && message.toUserId === user1Id)
      )
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const newMessage: Message = { ...message, id, isRead: false, sentAt: now };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message> {
    const existingMessage = this.messages.get(id);
    if (!existingMessage) {
      throw new Error(`Message with ID ${id} not found`);
    }
    
    const updatedMessage = { ...existingMessage, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
