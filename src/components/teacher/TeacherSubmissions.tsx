import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Submission, SubmissionAttachment } from '../../types';
import { 
  CheckSquare, 
  Search, 
  FileText, 
  Award, 
  Clock, 
  CheckCircle, 
  Paperclip, 
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MediaViewerModal } from '../common/MediaViewerModal';

export const TeacherSubmissions: React.FC = () => {
  const { submissions, assignments, gradeSubmission } = useApp();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingMedia, setViewingMedia] = useState<SubmissionAttachment | null>(null);

  // Grading form state
  const [scoreInput, setScoreInput] = useState<number>(18);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const filteredSubmissions = submissions.filter(sub => {
    const asg = assignments.find(a => a.id === sub.assignmentId);
    const matchesSearch = sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (asg?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'pending') return sub.status === 'submitted';
    if (filterStatus === 'graded') return sub.status === 'graded';
    return true;
  });

  const openGradingModal = (sub: Submission) => {
    const asg = assignments.find(a => a.id === sub.assignmentId);
    setSelectedSubmission(sub);
    setScoreInput(sub.score !== undefined ? sub.score : (asg?.totalPoints || 20));
    setFeedbackInput(sub.feedback || 'แสดงขั้นตอนการคำนวณได้ถูกต้องและมีระเบียบดีมาก');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    gradeSubmission(selectedSubmission.id, Number(scoreInput), feedbackInput);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
    setSelectedSubmission(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            ตรวจงานและให้คะแนนการบ้านนักเรียน (Grading & Feedback)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ตรวจวิธีทำ ให้คะแนนตามเกณฑ์รูบริก และให้ข้อคิดเห็นเสริมสร้างพัฒนาการ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อนักเรียน / ชื่องาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 sm:w-60"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              ทั้งหมด ({submissions.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'pending' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              รอตรวจ ({submissions.filter(s => s.status === 'submitted').length})
            </button>
            <button
              onClick={() => setFilterStatus('graded')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'graded' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              ตรวจแล้ว ({submissions.filter(s => s.status === 'graded').length})
            </button>
          </div>
        </div>
      </div>

      {/* Submissions Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">นักเรียน</th>
                <th className="py-3.5 px-4">ชื่องานและโจทย์</th>
                <th className="py-3.5 px-4">เวลาที่ส่ง</th>
                <th className="py-3.5 px-4">ไฟล์แนบ</th>
                <th className="py-3.5 px-4">สถานะ & คะแนน</th>
                <th className="py-3.5 px-4 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSubmissions.map(sub => {
                const asg = assignments.find(a => a.id === sub.assignmentId);
                const isGraded = sub.status === 'graded';

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sub.studentName}</div>
                      <div className="text-[11px] text-slate-400">รหัสนักเรียน: {sub.studentId}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{asg?.title || 'งานฟิสิกส์'}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                        {asg?.topic || 'กลศาสตร์'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {sub.submittedAt}
                    </td>

                    <td className="py-3.5 px-4">
                      {sub.attachments && sub.attachments.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {sub.attachments.map((att, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setViewingMedia(att)}
                              className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-800 rounded-lg font-medium text-xs border border-blue-200 transition-colors cursor-pointer group text-left"
                            >
                              {att.type === 'video' ? (
                                <Film className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              ) : att.type === 'image' ? (
                                <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              ) : (
                                <Paperclip className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                              )}
                              <span className="truncate max-w-36 font-semibold group-hover:underline">{att.name}</span>
                              <span className="text-[10px] text-blue-600 bg-white px-1.5 py-0.5 rounded font-bold border border-blue-200 shrink-0 flex items-center gap-1">
                                <Eye className="w-2.5 h-2.5" /> ดูไฟล์
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : sub.fileAttachment ? (
                        <button
                          type="button"
                          onClick={() => setViewingMedia({
                            name: sub.fileAttachment || 'งานที่ส่ง',
                            url: sub.attachmentUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
                            type: sub.attachmentType || 'image'
                          })}
                          className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-800 rounded-lg font-medium text-xs border border-blue-200 transition-colors cursor-pointer group"
                        >
                          <Paperclip className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                          <span className="truncate max-w-36 font-semibold group-hover:underline">{sub.fileAttachment}</span>
                          <span className="text-[10px] text-blue-600 bg-white px-1.5 py-0.5 rounded font-bold border border-blue-200 shrink-0 flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" /> ดูไฟล์
                          </span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">ไม่มีไฟล์แนบ</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <Award className="w-3.5 h-3.5" />
                          {sub.score} / {asg?.totalPoints || 20} คะแนน
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> รอตรวจให้คะแนน
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openGradingModal(sub)}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                          isGraded
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                        }`}
                      >
                        {isGraded ? 'แก้ไขคะแนน' : 'ตรวจงาน'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    ไม่พบรายการส่งงานในเงื่อนไขนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                  ตรวจการบ้าน
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {assignments.find(a => a.id === selectedSubmission.assignmentId)?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  นักเรียน: <strong>{selectedSubmission.studentName}</strong> | ส่งเมื่อ {selectedSubmission.submittedAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Student's Answer Details & Attachments */}
            <div className="space-y-3 mb-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-800 mb-1">คำตอบ / แสดงวิธีทำของนักเรียน:</p>
                <p className="text-slate-700 whitespace-pre-wrap font-mono leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {selectedSubmission.content}
                </p>

                {/* Attachments Section with Embedded Preview */}
                {((selectedSubmission.attachments && selectedSubmission.attachments.length > 0) || selectedSubmission.fileAttachment) && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        ไฟล์และภาพวิธีทำที่นักเรียนแนบส่ง:
                      </p>
                      <span className="text-[11px] text-blue-600 font-medium">คลิกเพื่อขยายดูขนาดเต็ม</span>
                    </div>

                    {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedSubmission.attachments.map((att, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 truncate">
                                {att.type === 'video' ? (
                                  <Film className="w-4 h-4 text-indigo-600 shrink-0" />
                                ) : att.type === 'image' ? (
                                  <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                                )}
                                <span className="truncate">{att.name}</span>
                                {att.size && <span className="text-[10px] text-slate-400 font-normal">({att.size})</span>}
                              </div>
                              <button
                                type="button"
                                onClick={() => setViewingMedia(att)}
                                className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3 h-3" /> ขยายเต็มจอ
                              </button>
                            </div>

                            {/* Direct Inline Preview */}
                            {att.type === 'image' && att.url && (
                              <div 
                                onClick={() => setViewingMedia(att)}
                                className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900/5 flex items-center justify-center cursor-pointer group max-h-80"
                              >
                                <img 
                                  src={att.url} 
                                  alt={att.name} 
                                  className="max-h-80 w-auto object-contain rounded-lg group-hover:scale-[1.01] transition-transform" 
                                />
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                                  <Eye className="w-4 h-4" /> คลิกเพื่อขยายดูขนาดเต็ม
                                </div>
                              </div>
                            )}

                            {att.type === 'video' && att.url && (
                              <div className="rounded-lg overflow-hidden border border-slate-200 bg-black">
                                <video src={att.url} controls className="w-full max-h-64 rounded-lg">
                                  เบราว์เซอร์ไม่รองรับวิดีโอ
                                </video>
                              </div>
                            )}

                            {att.type === 'pdf' && (
                              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-xs text-slate-600 font-medium">เอกสารประกอบแบบฝึกหัด (PDF)</span>
                                <button
                                  type="button"
                                  onClick={() => setViewingMedia(att)}
                                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  เปิดดูหรือดาวน์โหลด
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : selectedSubmission.fileAttachment ? (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 truncate">
                            <Paperclip className="w-4 h-4 text-blue-600" />
                            <span>{selectedSubmission.fileAttachment}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewingMedia({
                              name: selectedSubmission.fileAttachment || 'งานที่ส่ง',
                              url: selectedSubmission.attachmentUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
                              type: selectedSubmission.attachmentType || 'image'
                            })}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> ขยายเต็มจอ
                          </button>
                        </div>
                        {selectedSubmission.attachmentUrl && (
                          <div 
                            onClick={() => setViewingMedia({
                              name: selectedSubmission.fileAttachment || 'งานที่ส่ง',
                              url: selectedSubmission.attachmentUrl!,
                              type: selectedSubmission.attachmentType || 'image'
                            })}
                            className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center cursor-pointer group max-h-80"
                          >
                            <img 
                              src={selectedSubmission.attachmentUrl} 
                              alt="งานที่ส่ง" 
                              className="max-h-80 w-auto object-contain rounded-lg group-hover:scale-[1.01] transition-transform" 
                            />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Grading Form */}
            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  คะแนนที่ได้ (จากคะแนนเต็ม {assignments.find(a => a.id === selectedSubmission.assignmentId)?.totalPoints || 20} คะแนน)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={assignments.find(a => a.id === selectedSubmission.assignmentId)?.totalPoints || 100}
                  value={scoreInput}
                  onChange={(e) => setScoreInput(Number(e.target.value))}
                  className="w-full text-sm font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ข้อเสนอแนะและคำแนะนำทางฟิสิกส์ (Teacher's Feedback)
                </label>
                <textarea
                  rows={3}
                  placeholder="เขียนคำชมเชย ข้อควรปรับปรุง หรือคำแนะนำเรื่องทิศทางแรงและการใส่หน่วย..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  บันทึกคะแนนและคำแนะนำ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Viewer Modal for Teachers */}
      <MediaViewerModal
        isOpen={!!viewingMedia}
        onClose={() => setViewingMedia(null)}
        attachment={viewingMedia}
      />
    </div>
  );
};
