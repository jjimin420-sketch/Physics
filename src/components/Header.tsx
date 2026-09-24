import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Atom, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  LogOut, 
  KeyRound,
  User,
  Settings
} from 'lucide-react';
import { NotificationCenter } from './notifications/NotificationCenter';
import { StudentProfileModal } from './student/StudentProfileModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, users, setCurrentUser, switchRole, resetToDefaultData, logout, syncWithServer, isServerSynced, lastSyncTime } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleRoleClick = (role: UserRole) => {
    switchRole(role);
    // Auto switch active tab to default for role
    if (role === 'student') setActiveTab('assignments');
    else if (role === 'teacher') setActiveTab('assignments');
    else if (role === 'admin') setActiveTab('summary');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <GraduationCap className="w-3.5 h-3.5" /> นักเรียน (Student)
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <BookOpen className="w-3.5 h-3.5" /> ครูผู้สอน (Teacher)
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" /> ผู้ดูแลระบบ (Admin)
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Atom className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Physics<span className="text-indigo-600">Portal</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Edu v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ระบบจัดการเรียนการสอนและติดตามผลสัมฤทธิ์วิชาฟิสิกส์
              </p>
            </div>
          </div>

          {/* Locked Role Identity Badge & Sync Indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => syncWithServer(true)}
              title={`สถานะเซิร์ฟเวอร์กลาง: ออนไลน์ - ซิงก์ล่าสุด: ${lastSyncTime} (คลิกเพื่อบังคับซิงก์)`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${isServerSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="hidden md:inline">ซิงก์ทุกเครื่อง:</span>
              <span className="text-slate-900 font-bold">{lastSyncTime}</span>
            </button>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
              {currentUser.role === 'teacher' && (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-800">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>พอร์ทัลครูผู้สอน (Teacher Only)</span>
                </div>
              )}
              {currentUser.role === 'student' && (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>พอร์ทัลนักเรียน (Student Only)</span>
                </div>
              )}
              {currentUser.role === 'admin' && (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-800">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>พอร์ทัลผู้ดูแลระบบ (Admin Only)</span>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Selector & Actions */}
          <div className="relative flex items-center gap-2.5">
            {/* Notification Bell Center */}
            <NotificationCenter onNavigateTab={(tab) => setActiveTab(tab)} />

            {/* Direct Logout Button on Header */}
            <button
              onClick={() => logout()}
              title="ออกจากระบบเพื่อเปลี่ยนบทบาทหรือเปลี่ยนบัญชี"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl border border-rose-200 transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>

            <button
              id="user-profile-dropdown"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-200"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  @{currentUser.username || currentUser.id}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu (No Role/Account Switcher - Single Role Enforced) */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">บัญชีที่เข้าสู่ระบบ</p>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    ชื่อผู้ใช้: <strong>{currentUser.username || currentUser.id}</strong>
                  </p>
                  <div className="mt-2">{getRoleBadge(currentUser.role)}</div>
                  <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                    ระบบล็อคการเข้าใช้งานตามบทบาทที่ลงชื่อเข้าใช้ หากต้องการเข้าใช้งานบทบาทอื่น กรุณากดออกจากระบบ
                  </p>
                </div>

                <div className="pt-2 px-2 space-y-1">
                  {currentUser.role === 'student' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      ดูและแก้ไขข้อมูลส่วนตัว (Profile)
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    ออกจากระบบ (Sign Out)
                  </button>

                  <button
                    onClick={() => {
                      setShowResetConfirm(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    รีเซ็ตข้อมูลระบบเป็นค่าเริ่มต้น
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">ยืนยันการรีเซ็ตข้อมูล?</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              การกระทำนี้จะล้างข้อมูลการส่งงาน คะแนนสอบ และรายการที่เพิ่มเข้ามาใหม่ ให้กลับสู่ข้อมูลฟิสิกส์เริ่มต้นของระบบ
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  resetToDefaultData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                ยืนยันรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
