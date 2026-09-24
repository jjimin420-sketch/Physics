import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Assignment, Submission, SubmissionAttachment } from '../../types';
import { 
  FileText, 
  Clock, 
  Calendar, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Paperclip, 
  Send, 
  FileCheck2,
  Award,
  Sparkles,
  Search,
  ExternalLink,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MediaUploader } from '../common/MediaUploader';
import { MediaViewerModal } from '../common/MediaViewerModal';

export const StudentAssignments: React.FC = () => {
  const { assignments, submissions, currentUser, submitAssignment } = useApp();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [attachments, setAttachments] = useState<SubmissionAttachment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingMedia, setViewingMedia] = useState<SubmissionAttachment | null>(null);

  // Find submission for current student for any assignment
  const getStudentSubmission = (assignmentId: string): Submission | undefined => {
    return submissions.find(s => s.assignmentId === assignmentId && s.studentId === currentUser.id);
  };

  const filteredAssignments = assignments.filter(asg => {
    const sub = getStudentSubmission(asg.id);
    const matchesSearch = asg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asg.topic.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'pending') return !sub;
    if (filter === 'submitted') return sub && sub.status === 'submitted';
    if (filter === 'graded') return sub && sub.status === 'graded';
    return true;
  });

  const openSubmitModal = (asg: Assignment) => {
    const existing = getStudentSubmission(asg.id);
    setSelectedAssignment(asg);
    setSubmissionText(existing ? existing.content : '');
    
    if (existing?.attachments && existing.attachments.length > 0) {
      setAttachments(existing.attachments);
    } else if (existing?.fileAttachment) {
      setAttachments([
        {
          name: existing.fileAttachment,
          url: existing.attachmentUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
          type: existing.attachmentType || 'image',
          size: 'ไฟล์ที่เคยส่ง'
        }
      ]);
    } else {
      setAttachments([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const primaryFileName = attachments.length > 0 ? attachments[0].name : 'physics_homework_solution.pdf';
      submitAssignment(selectedAssignment.id, submissionText, primaryFileName, attachments);
      
      // Close submission modal immediately to prevent UI blocking/overlap
      setSelectedAssignment(null);
      setSubmissionText('');
      setAttachments([]);

      // Trigger celebration safely
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (confettiErr) {
        console.log('Confetti skipped:', confettiErr);
      }

      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error in submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            การบ้านและภาระงานวิชาฟิสิกส์ (Physics Assignments)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ส่งงานที่ได้รับมอบหมาย ติดตามสถานะการตรวจ และดูคำแนะนำจากอาจารย์ผู้สอน
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่องาน / หัวข้อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-44 sm:w-56"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({assignments.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filter === 'pending' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รอดำเนินการ
            </button>
            <button
              onClick={() => setFilter('submitted')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filter === 'submitted' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ส่งแล้ว
            </button>
            <button
              onClick={() => setFilter('graded')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filter === 'graded' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ตรวจแล้ว
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssignments.map(asg => {
          const submission = getStudentSubmission(asg.id);
          const isGraded = submission?.status === 'graded';
          const isSubmitted = submission?.status === 'submitted';

          return (
            <div
              key={asg.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Topic & Status Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {asg.topic}
                  </span>

                  {isGraded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <Award className="w-3.5 h-3.5" /> ตรวจแล้ว ({submission.score}/{asg.totalPoints})
                    </span>
                  ) : isSubmitted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle className="w-3 h-3" /> ส่งแล้ว (รอตรวจ)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" /> ยังไม่ส่ง
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                  {asg.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {asg.description}
                </p>

                {/* Teacher Attachment if any */}
                {asg.attachmentName && (
                  <div className="mt-3.5 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{asg.attachmentName}</span>
                    <span className="text-[10px] text-emerald-600 font-medium ml-auto">ใบงานแนบ</span>
                  </div>
                )}

                {/* Student's submitted attachment preview if exists */}
                {submission && (submission.attachments?.length || submission.fileAttachment) && (
                  <div className="mt-3 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate text-slate-700 font-medium">
                        {submission.attachments?.[0]?.name || submission.fileAttachment}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (submission.attachments?.[0]) {
                          setViewingMedia(submission.attachments[0]);
                        } else {
                          setViewingMedia({
                            name: submission.fileAttachment || 'งานที่ส่ง',
                            url: submission.attachmentUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
                            type: submission.attachmentType || 'image'
                          });
                        }
                      }}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> ดูไฟล์
                    </button>
                  </div>
                )}

                {/* Feedback preview if graded */}
                {isGraded && submission.feedback && (
                  <div className="mt-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    <div className="font-semibold flex items-center gap-1.5 mb-1 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      คำแนะนำจากอาจารย์ ({submission.gradedBy}):
                    </div>
                    <p className="italic text-slate-700 font-normal">"{submission.feedback}"</p>
                  </div>
                )}
              </div>

              {/* Bottom Meta & Submit Action */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>กำหนดส่ง: <strong className="text-slate-700">{asg.dueDate}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    คะแนนเต็ม: <strong className="text-slate-700">{asg.totalPoints} คะแนน</strong> • {asg.assignedBy}
                  </div>
                </div>

                <button
                  id={`submit-asg-btn-${asg.id}`}
                  onClick={() => openSubmitModal(asg)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    isGraded
                      ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      : isSubmitted
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {isGraded ? 'ดูรายละเอียด' : isSubmitted ? 'แก้ไขงานส่ง' : 'ส่งงาน'}
                </button>
              </div>
            </div>
          );
        })}

        {filteredAssignments.length === 0 && (
          <div className="col-span-full p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
            <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium text-sm">ไม่พบรายการงานตามเงื่อนไขที่เลือก</p>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  {selectedAssignment.topic}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                  {selectedAssignment.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ผู้มอบหมาย: {selectedAssignment.assignedBy} | คะแนนเต็ม: {selectedAssignment.totalPoints} คะแนน
                </p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Assignment Problem Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 mb-5 leading-relaxed">
              <strong className="block text-slate-900 font-semibold mb-1 text-xs">คำสั่งและโจทย์:</strong>
              {selectedAssignment.description}

              {selectedAssignment.attachmentName && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                    {selectedAssignment.attachmentName}
                  </span>
                  <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                    ดาวน์โหลดเอกสาร <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  คำอธิบายแสดงวิธีทำ / คำตอบฟิสิกส์ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="submission-content-input"
                  rows={4}
                  required
                  placeholder="เขียนขั้นตอนแสดงวิธีทำ สรุปตัวแปร สูตรที่ใช้ (เช่น ∑F = ma หรือ v = u + at) และคำตอบสุดท้ายพร้อมหน่วยกำกับ..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-mono"
                />
              </div>

              {/* Real Media Uploader for Photos, Videos, and PDFs */}
              <div>
                <MediaUploader
                  label="แนบรูปภาพวิธีทำ / วิดีโออธิบาย / เอกสารแบบฝึกหัด (PDF, JPG, PNG, MP4)"
                  attachments={attachments}
                  onChange={setAttachments}
                  maxFiles={4}
                  onPreviewMedia={(media) => setViewingMedia(media)}
                />
              </div>

              {/* If already graded, show grade summary */}
              {(() => {
                const sub = getStudentSubmission(selectedAssignment.id);
                if (sub && sub.status === 'graded') {
                  return (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                        <Award className="w-4 h-4" /> ผลการประเมิน: {sub.score} / {selectedAssignment.totalPoints} คะแนน
                      </div>
                      <p className="text-slate-700">ตรวจโดย: {sub.gradedBy} ({sub.gradedAt})</p>
                      {sub.feedback && <p className="text-emerald-900 font-medium mt-1">ข้อเสนอแนะ: "{sub.feedback}"</p>}
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  id="confirm-submit-assignment-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>กำลังส่งงาน...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>บันทึกและยืนยันการส่งงาน</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      <MediaViewerModal
        isOpen={!!viewingMedia}
        onClose={() => setViewingMedia(null)}
        attachment={viewingMedia}
      />

      {/* Success Notification Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base text-slate-900 mb-1">ส่งงานสำเร็จเรียบร้อย!</h4>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              งานของคุณถูกส่งไปยังอาจารย์ผู้สอนแล้ว คุณสามารถแก้ไขงานหรือติดตามผลคะแนนได้ที่หน้านี้
            </p>
            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setSelectedAssignment(null);
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
