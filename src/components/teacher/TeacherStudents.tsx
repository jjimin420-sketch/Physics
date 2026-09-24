import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Search, 
  Award, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';

export const TeacherStudents: React.FC = () => {
  const { users, submissions, assignments, quizAttempts, quizzes } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const students = users.filter(u => u.role === 'student');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper stats for a student
  const getStudentStats = (studentId: string) => {
    const studentSubs = submissions.filter(s => s.studentId === studentId);
    const gradedSubs = studentSubs.filter(s => s.status === 'graded');
    const totalPointsEarned = gradedSubs.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const totalPossiblePoints = assignments.reduce((acc, curr) => acc + curr.totalPoints, 0);

    const studentQuizzes = quizAttempts.filter(q => q.studentId === studentId);
    const avgQuizScore = studentQuizzes.length > 0
      ? Math.round(studentQuizzes.reduce((acc, curr) => acc + curr.percentage, 0) / studentQuizzes.length)
      : 0;

    const submissionRate = assignments.length > 0
      ? Math.round((studentSubs.length / assignments.length) * 100)
      : 0;

    return {
      submissionCount: studentSubs.length,
      submissionRate,
      totalPointsEarned,
      totalPossiblePoints,
      quizCount: studentQuizzes.length,
      avgQuizScore,
      studentSubs,
      studentQuizzes
    };
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            สมุดคะแนนและรายชื่อนักเรียน (Student Gradebook & Performance)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ตรวจสอบรายชื่อนักเรียน สถิติการส่งการบ้าน และคะแนนรวมแบบทดสอบทุกบทเรียน
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ / รหัสนักเรียน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56"
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">รหัส / นักเรียน</th>
                <th className="py-3.5 px-4">อัตราการส่งงาน</th>
                <th className="py-3.5 px-4">คะแนนเก็บการบ้าน</th>
                <th className="py-3.5 px-4">คะแนนเฉลี่ยแบบทดสอบ</th>
                <th className="py-3.5 px-4">การประเมินภาพรวม</th>
                <th className="py-3.5 px-4 text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map(st => {
                const stats = getStudentStats(st.id);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <div className="text-[11px] text-slate-400">{st.studentId} • {st.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700">{stats.submissionCount}/{assignments.length} งาน</span>
                          <span className="text-slate-400">{stats.submissionRate}%</span>
                        </div>
                        <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${stats.submissionRate >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${stats.submissionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm">{stats.totalPointsEarned}</span>
                      <span className="text-slate-400 text-xs"> / {stats.totalPossiblePoints} คะแนน</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {stats.quizCount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            stats.avgQuizScore >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {stats.avgQuizScore}%
                          </span>
                          <span className="text-[10px] text-slate-400">({stats.quizCount} ครั้ง)</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">ยังไม่เข้าสอบ</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {stats.submissionRate >= 66 && (stats.avgQuizScore >= 70 || stats.quizCount === 0) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ผลการเรียนดี
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> ต้องติดตามงาน
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudentId(st.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                      >
                        ดูใบคะแนน
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Student Score Breakdown Modal */}
      {selectedStudentId && (() => {
        const student = students.find(s => s.id === selectedStudentId);
        if (!student) return null;
        const stats = getStudentStats(student.id);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
                    <p className="text-xs text-slate-500">รหัสนักเรียน: {student.studentId} | {student.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudentId(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">✕</button>
              </div>

              {/* Quick KPI stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <div className="text-[10px] uppercase font-bold text-blue-600">การบ้านที่ส่ง</div>
                  <div className="text-lg font-bold text-blue-900 mt-0.5">{stats.submissionCount} / {assignments.length}</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <div className="text-[10px] uppercase font-bold text-emerald-600">คะแนนเก็บรวม</div>
                  <div className="text-lg font-bold text-emerald-900 mt-0.5">{stats.totalPointsEarned} คะแนน</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                  <div className="text-[10px] uppercase font-bold text-purple-600">คะแนนเฉลี่ยสอบ</div>
                  <div className="text-lg font-bold text-purple-900 mt-0.5">{stats.avgQuizScore}%</div>
                </div>
              </div>

              {/* Submissions Detail */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> ประวัติการส่งการบ้าน
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {assignments.map(asg => {
                    const sub = stats.studentSubs.find(s => s.assignmentId === asg.id);
                    return (
                      <div key={asg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">{asg.title}</div>
                          <div className="text-[10px] text-slate-400">กำหนดส่ง: {asg.dueDate}</div>
                        </div>
                        <div>
                          {sub ? (
                            sub.status === 'graded' ? (
                              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                ได้ {sub.score}/{asg.totalPoints} คะแนน
                              </span>
                            ) : (
                              <span className="font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                ส่งแล้ว (รอตรวจ)
                              </span>
                            )
                          ) : (
                            <span className="text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              ยังไม่ส่ง
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quizzes Detail */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" /> ประวัติการทำแบบทดสอบ
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {stats.studentQuizzes.length > 0 ? (
                    stats.studentQuizzes.map(att => {
                      const q = quizzes.find(item => item.id === att.quizId);
                      return (
                        <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800">{q?.title || 'แบบทดสอบ'}</div>
                            <div className="text-[10px] text-slate-400">ทดสอบเมื่อ: {att.completedAt}</div>
                          </div>
                          <span className="font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded">
                            {att.score}/{att.totalQuestions} ข้อ ({att.percentage}%)
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 italic">ยังไม่มีประวัติการทำแบบทดสอบ</p>
                  )}
                </div>
              </div>

              <div className="pt-2 text-right border-t border-slate-100">
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
