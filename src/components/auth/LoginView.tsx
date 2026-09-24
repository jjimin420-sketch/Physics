import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Atom, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Sparkles
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, users } = useApp();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [username, setUsername] = useState<string>('student1');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filter demo accounts by the currently selected role
  const roleUsers = users.filter(u => u.role === selectedRole);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    // Auto-populate with the first user of that role for friendly convenience
    const firstUser = users.find(u => u.role === role);
    if (firstUser) {
      setUsername(firstUser.username || '');
      setPassword(firstUser.password || 'password123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password, selectedRole);
      if (!res.success) {
        setErrorMsg(res.message || 'การเข้าสู่ระบบไม่สำเร็จ');
      }
      setIsLoading(false);
    }, 200);
  };

  const handleQuickLogin = (uUsername: string, uPassword?: string) => {
    setUsername(uUsername);
    setPassword(uPassword || 'password123');
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(uUsername, uPassword || 'password123', selectedRole);
      if (!res.success) {
        setErrorMsg(res.message || 'การเข้าสู่ระบบไม่สำเร็จ');
      }
      setIsLoading(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-['Prompt',sans-serif] relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Icon & Heading */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 mb-4 shadow-lg shadow-indigo-500/20">
          <Atom className="w-8 h-8 text-indigo-400 animate-spin-slow" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          PhysicsPortal
        </h2>
        <p className="mt-1 text-sm text-indigo-200/80">
          แพลตฟอร์มการจัดการเรียนการสอนฟิสิกส์ออนไลน์
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-md py-7 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-100/80">
          
          {/* Role Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                selectedRole === 'student'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              นักเรียน
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                selectedRole === 'teacher'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              ครูผู้สอน
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              แอดมิน
            </button>
          </div>

          {/* Role Status Tag */}
          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              เข้าสู่ระบบในฐานะ:
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
              selectedRole === 'student' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              selectedRole === 'teacher' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
              'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
              {selectedRole === 'student' ? 'นักเรียน (Student Portal)' :
               selectedRole === 'teacher' ? 'ครูผู้สอน (Teacher Portal)' :
               'ผู้ดูแลระบบ (Admin Portal)'}
            </span>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">ข้อผิดพลาด</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อบัญชีผู้ใช้ (Username) หรือ อีเมล
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น student1, teacher1, admin"
                  className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ป้อนรหัสผ่าน"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : selectedRole === 'teacher'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                บัญชีทดสอบด่วน ({selectedRole === 'student' ? 'นักเรียน' : selectedRole === 'teacher' ? 'ครู' : 'แอดมิน'})
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">คลิกเพื่อเข้าสู่ระบบทันที</span>
            </div>

            <div className="space-y-1.5">
              {roleUsers.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.username, u.password)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 group-hover:text-indigo-900 truncate">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>ชื่อบัญชี: <strong className="text-slate-700">{u.username}</strong></span>
                        <span>•</span>
                        <span>รหัส: <strong className="text-slate-700">{u.password}</strong></span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-medium shrink-0 ml-2 group-hover:underline">
                    คลิกเลือก →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Admin Notice */}
          <div className="mt-4 p-2.5 bg-purple-50/70 border border-purple-200/60 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
            <KeyRound className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>ระบบจัดการสำหรับแอดมิน:</strong> สามารถดูชื่อบัญชีและรหัสผ่านของผู้ใช้ทุกคน รวมถึงเพิ่ม/ลบบัญชี ได้ในแท็บ <em>"จัดการบัญชีผู้ใช้"</em> เมื่อเข้าสู่ระบบแอดมิน
            </p>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-indigo-200/60 mt-6">
          Chonkanya Physics Portal • ระบบจัดการและวัดผลการเรียนรู้ฟิสิกส์
        </p>
      </div>
    </div>
  );
};
