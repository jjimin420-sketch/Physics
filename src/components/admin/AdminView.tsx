import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserManagement } from './UserManagement';
import { AdminReportModal } from './AdminReportModal';
import { 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Tv, 
  HelpCircle, 
  Award, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  RotateCcw, 
  Download, 
  Sparkles,
  BarChart3,
  Calendar,
  AlertCircle,
  KeyRound,
  Printer,
  Check
} from 'lucide-react';

export interface AdminViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigateTab }) => {
  const { 
    users, 
    assignments, 
    submissions, 
    quizzes, 
    quizAttempts, 
    videos, 
    resetToDefaultData,
    formulas,
    forumQuestions
  } = useApp();
  const [selectedSubTab, setSelectedSubTab] = useState<'overview' | 'users' | 'teachers' | 'students' | 'topics'>('overview');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [resetToastMessage, setResetToastMessage] = useState<string | null>(null);

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');

  // Overall calculations
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.status === 'graded').length;
  const pendingSubmissions = submissions.filter(s => s.status === 'submitted').length;
  const gradingRate = totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 100;

  const totalPossibleSubmissions = students.length * assignments.length;
  const studentSubmissionRate = totalPossibleSubmissions > 0 
    ? Math.round((totalSubmissions / totalPossibleSubmissions) * 100) 
    : 0;

  const totalQuizAttempts = quizAttempts.length;
  const avgQuizScore = totalQuizAttempts > 0 
    ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizAttempts) 
    : 0;

  // Teachers stats breakdown
  const teacherStats = teachers.map(t => {
    const tAssignments = assignments.filter(a => a.teacherId === t.id || a.assignedBy.includes(t.name.split(' ')[1] || ''));
    const tVideos = videos.filter(v => v.uploadedById === t.id || v.uploadedBy.includes(t.name.split(' ')[1] || ''));
    const tQuizzes = quizzes.filter(q => q.createdById === t.id || q.createdBy.includes(t.name.split(' ')[1] || ''));
    
    // Submissions for assignments created by this teacher
    const tAssignmentIds = tAssignments.map(a => a.id);
    const relatedSubmissions = submissions.filter(s => tAssignmentIds.includes(s.assignmentId));
    const tGraded = relatedSubmissions.filter(s => s.status === 'graded').length;

    return {
      teacher: t,
      assignmentsCount: tAssignments.length,
      videosCount: tVideos.length,
      quizzesCount: tQuizzes.length,
      totalSubmissionsToGrade: relatedSubmissions.length,
      gradedCount: tGraded,
      gradingRate: relatedSubmissions.length > 0 ? Math.round((tGraded / relatedSubmissions.length) * 100) : 100
    };
  });

  // Students stats breakdown
  const studentStats = students.map(st => {
    const stSubs = submissions.filter(s => s.studentId === st.id);
    const stGraded = stSubs.filter(s => s.status === 'graded');
    const stPoints = stGraded.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const stQuizzes = quizAttempts.filter(q => q.studentId === st.id);
    const stAvgQuiz = stQuizzes.length > 0 
      ? Math.round(stQuizzes.reduce((acc, curr) => acc + curr.percentage, 0) / stQuizzes.length) 
      : 0;

    return {
      student: st,
      submissionCount: stSubs.length,
      submissionRate: assignments.length > 0 ? Math.round((stSubs.length / assignments.length) * 100) : 0,
      totalPointsEarned: stPoints,
      quizAttemptsCount: stQuizzes.length,
      avgQuizScore: stAvgQuiz
    };
  });

  // Topics breakdown
  const allTopics = Array.from(new Set([
    ...assignments.map(a => a.topic),
    ...videos.map(v => v.topic),
    ...quizzes.map(q => q.topic)
  ]));

  return (
    <div className="space-y-6">
      {/* Admin Top Dashboard Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-200 border border-purple-400/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> แผงควบคุมและสรุปรายงานข้อมูลสำหรับผู้ดูแลระบบ (Admin Analytics)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            สรุปภาพรวมการทำงานของนักเรียนและครูผู้สอน
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            วิเคราะห์ประสิทธิผลการจัดการเรียนรู้วิชาฟิสิกส์ การส่งงานและการตรวจให้คะแนน พร้อมสถิติความก้าวหน้าของผู้เรียน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> พิมพ์ / ส่งออกรายงาน
          </button>
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600/80 hover:bg-rose-600 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ตข้อมูล
          </button>
        </div>
      </div>

      {/* Success Toast Notification */}
      {resetToastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-semibold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{resetToastMessage}</span>
          </div>
          <button
            onClick={() => setResetToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            ปิด
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">นักเรียนในระบบ</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{students.length} คน</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{studentSubmissionRate}%</span> อัตราส่งงานเฉลี่ย
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">ครูผู้สอนฟิสิกส์</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{teachers.length} ท่าน</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="text-blue-600 font-semibold">{assignments.length} ชิ้นงาน</span> สั่งในระบบ
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">การตรวจให้คะแนน</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{gradingRate}%</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>ตรวจแล้ว {gradedSubmissions}</span> / {totalSubmissions} งาน
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">คะแนนเฉลี่ยข้อสอบ</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{avgQuizScore}%</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>ทดสอบทั้งหมด {totalQuizAttempts} ครั้ง</span>
          </div>
        </div>
      </div>

      {/* Community & Knowledge Quick Access Banner for Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">ฐานข้อมูลฟิสิกส์ (Knowledge Repository)</span>
            <h4 className="text-base font-bold text-slate-900">
              {formulas.length} สูตรคำนวณและตัวอย่างโจทย์
            </h4>
            <p className="text-xs text-slate-600">
              ครอบคลุม {new Set(formulas.map(f => f.topic)).size} หัวข้อหลัก พร้อมโหมดคำนวณสูตรสด
            </p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('repository')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
            >
              เปิดดูคลังสูตร →
            </button>
          )}
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">ชุมชนถาม-ตอบ (Q&A Forum)</span>
            <h4 className="text-base font-bold text-slate-900">
              {forumQuestions.length} กระทู้คำถาม ({forumQuestions.filter(q => q.status === 'solved').length} ได้รับคำตอบแล้ว)
            </h4>
            <p className="text-xs text-slate-600">
              {forumQuestions.reduce((acc, q) => acc + q.answers.length, 0)} คำตอบจากครูและเพื่อนนักเรียน
            </p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('forum')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
            >
              เข้าสู่เว็บบอร์ด →
            </button>
          )}
        </div>
      </div>


      {/* Sub-tabs for Admin Detail */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setSelectedSubTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedSubTab === 'overview'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ภาพรวมและการทำงานร่วมกัน
        </button>

        <button
          onClick={() => setSelectedSubTab('users')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedSubTab === 'users'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-purple-600" />
          <span>จัดการบัญชีและรหัสผ่านผู้ใช้ ({users.length})</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('teachers')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedSubTab === 'teachers'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          สรุปการทำงานของครู ({teachers.length})
        </button>

        <button
          onClick={() => setSelectedSubTab('students')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedSubTab === 'students'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          สรุปการทำงานของนักเรียน ({students.length})
        </button>

        <button
          onClick={() => setSelectedSubTab('topics')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedSubTab === 'topics'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          วิเคราะห์ตามหมวดเนื้อหาฟิสิกส์
        </button>
      </div>

      {/* SUB TAB: USER MANAGEMENT */}
      {selectedSubTab === 'users' && (
        <UserManagement />
      )}

      {/* SUB TAB 1: OVERVIEW */}
      {selectedSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Box Teacher Workload */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                สรุปภาระงานและการสอนของครู (Teacher Workload)
              </h3>
              <span className="text-xs text-slate-400">กลุ่มสาระการเรียนรู้ฟิสิกส์</span>
            </div>

            <div className="space-y-3">
              {teacherStats.map(stat => (
                <div key={stat.teacher.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={stat.teacher.avatar} alt={stat.teacher.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{stat.teacher.name}</div>
                        <div className="text-[10px] text-slate-400">{stat.teacher.teacherSubject}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      ตรวจงานแล้ว {stat.gradingRate}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400">สั่งงาน</div>
                      <div className="font-bold text-slate-800">{stat.assignmentsCount} ชิ้น</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400">คลิปวิดีโอ</div>
                      <div className="font-bold text-slate-800">{stat.videosCount} คลิป</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400">สร้างข้อสอบ</div>
                      <div className="font-bold text-slate-800">{stat.quizzesCount} ชุด</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Box Student Engagement */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                สรุปการมีส่วนร่วมและการส่งงานของนักเรียน (Student Engagement)
              </h3>
              <span className="text-xs text-slate-400">ห้องเรียน ม.5 - ม.6</span>
            </div>

            <div className="space-y-3">
              {studentStats.map(stat => (
                <div key={stat.student.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={stat.student.avatar} alt={stat.student.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{stat.student.name}</div>
                        <div className="text-[10px] text-slate-400">{stat.student.studentId}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      stat.submissionRate >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      ส่งงาน {stat.submissionCount}/{assignments.length} ({stat.submissionRate}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400">คะแนนเก็บสะสม</div>
                      <div className="font-bold text-emerald-700">{stat.totalPointsEarned} คะแนน</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-400">เฉลี่ยทำแบบทดสอบ</div>
                      <div className="font-bold text-purple-700">{stat.avgQuizScore}% ({stat.quizAttemptsCount} ครั้ง)</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: TEACHERS TABLE */}
      {selectedSubTab === 'teachers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              รายละเอียดข้อมูลสรุปการทำงานของครูผู้สอน
            </h3>
            <span className="text-xs text-slate-400">อัปเดตแบบเรียลไทม์</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">ครูผู้สอน</th>
                  <th className="py-3.5 px-4">วิชาที่รับผิดชอบ</th>
                  <th className="py-3.5 px-4 text-center">สั่งการบ้าน</th>
                  <th className="py-3.5 px-4 text-center">อัปคลิปการสอน</th>
                  <th className="py-3.5 px-4 text-center">สร้างข้อสอบ</th>
                  <th className="py-3.5 px-4 text-center">การตรวจงาน</th>
                  <th className="py-3.5 px-4 text-right">สถานะความคืบหน้า</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teacherStats.map(stat => (
                  <tr key={stat.teacher.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={stat.teacher.avatar} alt={stat.teacher.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-slate-900">{stat.teacher.name}</div>
                          <div className="text-[11px] text-slate-400">{stat.teacher.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {stat.teacher.teacherSubject}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {stat.assignmentsCount}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {stat.videosCount}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {stat.quizzesCount}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-slate-800">{stat.gradedCount}</span>
                      <span className="text-slate-400">/{stat.totalSubmissionsToGrade} ชิ้น</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {stat.gradingRate}% เสร็จสิ้น
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 3: STUDENTS TABLE */}
      {selectedSubTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              รายละเอียดข้อมูลสรุปผลการเรียนและกิจกรรมของนักเรียน
            </h3>
            <span className="text-xs text-slate-400">ประเมินผลสัมฤทธิ์ฟิสิกส์</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">รหัส / นักเรียน</th>
                  <th className="py-3.5 px-4 text-center">ส่งการบ้าน</th>
                  <th className="py-3.5 px-4 text-center">คะแนนเก็บที่ได้</th>
                  <th className="py-3.5 px-4 text-center">ทำข้อสอบ (ครั้ง)</th>
                  <th className="py-3.5 px-4 text-center">คะแนนสอบเฉลี่ย</th>
                  <th className="py-3.5 px-4 text-right">เกรดจำลองเบื้องต้น</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentStats.map(stat => {
                  const projectedScore = stat.totalPointsEarned + (stat.avgQuizScore * 0.4);
                  let grade = 'B';
                  if (projectedScore >= 45) grade = 'A';
                  else if (projectedScore >= 35) grade = 'B+';
                  else if (projectedScore >= 25) grade = 'B';
                  else grade = 'C';

                  return (
                    <tr key={stat.student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img src={stat.student.avatar} alt={stat.student.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="font-bold text-slate-900">{stat.student.name}</div>
                            <div className="text-[11px] text-slate-400">{stat.student.studentId} • {stat.student.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800">{stat.submissionCount}</span>
                        <span className="text-slate-400">/{assignments.length} ({stat.submissionRate}%)</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {stat.totalPointsEarned} คะแนน
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                        {stat.quizAttemptsCount}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-purple-700">
                        {stat.avgQuizScore}%
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="px-3 py-1 rounded-lg font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                          ระดับ {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 4: TOPICS BREAKDOWN */}
      {selectedSubTab === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {allTopics.map(top => {
            const topAsg = assignments.filter(a => a.topic === top);
            const topVid = videos.filter(v => v.topic === top);
            const topQuiz = quizzes.filter(q => q.topic === top);

            return (
              <div key={top} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{top}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold">
                    สาระฟิสิกส์
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500">การบ้าน</div>
                    <div className="font-bold text-blue-700 text-sm mt-0.5">{topAsg.length}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500">วิดีโอคลิป</div>
                    <div className="font-bold text-indigo-700 text-sm mt-0.5">{topVid.length}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500">ชุดแบบทดสอบ</div>
                    <div className="font-bold text-purple-700 text-sm mt-0.5">{topQuiz.length}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Report & Export Modal */}
      <AdminReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Admin Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              ยืนยันการคืนค่าข้อมูลเริ่มต้นของระบบ?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              การกระทำนี้จะล้างประวัติการส่งการบ้าน คะแนนที่ตรวจแล้ว ผลการทำแบบทดสอบ และรายการที่เพิ่มใหม่ทั้งหมด โดยจะคืนค่าสู่ข้อมูลตัวอย่างเริ่มต้นของวิชาฟิสิกส์
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaultData();
                  setIsResetConfirmOpen(false);
                  setResetToastMessage('คืนค่าข้อมูลเริ่มต้นของระบบเรียบร้อยแล้ว');
                  setTimeout(() => setResetToastMessage(null), 3500);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md shadow-rose-500/20 cursor-pointer"
              >
                ยืนยันรีเซ็ตข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
