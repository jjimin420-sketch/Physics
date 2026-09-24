import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  X, 
  CheckCircle2, 
  School, 
  Mail, 
  Target, 
  KeyRound, 
  Sparkles,
  Camera,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || 'chonkanya.school@gmail.com');
  const [studentGrade, setStudentGrade] = useState(currentUser.studentGrade || 'ม.4');
  const [studentRoom, setStudentRoom] = useState(currentUser.studentRoom || 'ม.4/1');
  const [studentNumber, setStudentNumber] = useState(currentUser.studentNumber || '67');
  const [targetGoal, setTargetGoal] = useState(currentUser.targetGoal || 'เกรด4ฟิสิกส์');
  const [password, setPassword] = useState(currentUser.password || 'password123');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const avatars = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      name,
      email,
      studentGrade,
      studentRoom,
      studentNumber,
      targetGoal,
      password,
      avatar
    });

    setIsSaved(true);
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-['Prompt',sans-serif]">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ข้อมูลส่วนตัวนักเรียน (Student Profile)
            </h3>
            <p className="text-xs text-slate-500">
              รหัสนักเรียน: <strong>{currentUser.studentId || currentUser.id}</strong> • @{currentUser.username}
            </p>
          </div>
        </div>

        {isSaved && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Avatar Section */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img 
              src={avatar} 
              alt={name} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs" 
            />
            <div className="flex-1">
              <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">เปลี่ยนรูปภาพโปรไฟล์:</span>
              <div className="flex items-center gap-2">
                {avatars.map((avUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(avUrl)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 cursor-pointer transition-transform hover:scale-105 ${
                      avatar === avUrl ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={avUrl} alt="Avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ชื่อ - สกุล
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                อีเมล
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Grade, Room, Number */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ระดับชั้น
              </label>
              <select
                value={studentGrade}
                onChange={(e) => setStudentGrade(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="ม.4">ม.4</option>
                <option value="ม.5">ม.5</option>
                <option value="ม.6">ม.6</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ห้องเรียน
              </label>
              <input
                type="text"
                value={studentRoom}
                onChange={(e) => setStudentRoom(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                เลขที่
              </label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Goal & Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              เป้าหมายการเรียนวิชาฟิสิกส์ (Target Goal)
            </label>
            <div className="relative">
              <Target className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
              <input
                type="text"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              รหัสผ่านบัญชี
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-200 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
