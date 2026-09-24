import React from 'react';
import { StudentAssignments } from './StudentAssignments';
import { StudentVideos } from './StudentVideos';
import { StudentQuizzes } from './StudentQuizzes';
import { KnowledgeRepository } from '../knowledge/KnowledgeRepository';
import { ForumView } from '../forum/ForumView';
import { FileText, Tv, HelpCircle, BookOpen, MessageSquare } from 'lucide-react';

interface StudentViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          id="student-tab-assignments"
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>การบ้านและส่งงาน</span>
        </button>

        <button
          id="student-tab-videos"
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>ดูวิดีโอย้อนหลัง</span>
        </button>

        <button
          id="student-tab-quizzes"
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'quizzes'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>ทำแบบทดสอบ</span>
        </button>

        <button
          id="student-tab-repository"
          onClick={() => setActiveTab('repository')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'repository'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>คลังความรู้ & ฐานข้อมูลสูตร</span>
        </button>

        <button
          id="student-tab-forum"
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

      {/* Tab Content */}
      {activeTab === 'assignments' && <StudentAssignments />}
      {activeTab === 'videos' && <StudentVideos />}
      {activeTab === 'quizzes' && <StudentQuizzes />}
      {activeTab === 'repository' && <KnowledgeRepository />}
      {activeTab === 'forum' && <ForumView />}
    </div>
  );
};

