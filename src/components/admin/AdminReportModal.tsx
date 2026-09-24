import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Download, 
  Printer, 
  Check, 
  Copy, 
  X, 
  Calendar, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Award,
  Sparkles,
  ExternalLink,
  Table
} from 'lucide-react';

interface AdminReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminReportModal: React.FC<AdminReportModalProps> = ({ isOpen, onClose }) => {
  const { 
    users, 
    assignments, 
    submissions, 
    quizzes, 
    quizAttempts, 
    videos, 
    currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'preview' | 'exports'>('preview');
  const [copied, setCopied] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');

  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.status === 'graded').length;
  const gradingRate = totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 100;
  const totalPossible = students.length * assignments.length;
  const submissionRate = totalPossible > 0 ? Math.round((totalSubmissions / totalPossible) * 100) : 0;
  const totalQuizAttempts = quizAttempts.length;
  const avgQuizScore = totalQuizAttempts > 0 
    ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizAttempts) 
    : 0;

  const todayStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const nowTime = new Date().toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate student stats
  const studentStats = students.map(st => {
    const stSubs = submissions.filter(s => s.studentId === st.id);
    const stGraded = stSubs.filter(s => s.status === 'graded');
    const stPoints = stGraded.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const stQuizzes = quizAttempts.filter(q => q.studentId === st.id);
    const stAvgQuiz = stQuizzes.length > 0 
      ? Math.round(stQuizzes.reduce((acc, curr) => acc + curr.percentage, 0) / stQuizzes.length) 
      : 0;
    
    // Simple projection grade
    const projectedScore = (stPoints / Math.max(assignments.length * 20, 20)) * 50 + (stAvgQuiz * 0.5);
    let grade = 'B';
    if (projectedScore >= 80) grade = 'A';
    else if (projectedScore >= 70) grade = 'B+';
    else if (projectedScore >= 60) grade = 'B';
    else if (projectedScore >= 50) grade = 'C';
    else grade = 'D';

    return {
      student: st,
      submissionCount: stSubs.length,
      submissionRate: assignments.length > 0 ? Math.round((stSubs.length / assignments.length) * 100) : 0,
      totalPoints: stPoints,
      quizAttempts: stQuizzes.length,
      avgQuizScore: stAvgQuiz,
      grade
    };
  });

  // Calculate teacher stats
  const teacherStats = teachers.map(t => {
    const tAssignments = assignments.filter(a => a.teacherId === t.id || a.assignedBy.includes(t.name.split(' ')[1] || ''));
    const tVideos = videos.filter(v => v.uploadedById === t.id || v.uploadedBy.includes(t.name.split(' ')[1] || ''));
    const tQuizzes = quizzes.filter(q => q.createdById === t.id || q.createdBy.includes(t.name.split(' ')[1] || ''));
    
    const tAssignmentIds = tAssignments.map(a => a.id);
    const relatedSubmissions = submissions.filter(s => tAssignmentIds.includes(s.assignmentId));
    const tGraded = relatedSubmissions.filter(s => s.status === 'graded').length;

    return {
      teacher: t,
      assignmentsCount: tAssignments.length,
      videosCount: tVideos.length,
      quizzesCount: tQuizzes.length,
      submissionsCount: relatedSubmissions.length,
      gradedCount: tGraded,
      gradingRate: relatedSubmissions.length > 0 ? Math.round((tGraded / relatedSubmissions.length) * 100) : 100
    };
  });

  // Helper for CSV export
  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent = rows
      .map(row => 
        row.map(field => {
          const str = String(field ?? '').replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      )
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessMessage(`ส่งออกไฟล์ "${filename}" สำเร็จแล้ว`);
    setTimeout(() => setDownloadSuccessMessage(null), 3000);
  };

  const exportOverviewCSV = () => {
    const rows = [
      ['รายงานสรุปภาพรวมระบบจัดการเรียนรู้วิชาฟิสิกส์ (PhysicsPortal Overview Report)'],
      ['โรงเรียนชลกันยานุกูล', `วันที่จัดทำ: ${todayStr} เวลา ${nowTime}`, `ผู้จัดทำ: ${currentUser.name}`],
      [''],
      ['ตัวชี้วัด (KPIs)', 'จำนวน', 'หน่วย', 'หมายเหตุ'],
      ['จำนวนนักเรียนในระบบ', students.length, 'คน', 'ผู้เรียนทั้งหมด'],
      ['จำนวนครูผู้สอน', teachers.length, 'ท่าน', 'ผู้จัดการเรียนรู้'],
      ['การบ้านทั้งหมดที่มอบหมาย', assignments.length, 'ชิ้นงาน', '-'],
      ['การส่งการบ้านสะสม', totalSubmissions, 'ครั้ง', `คิดเป็นอัตราการส่งงาน ${submissionRate}%`],
      ['การบ้านที่ครูตรวจแล้ว', gradedSubmissions, 'ชิ้นงาน', `คิดเป็นความคืบหน้าการตรวจ ${gradingRate}%`],
      ['ชุดแบบทดสอบวัดผล', quizzes.length, 'ชุด', '-'],
      ['จำนวนครั้งที่ทำแบบทดสอบ', totalQuizAttempts, 'ครั้ง', '-'],
      ['คะแนนเฉลี่ยแบบทดสอบ', `${avgQuizScore}%`, 'ร้อยละ', 'ค่าเฉลี่ยทั้งระบบ'],
      ['จำนวนวิดีโอคลิปการสอน', videos.length, 'คลิป', 'ในคลังบทเรียน']
    ];
    downloadCSV(`PhysicsPortal_Overview_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };

  const exportStudentsCSV = () => {
    const rows = [
      ['รายงานผลการเรียนและการส่งงานนักเรียนรายบุคคล (PhysicsPortal Student Performance)'],
      ['โรงเรียนชลกันยานุกูล', `วันที่ออกรายงาน: ${todayStr}`],
      [''],
      ['รหัสนักเรียน', 'ชื่อ-นามสกุล', 'อีเมล', 'ส่งการบ้าน (งาน)', 'อัตราส่งงาน (%)', 'คะแนนเก็บสะสม', 'ทำแบบทดสอบ (ครั้ง)', 'คะแนนสอบเฉลี่ย (%)', 'เกรดประเมิน']
    ];

    studentStats.forEach(st => {
      rows.push([
        st.student.studentId || '-',
        st.student.name,
        st.student.email,
        st.submissionCount,
        `${st.submissionRate}%`,
        st.totalPoints,
        st.quizAttempts,
        `${st.avgQuizScore}%`,
        st.grade
      ]);
    });

    downloadCSV(`PhysicsPortal_Students_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };

  const exportTeachersCSV = () => {
    const rows = [
      ['รายงานภาระงานสอนและการตรวจการบ้านของครู (PhysicsPortal Teacher Workload)'],
      ['โรงเรียนชลกันยานุกูล', `วันที่ออกรายงาน: ${todayStr}`],
      [''],
      ['ชื่อ-นามสกุลครู', 'วิชา/สาระที่สอน', 'อีเมล', 'การบ้านที่มอบหมาย (งาน)', 'วิดีโอที่อัปโหลด (คลิป)', 'แบบทดสอบที่สร้าง (ชุด)', 'งานที่ต้องตรวจ (ชิ้น)', 'ตรวจแล้ว (ชิ้น)', 'ความคืบหน้าตรวจ (%)']
    ];

    teacherStats.forEach(t => {
      rows.push([
        t.teacher.name,
        t.teacher.teacherSubject || 'ฟิสิกส์',
        t.teacher.email,
        t.assignmentsCount,
        t.videosCount,
        t.quizzesCount,
        t.submissionsCount,
        t.gradedCount,
        `${t.gradingRate}%`
      ]);
    });

    downloadCSV(`PhysicsPortal_Teachers_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };

  const exportUsersCSV = () => {
    const rows = [
      ['รายชื่อบัญชีผู้ใช้และข้อมูลการเข้าสู่ระบบ PhysicsPortal (User Credentials List)'],
      ['โรงเรียนชลกันยานุกูล', `ส่งออกโดย: ${currentUser.name}`, `วันที่: ${todayStr}`],
      [''],
      ['ลำดับ', 'ชื่อ-นามสกุล', 'บทบาท (Role)', 'ชื่อผู้ใช้ (Username)', 'รหัสผ่าน (Password)', 'อีเมล', 'รหัสนักเรียน/วิชา']
    ];

    users.forEach((u, index) => {
      rows.push([
        index + 1,
        u.name,
        u.role === 'student' ? 'นักเรียน' : u.role === 'teacher' ? 'ครูผู้สอน' : 'ผู้ดูแลระบบ',
        u.username || u.id,
        u.password || 'password123',
        u.email,
        u.studentId || u.teacherSubject || '-'
      ]);
    });

    downloadCSV(`PhysicsPortal_Users_Credentials_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Direct print blocked by sandbox:', err);
    }
  };

  const copyTextSummary = () => {
    const summaryText = `[รายงานสรุปการจัดการเรียนรู้วิชาฟิสิกส์ออนไลน์ - โรงเรียนชลกันยานุกูล]
วันที่: ${todayStr} (${nowTime})
ผู้จัดทำ: ${currentUser.name} (ผู้ดูแลระบบ)

📊 ตัวเลขสถิติภาพรวม:
- นักเรียนทั้งหมด: ${students.length} คน | ครูผู้สอน: ${teachers.length} ท่าน
- การบ้านที่มอบหมาย: ${assignments.length} ชิ้น | การส่งการบ้านสะสม: ${totalSubmissions} ครั้ง (${submissionRate}%)
- ความคืบหน้าการตรวจงานของครู: ${gradedSubmissions}/${totalSubmissions} ชิ้น (${gradingRate}%)
- ชุดแบบทดสอบ: ${quizzes.length} ชุด | ทดสอบแล้ว: ${totalQuizAttempts} ครั้ง (คะแนนเฉลี่ย: ${avgQuizScore}%)
- วิดีโอคลิปการสอนในคลัง: ${videos.length} คลิป

🏆 นักเรียนผลงานดีเด่น (Top Students):
${studentStats.slice(0, 3).map((st, i) => `${i+1}. ${st.student.name} (${st.student.studentId}) - ส่งงาน ${st.submissionCount}/${assignments.length} งาน | สอบเฉลี่ย ${st.avgQuizScore}% | เกรด ${st.grade}`).join('\n')}

👨‍🏫 ภาระงานครูผู้สอน:
${teacherStats.map(t => `- ${t.teacher.name}: มอบหมาย ${t.assignmentsCount} งาน, คลิปสอน ${t.videosCount} คลิป, ตรวจงานแล้ว ${t.gradingRate}%`).join('\n')}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header - Hidden when printing */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ศูนย์พิมพ์และส่งออกรายงานวิชาการ
              </h3>
              <p className="text-xs text-slate-500">
                โรงเรียนชลกันยานุกูล • Chonkanya Physics Learning Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ดูตัวอย่าง & สั่งพิมพ์
              </button>
              <button
                onClick={() => setActiveTab('exports')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'exports'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ดาวน์โหลดไฟล์ CSV (Excel)
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {downloadSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs text-emerald-800 font-semibold flex items-center justify-between print:hidden">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {downloadSuccessMessage}
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {activeTab === 'preview' ? (
            <div id="printable-admin-report" className="space-y-6 text-slate-900 max-w-3xl mx-auto bg-white p-2 print:p-0">
              
              {/* Report Letterhead Header */}
              <div className="border-b-2 border-slate-800 pb-5 text-center">
                <div className="flex items-center justify-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-900 text-white flex items-center justify-center text-xs font-black">
                    CK
                  </div>
                  <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                    โรงเรียนชลกันยานุกูล
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  รายงานสรุปผลการจัดการเรียนรู้วิชาฟิสิกส์ออนไลน์
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี • ภาคเรียนที่ 1 ปีการศึกษา 2569
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 mt-2 font-medium">
                  <span>วันที่ออกรายงาน: <strong>{todayStr}</strong> เวลา {nowTime}</span>
                  <span>•</span>
                  <span>ผู้ออกรายงาน: <strong>{currentUser.name}</strong> ({currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'อาจารย์'})</span>
                </div>
              </div>

              {/* Summary KPIs 4-Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center print:border-slate-400">
                  <div className="text-[11px] font-semibold text-slate-500">การบ้านที่ส่งสะสม</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{totalSubmissions} ครั้ง</div>
                  <div className="text-[10px] text-emerald-600 font-bold">อัตราส่งงาน {submissionRate}%</div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center print:border-slate-400">
                  <div className="text-[11px] font-semibold text-slate-500">การตรวจให้คะแนน</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{gradedSubmissions} งาน</div>
                  <div className="text-[10px] text-blue-600 font-bold">ความคืบหน้า {gradingRate}%</div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center print:border-slate-400">
                  <div className="text-[11px] font-semibold text-slate-500">แบบทดสอบวัดผล</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{totalQuizAttempts} ครั้ง</div>
                  <div className="text-[10px] text-purple-600 font-bold">เฉลี่ย {avgQuizScore}%</div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center print:border-slate-400">
                  <div className="text-[11px] font-semibold text-slate-500">ผู้ใช้งานในระบบ</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{users.length} คน</div>
                  <div className="text-[10px] text-slate-600 font-bold">นักเรียน {students.length} | ครู {teachers.length}</div>
                </div>
              </div>

              {/* Table 1: Student Performances */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  สถิติความก้าวหน้าและการวัดผลของนักเรียน ({students.length} คน)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-400">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold print:bg-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">รหัสนักเรียน</th>
                        <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                        <th className="py-2.5 px-3 text-center">ส่งงาน (งาน)</th>
                        <th className="py-2.5 px-3 text-center">คะแนนเก็บ</th>
                        <th className="py-2.5 px-3 text-center">ทดสอบ (ครั้ง)</th>
                        <th className="py-2.5 px-3 text-center">สอบเฉลี่ย</th>
                        <th className="py-2.5 px-3 text-center">เกรดประเมิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentStats.map((st) => (
                        <tr key={st.student.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500">{st.student.studentId || '-'}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{st.student.name}</td>
                          <td className="py-2 px-3 text-center">{st.submissionCount}/{assignments.length} ({st.submissionRate}%)</td>
                          <td className="py-2 px-3 text-center font-bold text-emerald-700">{st.totalPoints}</td>
                          <td className="py-2 px-3 text-center">{st.quizAttempts}</td>
                          <td className="py-2 px-3 text-center font-bold text-purple-700">{st.avgQuizScore}%</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-800">{st.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Teacher Workload */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  ภาระงานสอนและการตรวจการบ้านของครูผู้สอน ({teachers.length} ท่าน)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-400">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold print:bg-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">ชื่อครูผู้สอน</th>
                        <th className="py-2.5 px-3">วิชา/กลุ่มสาระ</th>
                        <th className="py-2.5 px-3 text-center">การบ้านที่สั่ง</th>
                        <th className="py-2.5 px-3 text-center">วิดีโอคลิป</th>
                        <th className="py-2.5 px-3 text-center">แบบทดสอบ</th>
                        <th className="py-2.5 px-3 text-center">ตรวจแล้ว / ทั้งหมด</th>
                        <th className="py-2.5 px-3 text-center">ความคืบหน้า (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teacherStats.map((t) => (
                        <tr key={t.teacher.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">{t.teacher.name}</td>
                          <td className="py-2 px-3 text-slate-500">{t.teacher.teacherSubject || 'ฟิสิกส์'}</td>
                          <td className="py-2 px-3 text-center">{t.assignmentsCount} งาน</td>
                          <td className="py-2 px-3 text-center">{t.videosCount} คลิป</td>
                          <td className="py-2 px-3 text-center">{t.quizzesCount} ชุด</td>
                          <td className="py-2 px-3 text-center font-mono">{t.gradedCount} / {t.submissionsCount}</td>
                          <td className="py-2 px-3 text-center font-bold text-blue-700">{t.gradingRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures Block for Official Printing */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="h-14 border-b border-dotted border-slate-400 w-48 mx-auto" />
                  <p className="mt-2 font-bold text-slate-800">({currentUser.name})</p>
                  <p className="text-[11px] text-slate-500">ผู้ดูแลระบบสารสนเทศ / ผู้จัดทำรายงาน</p>
                </div>
                <div>
                  <div className="h-14 border-b border-dotted border-slate-400 w-48 mx-auto" />
                  <p className="mt-2 font-bold text-slate-800">( ............................................................ )</p>
                  <p className="text-[11px] text-slate-500">หัวหน้ากลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี</p>
                </div>
              </div>

            </div>
          ) : (
            /* EXPORT FILES TAB */
            <div className="space-y-4 max-w-2xl mx-auto py-2">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <div className="flex items-center gap-2.5 text-purple-900 font-bold text-sm mb-1">
                  <Download className="w-4 h-4 text-purple-600" />
                  ส่งออกข้อมูลเป็นไฟล์ Excel / CSV (Export Datasets)
                </div>
                <p className="text-xs text-purple-800/80 leading-relaxed">
                  ไฟล์ที่ส่งออกทั้งหมดรองรับภาษาไทย 100% (UTF-8 BOM) สามารถเปิดใช้งานและคำนวณสูตรต่อใน Microsoft Excel, Google Sheets, หรือ Numbers ได้ทันทีโดยไม่มีปัญหาภาษาต่างดาว
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Export 1: Overview */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">
                      รายงานสรุปภาพรวมระบบ (Overview)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      สรุปอัตราการส่งงาน การตรวจงาน จำนวนการบ้าน แบบทดสอบ และสถิติเฉลี่ยทั้งระบบ
                    </p>
                  </div>
                  <button
                    onClick={exportOverviewCSV}
                    className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลดภาพรวม (CSV)
                  </button>
                </div>

                {/* Export 2: Students */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">
                      ผลการเรียนนักเรียนรายคน (Students)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      รายชื่อนักเรียน รหัส คะแนนเก็บ คะแนนสอบเฉลี่ย จำนวนงานที่ส่ง และเกรดประเมิน
                    </p>
                  </div>
                  <button
                    onClick={exportStudentsCSV}
                    className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลดสถิตินักเรียน (CSV)
                  </button>
                </div>

                {/* Export 3: Teachers */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">
                      ภาระงานและการตรวจของครู (Teachers)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      สถิติการสั่งการบ้าน วิดีโอคลิป แบบทดสอบที่สร้าง และเปอร์เซ็นต์การตรวจการบ้าน
                    </p>
                  </div>
                  <button
                    onClick={exportTeachersCSV}
                    className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลดภาระงานครู (CSV)
                  </button>
                </div>

                {/* Export 4: Users Credentials */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2.5">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">
                      รายชื่อผู้ใช้และรหัสผ่านทั้งหมด (Accounts)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      รายชื่อผู้ใช้ (Username) และรหัสผ่าน (Password) ทุกบัญชี สำหรับแอดมินสำรองข้อมูล
                    </p>
                  </div>
                  <button
                    onClick={exportUsersCSV}
                    className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลดบัญชีผู้ใช้ (CSV)
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Hidden when printing */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>เคล็ดลับ: สามารถสั่งพิมพ์เพื่อบันทึกเป็น PDF หรือดาวน์โหลดไฟล์ Excel ไปประมวลผลต่อได้ทันที</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={copyTextSummary}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'คัดลอกข้อความแล้ว!' : 'คัดลอกสรุปข้อความ'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>สั่งพิมพ์ / บันทึก PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
