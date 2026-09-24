import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, 
  UserRole, 
  Assignment, 
  Submission, 
  SubmissionAttachment,
  Quiz, 
  QuizAttempt, 
  VideoLesson,
  KnowledgeFormula,
  AppNotification,
  ForumQuestion,
  ForumAnswer
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_VIDEOS,
  INITIAL_QUIZZES,
  INITIAL_QUIZ_ATTEMPTS
} from '../data/initialData';
import {
  INITIAL_KNOWLEDGE_FORMULAS,
  INITIAL_NOTIFICATIONS,
  INITIAL_FORUM_QUESTIONS
} from '../data/extendedData';

interface AppContextType {
  currentUser: User;
  users: User[];
  isAuthenticated: boolean;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  login: (username: string, password: string, selectedRole?: UserRole) => { success: boolean; message?: string; user?: User };
  logout: () => void;
  registerUser: (data: {
    name: string;
    role: UserRole;
    username: string;
    password: string;
    email: string;
    studentGrade?: string;
    studentRoom?: string;
    studentNumber?: string;
    targetGoal?: string;
    avatar?: string;
  }) => { success: boolean; message?: string; user?: User };
  addUser: (data: {
    name: string;
    role: UserRole;
    username: string;
    password: string;
    email: string;
    studentId?: string;
    studentGrade?: string;
    studentRoom?: string;
    studentNumber?: string;
    targetGoal?: string;
    teacherSubject?: string;
    avatar?: string;
  }) => { success: boolean; message?: string };
  deleteUser: (userId: string) => { success: boolean; message?: string };
  updateUser: (userId: string, data: Partial<User>) => { success: boolean; message?: string };
  
  assignments: Assignment[];
  submissions: Submission[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  videos: VideoLesson[];
  completedVideoIds: string[];
  
  // Knowledge Repository
  formulas: KnowledgeFormula[];
  addFormula: (data: Omit<KnowledgeFormula, 'id' | 'createdAt' | 'addedBy'>) => void;
  deleteFormula: (id: string) => void;

  // Notification System
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (role?: UserRole) => void;
  deleteNotification: (id: string) => void;
  sendNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Q&A Forum
  forumQuestions: ForumQuestion[];
  createQuestion: (data: { title: string; content: string; topic: string; tags: string[]; formulaSnippet?: string }) => void;
  addAnswer: (questionId: string, content: string, formulaSnippet?: string) => void;
  toggleQuestionUpvote: (questionId: string) => void;
  toggleAnswerUpvote: (questionId: string, answerId: string) => void;
  acceptAnswer: (questionId: string, answerId: string) => void;
  deleteQuestion: (id: string) => void;

  // Student actions
  submitAssignment: (assignmentId: string, content: string, fileAttachment?: string, attachments?: SubmissionAttachment[]) => void;
  submitQuizAttempt: (quizId: string, answers: number[], score: number, totalQuestions: number) => QuizAttempt;
  toggleVideoCompleted: (videoId: string) => void;

  // Teacher actions
  createAssignment: (data: { title: string; topic: string; description: string; dueDate: string; totalPoints: number; attachmentName?: string; attachmentUrl?: string; attachmentType?: 'image' | 'video' | 'pdf' | 'other' }) => void;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;
  createQuiz: (data: { title: string; topic: string; description: string; timeLimitMinutes: number; questions: Quiz['questions'] }) => void;
  uploadVideo: (data: { 
    title: string; 
    topic: string; 
    description: string; 
    videoUrl: string; 
    duration: string; 
    thumbnailUrl?: string; 
    keyFormulas?: string[]; 
    summaryPoints?: string[];
    isUploadedFile?: boolean;
    fileName?: string;
    fileSize?: string;
    videoType?: 'file' | 'youtube' | 'external';
  }) => Promise<void> | void;
  refreshVideos: () => Promise<void>;
  syncWithServer: (force?: boolean) => Promise<void>;
  isServerSynced: boolean;
  lastSyncTime: string;
  deleteAssignment: (id: string) => void;
  deleteQuiz: (id: string) => void;
  deleteVideo: (id: string) => void;

  // Admin & System actions
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'physics_lab_users_v1',
  IS_AUTHENTICATED: 'physics_lab_is_authenticated_v1',
  CURRENT_USER_ID: 'physics_lab_current_user_id_v1',
  ASSIGNMENTS: 'physics_lab_assignments_v1',
  SUBMISSIONS: 'physics_lab_submissions_v1',
  QUIZZES: 'physics_lab_quizzes_v1',
  QUIZ_ATTEMPTS: 'physics_lab_quiz_attempts_v1',
  VIDEOS: 'physics_lab_videos_v1',
  COMPLETED_VIDEOS: 'physics_lab_completed_videos_v1',
  FORMULAS: 'physics_lab_formulas_v1',
  NOTIFICATIONS: 'physics_lab_notifications_v1',
  FORUM_QUESTIONS: 'physics_lab_forum_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(u => {
            const match = INITIAL_USERS.find(iu => iu.id === u.id);
            return {
              ...u,
              username: u.username || match?.username || u.id,
              password: u.password || match?.password || 'password123'
            };
          });
        }
      } catch (e) {
        console.error('Failed to parse users from localStorage', e);
      }
    }
    return INITIAL_USERS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    return saved !== null ? saved === 'true' : true;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'student_1';
  });

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    return saved ? JSON.parse(saved) : INITIAL_QUIZZES;
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
    return saved ? JSON.parse(saved) : INITIAL_QUIZ_ATTEMPTS;
  });

  const [videos, setVideos] = useState<VideoLesson[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });

  // Multi-device central server synchronization state
  const [isServerSynced, setIsServerSynced] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('กำลังเชื่อมต่อ');
  const hasLoadedInitialServerData = useRef<boolean>(false);
  const localLastModified = useRef<number>(0);
  const isSyncingRef = useRef<boolean>(false);

  // Synchronize entire state with central server so all devices see assignments, videos, quizzes, and submissions
  const syncWithServer = async (force = false) => {
    if (isSyncingRef.current && !force) return;
    isSyncingRef.current = true;
    try {
      if (!force && localLastModified.current > 0) {
        const verRes = await fetch('/api/portal-version');
        if (verRes.ok) {
          const { lastModified } = await verRes.json();
          if (lastModified && lastModified <= localLastModified.current) {
            isSyncingRef.current = false;
            return;
          }
        }
      }

      const res = await fetch('/api/portal-data');
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && typeof serverData === 'object') {
          if (Array.isArray(serverData.videos) && serverData.videos.length > 0) {
            setVideos(serverData.videos);
          }
          if (Array.isArray(serverData.assignments) && serverData.assignments.length > 0) {
            setAssignments(serverData.assignments);
          }
          if (Array.isArray(serverData.submissions)) {
            setSubmissions(serverData.submissions);
          }
          if (Array.isArray(serverData.quizzes) && serverData.quizzes.length > 0) {
            setQuizzes(serverData.quizzes);
          }
          if (Array.isArray(serverData.quizAttempts)) {
            setQuizAttempts(serverData.quizAttempts);
          }
          if (Array.isArray(serverData.forumQuestions) && serverData.forumQuestions.length > 0) {
            setForumQuestions(serverData.forumQuestions);
          }
          if (serverData.lastModified) {
            localLastModified.current = serverData.lastModified;
          }
          setIsServerSynced(true);
          const now = new Date();
          setLastSyncTime(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (e) {
      console.warn('Could not sync with central server API:', e);
      setIsServerSynced(false);
    } finally {
      hasLoadedInitialServerData.current = true;
      isSyncingRef.current = false;
    }
  };

  const refreshVideos = async () => {
    await syncWithServer(true);
  };

  // Push local updates directly to central server
  const pushToServer = async (payload: {
    videos?: VideoLesson[];
    assignments?: Assignment[];
    submissions?: Submission[];
    quizzes?: Quiz[];
    quizAttempts?: QuizAttempt[];
    forumQuestions?: ForumQuestion[];
  }) => {
    try {
      const res = await fetch('/api/portal-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.lastModified) {
          localLastModified.current = resData.lastModified;
        }
        setIsServerSynced(true);
        const now = new Date();
        setLastSyncTime(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn('Failed to push update to server:', err);
      setIsServerSynced(false);
    }
  };

  useEffect(() => {
    // Initial sync from central server on mount
    syncWithServer(true);

    // Periodic background sync every 6 seconds to pick up changes made on other devices
    const interval = setInterval(() => {
      syncWithServer(false);
    }, 6000);

    // Re-sync when user switches back to browser tab
    const handleFocus = () => {
      syncWithServer(true);
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const [completedVideoIds, setCompletedVideoIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_VIDEOS);
    return saved ? JSON.parse(saved) : ['vid_1'];
  });

  const [formulas, setFormulas] = useState<KnowledgeFormula[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FORMULAS);
    return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_FORMULAS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [forumQuestions, setForumQuestions] = useState<ForumQuestion[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FORUM_QUESTIONS);
    return saved ? JSON.parse(saved) : INITIAL_FORUM_QUESTIONS;
  });

  // Safe localStorage helper to prevent QuotaExceededError or unhandled exceptions from freezing the app
  const safeSetItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn(`[PhysicsPortal] Storage save warning for "${key}":`, err);
      if (key === STORAGE_KEYS.SUBMISSIONS) {
        try {
          const parsed = JSON.parse(value) as Submission[];
          const sanitized = parsed.map(sub => ({
            ...sub,
            attachmentUrl: sub.attachmentUrl && sub.attachmentUrl.length > 50000 
              ? 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80' 
              : sub.attachmentUrl,
            attachments: sub.attachments?.map(att => ({
              ...att,
              url: att.url && att.url.length > 50000 
                ? 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80' 
                : att.url
            }))
          }));
          localStorage.setItem(key, JSON.stringify(sanitized));
        } catch (fallbackErr) {
          console.warn('[PhysicsPortal] Submissions fallback save warning:', fallbackErr);
        }
      }
    }
  };

  // Save changes to localStorage and push updates to central server
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    if (hasLoadedInitialServerData.current) {
      pushToServer({ assignments });
    }
  }, [assignments]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    if (hasLoadedInitialServerData.current) {
      pushToServer({ submissions });
    }
  }, [submissions]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    if (hasLoadedInitialServerData.current) {
      pushToServer({ quizzes });
    }
  }, [quizzes]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(quizAttempts));
    if (hasLoadedInitialServerData.current) {
      pushToServer({ quizAttempts });
    }
  }, [quizAttempts]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    if (hasLoadedInitialServerData.current) {
      pushToServer({ videos });
    }
  }, [videos]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.COMPLETED_VIDEOS, JSON.stringify(completedVideoIds));
  }, [completedVideoIds]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.FORMULAS, JSON.stringify(formulas));
  }, [formulas]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.FORUM_QUESTIONS, JSON.stringify(forumQuestions));
    if (hasLoadedInitialServerData.current) {
      pushToServer({ forumQuestions });
    }
  }, [forumQuestions]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.IS_AUTHENTICATED, String(isAuthenticated));
  }, [isAuthenticated]);

  const setCurrentUser = (user: User) => {
    setCurrentUserId(user.id);
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
    }
  };

  const login = (
    username: string, 
    password: string, 
    selectedRole?: UserRole
  ): { success: boolean; message?: string; user?: User } => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      return { success: false, message: 'กรุณาระบุชื่อบัญชีผู้ใช้ (Username)' };
    }
    if (!trimmedPass) {
      return { success: false, message: 'กรุณาระบุรหัสผ่าน (Password)' };
    }

    const matchedUser = users.find(u => 
      (u.username?.toLowerCase() === trimmedUser || u.email?.toLowerCase() === trimmedUser)
    );

    if (!matchedUser) {
      return { success: false, message: `ไม่พบบัญชีผู้ใช้ "${username}" ในระบบ` };
    }

    if (selectedRole && matchedUser.role !== selectedRole) {
      const roleName = selectedRole === 'student' ? 'นักเรียน' : selectedRole === 'teacher' ? 'ครูผู้สอน' : 'ผู้ดูแลระบบ';
      return { success: false, message: `บัญชีนี้ไม่ใช่กลุ่ม "${roleName}" กรุณาตรวจสอบแท็บประเภทผู้ใช้` };
    }

    if (matchedUser.password && matchedUser.password !== trimmedPass) {
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' };
    }

    setCurrentUserId(matchedUser.id);
    setIsAuthenticated(true);
    return { success: true, user: matchedUser };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const registerUser = (data: {
    name: string;
    role: UserRole;
    username: string;
    password: string;
    email: string;
    studentGrade?: string;
    studentRoom?: string;
    studentNumber?: string;
    targetGoal?: string;
    avatar?: string;
  }): { success: boolean; message?: string; user?: User } => {
    const cleanUsername = data.username.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, message: 'กรุณาระบุชื่อบัญชีผู้ใช้ (Username)' };
    }
    if (!data.password.trim()) {
      return { success: false, message: 'กรุณาระบุรหัสผ่าน (Password)' };
    }
    if (!data.name.trim()) {
      return { success: false, message: 'กรุณาระบุชื่อ-นามสกุล' };
    }

    if (users.some(u => u.username?.toLowerCase() === cleanUsername || (u.email && u.email.toLowerCase() === data.email.trim().toLowerCase()))) {
      return { success: false, message: `ชื่อบัญชีหรืออีเมลนี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบหรือใช้ข้อมูลอื่น` };
    }

    const defaultAvatars: Record<UserRole, string> = {
      student: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      teacher: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      admin: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    const newId = `${data.role}_${Date.now()}`;
    const newUser: User = {
      id: newId,
      name: data.name.trim(),
      role: data.role,
      username: cleanUsername,
      password: data.password.trim(),
      email: data.email.trim() || `${cleanUsername}@chonkanya.ac.th`,
      studentId: data.role === 'student' ? (data.studentNumber ? `ST-${data.studentNumber}` : `ST-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
      studentGrade: data.studentGrade?.trim() || 'ม.4',
      studentRoom: data.studentRoom?.trim() || 'ม.4/1',
      studentNumber: data.studentNumber?.trim() || '67',
      targetGoal: data.targetGoal?.trim() || 'เกรด4ฟิสิกส์',
      avatar: data.avatar || defaultAvatars[data.role],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);

    sendNotification({
      recipientRole: 'admin',
      title: 'มีผู้ใช้ลงทะเบียนใหม่',
      message: `ผู้ใช้ ${newUser.name} (@${cleanUsername}) ได้สมัครบัญชีเข้าสู่ระบบเรียบร้อยแล้ว`,
      type: 'system'
    });

    return { success: true, user: newUser };
  };

  const addUser = (data: {
    name: string;
    role: UserRole;
    username: string;
    password: string;
    email: string;
    studentId?: string;
    studentGrade?: string;
    studentRoom?: string;
    studentNumber?: string;
    targetGoal?: string;
    teacherSubject?: string;
    avatar?: string;
  }): { success: boolean; message?: string } => {
    const cleanUsername = data.username.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, message: 'กรุณาระบุชื่อบัญชีผู้ใช้ (Username)' };
    }
    if (!data.password.trim()) {
      return { success: false, message: 'กรุณาระบุรหัสผ่าน (Password)' };
    }
    if (!data.name.trim()) {
      return { success: false, message: 'กรุณาระบุชื่อ-นามสกุล' };
    }

    // Check duplicate username
    if (users.some(u => u.username?.toLowerCase() === cleanUsername)) {
      return { success: false, message: `ชื่อบัญชีผู้ใช้ "${data.username}" มีอยู่ในระบบแล้ว กรุณาเลือกชื่ออื่น` };
    }

    const defaultAvatars: Record<UserRole, string> = {
      student: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      teacher: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      admin: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    const newId = `${data.role}_${Date.now()}`;
    const newUser: User = {
      id: newId,
      name: data.name.trim(),
      role: data.role,
      username: cleanUsername,
      password: data.password.trim(),
      email: data.email?.trim() || `${cleanUsername}@chonkanya.ac.th`,
      studentId: data.role === 'student' ? (data.studentId?.trim() || `ST-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
      studentGrade: data.studentGrade?.trim(),
      studentRoom: data.studentRoom?.trim(),
      studentNumber: data.studentNumber?.trim(),
      targetGoal: data.targetGoal?.trim(),
      teacherSubject: data.role === 'teacher' ? (data.teacherSubject?.trim() || 'ฟิสิกส์ทั่วไป') : undefined,
      avatar: data.avatar || defaultAvatars[data.role],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev]);

    sendNotification({
      recipientRole: 'admin',
      title: 'เพิ่มบัญชีผู้ใช้สำเร็จ',
      message: `เพิ่มบัญชี ${newUser.name} (${cleanUsername}) ในกลุ่ม ${newUser.role === 'student' ? 'นักเรียน' : newUser.role === 'teacher' ? 'ครู' : 'แอดมิน'} เรียบร้อยแล้ว`,
      type: 'system'
    });

    return { success: true };
  };

  const deleteUser = (userId: string): { success: boolean; message?: string } => {
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'ไม่พบผู้ใช้ที่ต้องการลบ' };
    }

    if (target.id === currentUserId) {
      return { success: false, message: 'ไม่สามารถลบบัญชีที่กำลังเข้าสู่ระบบอยู่ในขณะนี้ได้ กรุณาสลับบัญชีก่อนลบ' };
    }

    if (target.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, message: 'ไม่สามารถลบบัญชีแอดมินคนสุดท้ายได้ เพื่อความปลอดภัยของระบบ' };
      }
    }

    setUsers(prev => prev.filter(u => u.id !== userId));

    sendNotification({
      recipientRole: 'admin',
      title: 'ลบบัญชีผู้ใช้เรียบร้อย',
      message: `ลบบัญชี ${target.name} (${target.username}) ออกจากระบบแล้ว`,
      type: 'system'
    });

    return { success: true };
  };

  const updateUser = (userId: string, data: Partial<User>): { success: boolean; message?: string } => {
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข' };
    }

    if (data.username && data.username.toLowerCase() !== target.username.toLowerCase()) {
      if (users.some(u => u.id !== userId && u.username.toLowerCase() === data.username?.toLowerCase())) {
        return { success: false, message: `ชื่อบัญชี "${data.username}" ถูกใช้งานแล้ว` };
      }
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    return { success: true };
  };

  // Notification helper
  const sendNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...notif,
      timestamp: dateString,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = (role?: UserRole) => {
    setNotifications(prev => prev.map(n => {
      if (!role || n.recipientRole === role || n.recipientRole === 'all') {
        return { ...n, read: true };
      }
      return n;
    }));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Knowledge Repository
  const addFormula = (data: Omit<KnowledgeFormula, 'id' | 'createdAt' | 'addedBy'>) => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newFormula: KnowledgeFormula = {
      id: `kf_${Date.now()}`,
      ...data,
      createdAt: dateString,
      addedBy: currentUser.name
    };
    setFormulas(prev => [newFormula, ...prev]);
  };

  const deleteFormula = (id: string) => {
    setFormulas(prev => prev.filter(f => f.id !== id));
  };

  // Forum Actions
  const createQuestion = (data: { title: string; content: string; topic: string; tags: string[]; formulaSnippet?: string }) => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newQuestion: ForumQuestion = {
      id: `fq_${Date.now()}`,
      ...data,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      createdAt: dateString,
      upvotes: 0,
      views: 1,
      status: 'open',
      answers: []
    };
    setForumQuestions(prev => [newQuestion, ...prev]);
  };

  const addAnswer = (questionId: string, content: string, formulaSnippet?: string) => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newAnswer: ForumAnswer = {
      id: `fa_${Date.now()}`,
      questionId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: dateString,
      upvotes: 0,
      isAccepted: false,
      formulaSnippet
    };

    setForumQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        // notify question author if author is not current user
        if (q.authorId !== currentUser.id) {
          sendNotification({
            recipientRole: q.authorRole,
            recipientId: q.authorId,
            type: 'forum_reply',
            title: 'มีคำตอบใหม่ในข้อซักถามของคุณ',
            message: `${currentUser.name} (${currentUser.role === 'teacher' ? 'ครูผู้สอน' : 'เพื่อนร่วมชั้น'}) ได้ตอบคำถามในหัวข้อ "${q.title.slice(0, 45)}..."`,
            actionTab: 'forum',
            referenceId: q.id
          });
        }
        return {
          ...q,
          answers: [...q.answers, newAnswer]
        };
      }
      return q;
    }));
  };

  const toggleQuestionUpvote = (questionId: string) => {
    setForumQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, upvotes: q.upvotes + 1 };
      }
      return q;
    }));
  };

  const toggleAnswerUpvote = (questionId: string, answerId: string) => {
    setForumQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(a => a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a)
        };
      }
      return q;
    }));
  };

  const acceptAnswer = (questionId: string, answerId: string) => {
    setForumQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          status: 'solved',
          answers: q.answers.map(a => ({
            ...a,
            isAccepted: a.id === answerId
          }))
        };
      }
      return q;
    }));
  };

  const deleteQuestion = (id: string) => {
    setForumQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Student Actions
  const submitAssignment = (
    assignmentId: string, 
    content: string, 
    fileAttachment?: string, 
    attachments?: SubmissionAttachment[]
  ) => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const targetAssignment = assignments.find(a => a.id === assignmentId);

    const primaryAttachment = attachments && attachments.length > 0 ? attachments[0] : undefined;
    const finalFileName = fileAttachment || primaryAttachment?.name || 'physics_homework.pdf';
    const finalUrl = primaryAttachment?.url;
    const finalType = primaryAttachment?.type;

    // check if student already submitted this assignment, if so update it
    setSubmissions(prev => {
      const existingIndex = prev.findIndex(s => s.assignmentId === assignmentId && s.studentId === currentUser.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          submittedAt: dateString,
          content,
          fileAttachment: finalFileName,
          attachmentUrl: finalUrl || updated[existingIndex].attachmentUrl,
          attachmentType: finalType || updated[existingIndex].attachmentType,
          attachments: attachments && attachments.length > 0 ? attachments : updated[existingIndex].attachments,
          status: 'submitted'
        };
        return updated;
      } else {
        const newSub: Submission = {
          id: `sub_${Date.now()}`,
          assignmentId,
          studentId: currentUser.id,
          studentName: currentUser.name,
          submittedAt: dateString,
          content,
          fileAttachment: finalFileName,
          attachmentUrl: finalUrl,
          attachmentType: finalType,
          attachments: attachments && attachments.length > 0 ? attachments : undefined,
          status: 'submitted'
        };
        return [newSub, ...prev];
      }
    });

    // Notify teachers of new submission
    sendNotification({
      recipientRole: 'teacher',
      type: 'submission_new',
      title: 'มีนักเรียนส่งการบ้านใหม่',
      message: `${currentUser.name} ส่งการบ้าน "${targetAssignment?.title || 'แบบฝึกหัดฟิสิกส์'}" พร้อมแนบเอกสาร/รูปภาพ กรุณาตรวจสอบและให้คะแนน`,
      actionTab: 'submissions',
      referenceId: assignmentId
    });
  };

  const submitQuizAttempt = (quizId: string, answers: number[], score: number, totalQuestions: number): QuizAttempt => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const percentage = Math.round((score / totalQuestions) * 100);

    const attempt: QuizAttempt = {
      id: `att_${Date.now()}`,
      quizId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      score,
      totalQuestions,
      percentage,
      answers,
      completedAt: dateString
    };

    setQuizAttempts(prev => [attempt, ...prev]);

    const targetQuiz = quizzes.find(q => q.id === quizId);
    // Notify teachers of quiz performance
    sendNotification({
      recipientRole: 'teacher',
      type: 'performance_summary',
      title: 'นักเรียนทำแบบทดสอบวัดความรู้เสร็จสิ้น',
      message: `${currentUser.name} ทำแบบทดสอบ "${targetQuiz?.title || 'แบบทดสอบฟิสิกส์'}" ได้ ${score}/${totalQuestions} คะแนน (${percentage}%)`,
      actionTab: 'quizzes',
      referenceId: quizId
    });

    return attempt;
  };

  const toggleVideoCompleted = (videoId: string) => {
    setCompletedVideoIds(prev =>
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
  };

  // Teacher Actions
  const createAssignment = (data: { title: string; topic: string; description: string; dueDate: string; totalPoints: number; attachmentName?: string }) => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newAsg: Assignment = {
      id: `asg_${Date.now()}`,
      ...data,
      assignedBy: currentUser.name,
      teacherId: currentUser.id,
      createdAt: dateString
    };
    setAssignments(prev => [newAsg, ...prev]);

    // Notify students of new assignment
    sendNotification({
      recipientRole: 'student',
      type: 'assignment_new',
      title: 'มีงานมอบหมายใหม่ในระบบ',
      message: `อ. ${currentUser.name} มอบหมายงานใหม่: "${data.title}" กำหนดส่ง ${data.dueDate} (${data.totalPoints} คะแนน)`,
      actionTab: 'assignments',
      referenceId: newAsg.id
    });
  };

  const gradeSubmission = (submissionId: string, score: number, feedback: string) => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const targetSub = submissions.find(s => s.id === submissionId);
    const targetAsg = targetSub ? assignments.find(a => a.id === targetSub.assignmentId) : undefined;

    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            score,
            feedback,
            status: 'graded',
            gradedBy: currentUser.name,
            gradedAt: dateString
          };
        }
        return sub;
      })
    );

    // Notify the specific student of their grade
    if (targetSub) {
      sendNotification({
        recipientRole: 'student',
        recipientId: targetSub.studentId,
        type: 'grade_update',
        title: 'ครูผู้สอนตรวจและให้คะแนนการบ้านแล้ว',
        message: `อ. ${currentUser.name} ตรวจงาน "${targetAsg?.title || 'การบ้าน'}" ได้ ${score}/${targetAsg?.totalPoints || 20} คะแนน ข้อความ: "${feedback.slice(0, 50)}..."`,
        actionTab: 'assignments',
        referenceId: targetSub.assignmentId
      });
    }
  };

  const createQuiz = (data: { title: string; topic: string; description: string; timeLimitMinutes: number; questions: Quiz['questions'] }) => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      ...data,
      createdById: currentUser.id,
      createdBy: currentUser.name,
      createdAt: dateString
    };
    setQuizzes(prev => [newQuiz, ...prev]);

    // Notify students of new quiz available
    sendNotification({
      recipientRole: 'student',
      type: 'assignment_new',
      title: 'มีแบบทดสอบใหม่พร้อมให้เข้าทดสอบ',
      message: `อ. ${currentUser.name} เปิดแบบทดสอบ: "${data.title}" เวลาทำ ${data.timeLimitMinutes} นาที จำนวน ${data.questions.length} ข้อ`,
      actionTab: 'quizzes',
      referenceId: newQuiz.id
    });
  };

  const uploadVideo = async (data: { 
    title: string; 
    topic: string; 
    description: string; 
    videoUrl: string; 
    duration: string; 
    thumbnailUrl?: string; 
    keyFormulas?: string[]; 
    summaryPoints?: string[];
    isUploadedFile?: boolean;
    fileName?: string;
    fileSize?: string;
    videoType?: 'file' | 'youtube' | 'external';
  }) => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Normalize YouTube URL if it's not a local file
    let processedUrl = data.videoUrl;
    const isFile = data.isUploadedFile || processedUrl.startsWith('/uploads/') || processedUrl.startsWith('data:video/') || processedUrl.startsWith('blob:');

    if (!isFile) {
      if (processedUrl.includes('watch?v=')) {
        processedUrl = processedUrl.replace('watch?v=', 'embed/');
      } else if (processedUrl.includes('youtu.be/')) {
        processedUrl = processedUrl.replace('youtu.be/', 'www.youtube.com/embed/');
      }
    }

    const newVideo: VideoLesson = {
      id: `vid_${Date.now()}`,
      ...data,
      videoUrl: processedUrl,
      uploadedById: currentUser.id,
      uploadedBy: currentUser.name,
      uploadedAt: dateString,
      thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
      isUploadedFile: isFile,
      videoType: data.videoType || (isFile ? 'file' : 'youtube')
    };

    setVideos(prev => [newVideo, ...prev]);

    // Send to central server so other devices (students/teachers) see it immediately
    try {
      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo)
      });
    } catch (e) {
      console.warn('Could not persist video to server API:', e);
    }
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const deleteQuiz = (id: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    fetch(`/api/videos/${id}`, { method: 'DELETE' }).catch(err => {
      console.warn('Failed to delete video on server:', err);
    });
  };

  const resetToDefaultData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
      localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
      localStorage.removeItem(STORAGE_KEYS.QUIZZES);
      localStorage.removeItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.VIDEOS);
      localStorage.removeItem(STORAGE_KEYS.COMPLETED_VIDEOS);
      localStorage.removeItem(STORAGE_KEYS.FORMULAS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.FORUM_QUESTIONS);
      localStorage.removeItem(STORAGE_KEYS.USERS);
    } catch (e) {
      console.warn('Storage clear error:', e);
    }

    setUsers(INITIAL_USERS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setQuizzes(INITIAL_QUIZZES);
    setQuizAttempts(INITIAL_QUIZ_ATTEMPTS);
    setVideos(INITIAL_VIDEOS);
    setCompletedVideoIds(['vid_1']);
    setFormulas(INITIAL_KNOWLEDGE_FORMULAS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setForumQuestions(INITIAL_FORUM_QUESTIONS);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated,
        setCurrentUser,
        switchRole,
        login,
        logout,
        registerUser,
        addUser,
        deleteUser,
        updateUser,
        assignments,
        submissions,
        quizzes,
        quizAttempts,
        videos,
        completedVideoIds,
        formulas,
        addFormula,
        deleteFormula,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        sendNotification,
        forumQuestions,
        createQuestion,
        addAnswer,
        toggleQuestionUpvote,
        toggleAnswerUpvote,
        acceptAnswer,
        deleteQuestion,
        submitAssignment,
        submitQuizAttempt,
        toggleVideoCompleted,
        createAssignment,
        gradeSubmission,
        createQuiz,
        uploadVideo,
        refreshVideos,
        syncWithServer,
        isServerSynced,
        lastSyncTime,
        deleteAssignment,
        deleteQuiz,
        deleteVideo,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );

};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
