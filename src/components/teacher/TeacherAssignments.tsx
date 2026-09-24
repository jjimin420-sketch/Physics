import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubmissionAttachment } from '../../types';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Trash2, 
  Users, 
  CheckCircle, 
  Clock, 
  Award,
  Sparkles,
  Paperclip,
  Check
} from 'lucide-react';
import { MediaUploader } from '../common/MediaUploader';

export const TeacherAssignments: React.FC = () => {
  const { assignments, submissions, createAssignment, deleteAssignment } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('กลศาสตร์และแรง');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalPoints, setTotalPoints] = useState(20);
  const [attachments, setAttachments] = useState<SubmissionAttachment[]>([]);

  const physicsTopics = [
    'กลศาสตร์และแรง',
    'การเคลื่อนที่ใน 2 มิติ',
    'งานและพลังงาน',
    'โมเมนตัมและการชน',
    'คลื่นและแสง',
    'ไฟฟ้าและแม่เหล็ก',
    'ความร้อนและก๊าซ',
    'ฟิสิกส์นิวเคลียร์และอนุภาค'
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate) return;

    const primaryAttachment = attachments.length > 0 ? attachments[0] : undefined;

    createAssignment({
      title,
      topic,
      description,
      dueDate,
      totalPoints: Number(totalPoints),
      attachmentName: primaryAttachment ? primaryAttachment.name : undefined,
      attachmentUrl: primaryAttachment ? primaryAttachment.url : undefined,
      attachmentType: primaryAttachment ? primaryAttachment.type : undefined
    });

    // Reset
    setTitle('');
    setDescription('');
    setDueDate('');
    setTotalPoints(20);
    setAttachments([]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            การสั่งงานและการบ้านฟิสิกส์ (Manage Assignments)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            มอบหมายโจทย์ฟิสิกส์ กำหนดวันส่ง คะแนนเต็ม และติดตามยอดการส่งงานของนักเรียน
          </p>
        </div>

        <button
          id="open-create-assignment-modal-btn"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-200 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>สั่งงาน / มอบหมายการบ้านใหม่</span>
        </button>
      </div>

      {/* Assignment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assignments.map(asg => {
          const asgSubmissions = submissions.filter(s => s.assignmentId === asg.id);
          const gradedCount = asgSubmissions.filter(s => s.status === 'graded').length;

          return (
            <div
              key={asg.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                    {asg.topic}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`ต้องการลบงาน "${asg.title}" หรือไม่?`)) {
                        deleteAssignment(asg.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="ลบงานนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                  {asg.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {asg.description}
                </p>

                {asg.attachmentName && (
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    <span className="truncate">{asg.attachmentName}</span>
                  </div>
                )}
              </div>

              {/* Status & Submissions counter */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> กำหนดส่ง: {asg.dueDate}
                  </span>
                  <span className="font-bold text-slate-700">{asg.totalPoints} คะแนน</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Users className="w-3.5 h-3.5 text-blue-600" /> นักเรียนส่งแล้ว:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700">{asgSubmissions.length} คน</span>
                    <span className="text-[11px] text-slate-400">
                      (ตรวจแล้ว {gradedCount}/{asgSubmissions.length})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Create Assignment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                สร้างภาระงาน / สั่งการบ้านฟิสิกส์ใหม่
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  หัวข้อ / หมวดหมู่วิชาฟิสิกส์
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {physicsTopics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ชื่องาน / แบบฝึกหัด <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แบบฝึกหัดเรื่อง การคำนวณกฎข้อที่ 2 ของนิวตัน (∑F = ma)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    กำหนดส่งงาน (Due Date) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    คะแนนเต็ม (Points)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={totalPoints}
                    onChange={(e) => setTotalPoints(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  รายละเอียดโจทย์และคำชี้แจง <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="ระบุข้อคำถาม ตัวแปรที่กำหนด เงื่อนไขการส่งงาน และสิ่งที่ต้องการให้นักเรียนแสดงวิธีทำ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <MediaUploader
                  label="แนบเอกสารใบงาน / โจทย์ฟิสิกส์ / รูปภาพประกอบ (PDF, JPG, PNG)"
                  attachments={attachments}
                  onChange={setAttachments}
                  maxFiles={2}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  id="confirm-create-assignment-btn"
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-200 cursor-pointer"
                >
                  สร้างและเผยแพร่งาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
