import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginView } from './components/auth/LoginView';
import { StudentView } from './components/student/StudentView';
import { TeacherView } from './components/teacher/TeacherView';
import { AdminView } from './components/admin/AdminView';
import { KnowledgeRepository } from './components/knowledge/KnowledgeRepository';
import { ForumView } from './components/forum/ForumView';
import { 
  Atom, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Info,
  ArrowLeft
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<string>('assignments');

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Prompt',sans-serif]">
      {/* Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Role Banner / Context Bar */}
      <section className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xs py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">มุมมองปัจจุบัน:</span>
            {currentUser.role === 'student' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                นักเรียน: {currentUser.name} ({currentUser.studentId}) • @{currentUser.username || currentUser.id}
              </span>
            )}
            {currentUser.role === 'teacher' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-blue-50 text-blue-800 border border-blue-200">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                ครูผู้สอน: {currentUser.name} ({currentUser.teacherSubject}) • @{currentUser.username || currentUser.id}
              </span>
            )}
            {currentUser.role === 'admin' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-purple-50 text-purple-800 border border-purple-200">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                ผู้ดูแลระบบ: {currentUser.name} • @{currentUser.username || currentUser.id}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {currentUser.role === 'student' && 'ส่งงาน • ดูคลิปย้อนหลัง • ทำแบบทดสอบ • คลังสูตร • ถาม-ตอบ Q&A'}
              {currentUser.role === 'teacher' && 'สั่งงานการบ้าน • ตรวจให้คะแนน • ทำข้อสอบ • อัปคลิปการสอน • ตอบข้อซักถาม'}
              {currentUser.role === 'admin' && 'สรุปผลข้อมูลการทำงานของนักเรียนและครูภาพรวม • จัดการบัญชีและดูรหัสผ่านผู้ใช้'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Role Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentUser.role === 'student' && (
          <StudentView activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        {currentUser.role === 'teacher' && (
          <TeacherView activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        {currentUser.role === 'admin' && (
          activeTab === 'repository' ? (
            <div className="space-y-4">
              <button 
                onClick={() => setActiveTab('summary')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                กลับสู่สรุปข้อมูลภาพรวมแอดมิน
              </button>
              <KnowledgeRepository />
            </div>
          ) : activeTab === 'forum' ? (
            <div className="space-y-4">
              <button 
                onClick={() => setActiveTab('summary')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                กลับสู่สรุปข้อมูลภาพรวมแอดมิน
              </button>
              <ForumView />
            </div>
          ) : (
            <AdminView onNavigateTab={(tab) => setActiveTab(tab)} />
          )
        )}
      </main>

      {/* Footer */}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">PhysicsPortal</span> — แพลตฟอร์มการจัดการเรียนการสอนฟิสิกส์
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>รองรับนักเรียน ครู และผู้บริหารการศึกษา</span>
            <span>•</span>
            <span>วิทยาศาสตร์และฟิสิกส์ประยุกต์</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
