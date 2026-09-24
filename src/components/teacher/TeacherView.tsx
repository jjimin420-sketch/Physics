import React from 'react';
import { TeacherAssignments } from './TeacherAssignments';
import { TeacherSubmissions } from './TeacherSubmissions';
import { TeacherQuizzes } from './TeacherQuizzes';
import { TeacherVideos } from './TeacherVideos';
import { TeacherStudents } from './TeacherStudents';
import { KnowledgeRepository } from '../knowledge/KnowledgeRepository';
import { ForumView } from '../forum/ForumView';
import { FileText, CheckSquare, HelpCircle, Tv, Users, BookOpen, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TeacherViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({ activeTab, setActiveTab }) => {
  const { submissions } = useApp();
  const pendingCount = submissions.filter(s => s.status === 'submitted').length;

  return (
    <div className="space-y-6">
      {/* Teacher Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          id="teacher-tab-assignments"
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>สั่งงาน / จัดการการบ้าน</span>
        </button>

        <button
          id="teacher-tab-submissions"
          onClick={() => setActiveTab('submissions')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>ตรวจงานนักเรียน</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          id="teacher-tab-quizzes"
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'quizzes'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>ทำข้อสอบ / แบบทดสอบ</span>
        </button>

        <button
          id="teacher-tab-videos"
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>อัปคลิปการสอน</span>
        </button>

        <button
          id="teacher-tab-students"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ดูชื่อและคะแนนนักเรียน</span>
        </button>

        <button
          id="teacher-tab-repository"
          onClick={() => setActiveTab('repository')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'repository'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>คลังความรู้ & ฐานข้อมูลสูตร</span>
        </button>

        <button
          id="teacher-tab-forum"
          onClick={() => setActiveTab('forum')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'forum'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>เว็บบอร์ดถาม-ตอบ Q&A</span>
        </button>
      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'assignments' && <TeacherAssignments />}
      {activeTab === 'submissions' && <TeacherSubmissions />}
      {activeTab === 'quizzes' && <TeacherQuizzes />}
      {activeTab === 'videos' && <TeacherVideos />}
      {activeTab === 'students' && <TeacherStudents />}
      {activeTab === 'repository' && <KnowledgeRepository />}
      {activeTab === 'forum' && <ForumView />}
    </div>
  );
};

