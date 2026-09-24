export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  username: string;
  password?: string;
  studentId?: string;
  studentGrade?: string; // e.g. "ม.4"
  studentRoom?: string; // e.g. "ม.4/1"
  studentNumber?: string; // e.g. "67"
  targetGoal?: string; // e.g. "เกรด4ฟิสิกส์"
  teacherSubject?: string;
  createdAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  topic: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  assignedBy: string; // Teacher name
  teacherId: string;
  createdAt: string;
  attachmentName?: string;
  attachmentUrl?: string; // image or video or pdf
  attachmentType?: 'image' | 'video' | 'pdf' | 'other';
}

export interface SubmissionAttachment {
  name: string;
  url: string; // Base64 data URL or external URL
  type: 'image' | 'video' | 'pdf' | 'other';
  size?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  fileAttachment?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video' | 'pdf' | 'other';
  attachments?: SubmissionAttachment[];
  status: 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  formula?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  description: string;
  timeLimitMinutes: number;
  createdById: string;
  createdBy: string;
  createdAt: string;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: number[]; // chosen indices
  completedAt: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  topic: string;
  description: string;
  videoUrl: string; // YouTube embed or video URL /uploads/...
  duration: string;
  uploadedById: string;
  uploadedBy: string;
  uploadedAt: string;
  thumbnailUrl?: string;
  keyFormulas?: string[];
  summaryPoints?: string[];
  isUploadedFile?: boolean;
  fileName?: string;
  fileSize?: string;
  videoType?: 'file' | 'youtube' | 'external';
}

export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';

export interface SolvedExample {
  id: string;
  problem: string;
  given: string[];
  formulaUsed: string;
  solutionSteps: string[];
  answer: string;
  tips?: string;
}

export interface KnowledgeFormula {
  id: string;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  formula: string;
  conceptSummary: string;
  variableDefinitions: { symbol: string; meaning: string; unit: string }[];
  conditions?: string[];
  examples: SolvedExample[];
  createdAt: string;
  addedBy: string;
  calculatorType?: 'newton_fma' | 'motion_uvast' | 'kinetic_energy' | 'ohms_law' | 'wave_speed' | 'ideal_gas';
}

export interface AppNotification {
  id: string;
  recipientRole: UserRole | 'all';
  recipientId?: string; // specific user ID or all
  type: 'assignment_new' | 'assignment_deadline' | 'grade_update' | 'submission_new' | 'performance_summary' | 'forum_reply' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionTab?: string;
  referenceId?: string;
}

export interface ForumAnswer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  createdAt: string;
  upvotes: number;
  isAccepted: boolean;
  formulaSnippet?: string;
}

export interface ForumQuestion {
  id: string;
  title: string;
  content: string;
  topic: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  createdAt: string;
  upvotes: number;
  views: number;
  status: 'open' | 'solved';
  formulaSnippet?: string;
  answers: ForumAnswer[];
}
