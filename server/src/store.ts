// server/src/store.ts
import * as fs from 'fs';
import * as path from 'path';

export type Level = "freshman" | "sophomore" | "junior" | "senior";

export type User = { 
  id: string; 
  handle: string; 
  password: string; // hashed password
  role?: "USER" | "ADMIN";
  createdAt: string;
};
export type Schedule = {
  id: string;
  title?: string;
  collegeSlug: string;     // slug, e.g. "uc-berkeley"
  major: string;       // e.g. "computer science"
  level: Level;
  term: string;
  events: any[]; // EventIn[] type from schedules.ts
  authorHandle?: string;
  userId?: string; // link to user who created it
  reactions: { up: number; down: number };
  commentsCount: number;
  createdAt: string;   // ISO string
  deletedAt?: string | null;
};
export type Report = {
  id: string;
  scheduleId: string;
  reason: string;
  status: "open" | "resolved";
  createdAt: number;
};

// Data directory for persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const SCHEDULES_FILE = path.join(DATA_DIR, 'schedules.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

class Store {
  users: User[] = [];
  schedules: Schedule[] = [];
  reports: Report[] = [];

  constructor() {
    this.ensureDataDir();
    this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData() {
    try {
      // Load schedules
      if (fs.existsSync(SCHEDULES_FILE)) {
        const schedulesData = fs.readFileSync(SCHEDULES_FILE, 'utf8');
        this.schedules = JSON.parse(schedulesData);
        console.log(`📁 Loaded ${this.schedules.length} schedules from file`);
      }

      // Load users
      if (fs.existsSync(USERS_FILE)) {
        const usersData = fs.readFileSync(USERS_FILE, 'utf8');
        this.users = JSON.parse(usersData);
        console.log(`📁 Loaded ${this.users.length} users from file`);
      }

      // Load reports
      if (fs.existsSync(REPORTS_FILE)) {
        const reportsData = fs.readFileSync(REPORTS_FILE, 'utf8');
        this.reports = JSON.parse(reportsData);
        console.log(`📁 Loaded ${this.reports.length} reports from file`);
      }
    } catch (error) {
      console.error('❌ Error loading data from files:', error);
    }
  }

  private saveData() {
    try {
      // Save schedules
      fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(this.schedules, null, 2));
      // Save users
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2));
      // Save reports
      fs.writeFileSync(REPORTS_FILE, JSON.stringify(this.reports, null, 2));
      console.log('💾 Data saved to files');
    } catch (error) {
      console.error('❌ Error saving data to files:', error);
    }
  }

  addSchedule(schedule: Schedule) {
    this.schedules.unshift(schedule);
    this.saveData();
  }

  updateSchedule(id: string, updates: Partial<Schedule>) {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      this.schedules[index] = { ...this.schedules[index], ...updates };
      this.saveData();
    }
  }

  addUser(user: User) {
    this.users.push(user);
    this.saveData();
  }

  addReport(report: Report) {
    this.reports.push(report);
    this.saveData();
  }

  updateReport(id: string, updates: Partial<Report>) {
    const index = this.reports.findIndex(r => r.id === id);
    if (index !== -1) {
      this.reports[index] = { ...this.reports[index], ...updates };
      this.saveData();
    }
  }
}
export const store = new Store();

// No fake seed data - start with clean slate
