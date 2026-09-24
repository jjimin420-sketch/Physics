import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  KeyRound,
  AlertCircle,
  X,
  Sparkles,
  ExternalLink,
  Lock,
  Mail,
  User as UserIcon,
  Filter
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { 
    users, 
    currentUser, 
    addUser, 
    deleteUser, 
    setCurrentUser,
    logout
  } = useApp();

  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Show/Hide passwords toggle: individual user IDs
  const [revealedPasswordIds, setRevealedPasswordIds] = useState<Record<string, boolean>>({});
  const [showAllPasswords, setShowAllPasswords] = useState<boolean>(false);

  // Copy feedback tracking
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Add User Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newName, setNewName] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('password123');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newStudentId, setNewStudentId] = useState<string>('');
  const [newTeacherSubject, setNewTeacherSubject] = useState<string>('');
  const [addError, setAddError] = useState<string>('');

  // Delete Confirmation Modal state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  // Filtering
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || 
      u.name.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.studentId && u.studentId.toLowerCase().includes(q)) ||
      (u.teacherSubject && u.teacherSubject.toLowerCase().includes(q));

    return matchesRole && matchesQuery;
  });

  const studentsCount = users.filter(u => u.role === 'student').length;
  const teachersCount = users.filter(u => u.role === 'teacher').length;
  const adminsCount = users.filter(u => u.role === 'admin').length;

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswordIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleOpenAddModal = (defaultRole?: UserRole) => {
    const role = defaultRole || 'student';
    setNewRole(role);
    setNewName('');
    setNewUsername('');
    setNewPassword('password123');
    setNewEmail('');
    setNewStudentId(role === 'student' ? `ST-${Math.floor(6700 + users.length + 1)}` : '');
    setNewTeacherSubject(role === 'teacher' ? 'ฟิสิกส์ ม.ปลาย' : '');
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    const res = addUser({
      name: newName,
      role: newRole,
      username: newUsername,
      password: newPassword,
      email: newEmail,
      studentId: newRole === 'student' ? newStudentId : undefined,
      teacherSubject: newRole === 'teacher' ? newTeacherSubject : undefined
    });

    if (!res.success) {
      setAddError(res.message || 'ไม่สามารถเพิ่มผู้ใช้ได้');
      return;
    }

    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    setDeleteError('');

    const res = deleteUser(userToDelete.id);
    if (!res.success) {
      setDeleteError(res.message || 'ไม่สามารถลบผู้ใช้ได้');
      return;
    }

    setUserToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">บัญชีผู้ใช้ทั้งหมด</p>
            <h4 className="text-2xl font-black text-slate-900">{users.length} บัญชี</h4>
            <p className="text-[11px] text-slate-400">ในระบบ PhysicsPortal</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">นักเรียน</p>
            <h4 className="text-2xl font-black text-slate-900">{studentsCount} คน</h4>
            <p className="text-[11px] text-emerald-600 font-medium">พร้อมใช้งานในห้องเรียน</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ครูผู้สอน</p>
            <h4 className="text-2xl font-black text-slate-900">{teachersCount} ท่าน</h4>
            <p className="text-[11px] text-blue-600 font-medium">จัดการบทเรียนและการสอน</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ผู้ดูแลระบบ (Admin)</p>
            <h4 className="text-2xl font-black text-slate-900">{adminsCount} บัญชี</h4>
            <p className="text-[11px] text-purple-600 font-medium">สิทธิ์ดูแลความปลอดภัย</p>
          </div>
        </div>
      </div>

      {/* Admin Notice Bar */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                สิทธิ์การตรวจสอบบัญชีและรหัสผ่าน (Admin Credentials View)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/60 text-purple-800">
                เฉพาะแอดมิน
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              แอดมินสามารถดู <strong>ชื่อบัญชีผู้ใช้ (Username)</strong> และ <strong>รหัสผ่าน (Password)</strong> ของทั้งนักเรียน ครู และแอดมินได้โดยตรงที่ตารางด้านล่าง เพื่ออำนวยความสะดวกในการจัดสรรบัญชีหรือช่วยเหลือนักเรียนกรณีลืมรหัสผ่าน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            {showAllPasswords ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4 text-purple-600" />}
            <span>{showAllPasswords ? 'ซ่อนรหัสผ่านทั้งหมด' : 'แสดงรหัสผ่านทั้งหมด'}</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ เพิ่มบัญชีผู้ใช้ใหม่</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, ชื่อบัญชี, อีเมล, รหัสนักเรียน..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-800 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              roleFilter === 'student'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            นักเรียน ({studentsCount})
          </button>
          <button
            onClick={() => setRoleFilter('teacher')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              roleFilter === 'teacher'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            ครูผู้สอน ({teachersCount})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            แอดมิน ({adminsCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">ผู้ใช้งาน</th>
                <th className="py-3.5 px-4">บทบาท</th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-indigo-700">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>ชื่อบัญชีผู้ใช้ (Username)</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-purple-700">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>รหัสผ่าน (Password)</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">ข้อมูลสังกัด / รหัส</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm text-slate-600">ไม่พบบัญชีผู้ใช้ตามเงื่อนไขที่ค้นหา</p>
                    <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองประเภทผู้ใช้</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isRevealed = showAllPasswords || !!revealedPasswordIds[u.id];
                  const isCurrent = u.id === currentUser.id;

                  return (
                    <tr 
                      key={u.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700">
                                  บัญชีปัจจุบัน
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {u.role === 'student' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <GraduationCap className="w-3 h-3" />
                            นักเรียน
                          </span>
                        )}
                        {u.role === 'teacher' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <BookOpen className="w-3 h-3" />
                            ครูผู้สอน
                          </span>
                        )}
                        {u.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <ShieldCheck className="w-3 h-3" />
                            แอดมิน
                          </span>
                        )}
                      </td>

                      {/* Username with Copy */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors">
                          <code className="font-mono text-xs font-bold text-slate-800">
                            {u.username || u.id}
                          </code>
                          <button
                            onClick={() => copyToClipboard(u.username || u.id, `user_${u.id}`)}
                            title="คัดลอกชื่อบัญชี"
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {copiedKey === `user_${u.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password with Show/Hide and Copy */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-2 bg-purple-50/70 border border-purple-200/80 px-2.5 py-1 rounded-lg">
                          <code className="font-mono text-xs font-bold text-purple-900 min-w-20">
                            {isRevealed ? (u.password || 'password123') : '••••••••'}
                          </code>
                          <button
                            onClick={() => toggleRevealPassword(u.id)}
                            title={isRevealed ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                            className="text-purple-600 hover:text-purple-800 cursor-pointer"
                          >
                            {isRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(u.password || 'password123', `pass_${u.id}`)}
                            title="คัดลอกรหัสผ่าน"
                            className="text-purple-600 hover:text-purple-800 cursor-pointer"
                          >
                            {copiedKey === `pass_${u.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Detail Column */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-600 text-xs">
                          {u.studentId && (
                            <span className="font-mono text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                              {u.studentId}
                            </span>
                          )}
                          {u.teacherSubject && <span>{u.teacherSubject}</span>}
                          {u.role === 'admin' && <span className="text-slate-400">ควบคุมระบบส่วนกลาง</span>}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Switch to User */}
                          <button
                            onClick={() => setCurrentUser(u)}
                            title="สลับเข้าใช้งานบัญชีนี้"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => setUserToDelete(u)}
                            disabled={isCurrent}
                            title={isCurrent ? 'ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้' : 'ลบบัญชีผู้ใช้นี้'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">เพิ่มบัญชีผู้ใช้ใหม่</h3>
                  <p className="text-xs text-slate-500">สร้างบัญชีสำหรับนักเรียน ครู หรือแอดมิน</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>{addError}</p>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ประเภทบัญชี (Role)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewRole('student');
                      if (!newStudentId) setNewStudentId(`ST-${Math.floor(6700 + users.length + 1)}`);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newRole === 'student'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    นักเรียน
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewRole('teacher');
                      if (!newTeacherSubject) setNewTeacherSubject('ฟิสิกส์ทั่วไป');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newRole === 'teacher'
                        ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    ครูผู้สอน
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('admin')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newRole === 'admin'
                        ? 'bg-purple-50 border-purple-300 text-purple-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    แอดมิน
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={newRole === 'student' ? 'เช่น นาย ปรเมศวร์ คงเจริญ' : newRole === 'teacher' ? 'เช่น อ. ชวลิต มงคลรัตน์' : 'เช่น ผู้ช่วยผู้ดูแลระบบ'}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ชื่อบัญชีผู้ใช้ (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="เช่น student4, teacher3"
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    รหัสผ่าน (Password) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="เช่น password123"
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  อีเมล (Email)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={newUsername ? `${newUsername}@chonkanya.ac.th` : 'user@chonkanya.ac.th'}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900"
                />
              </div>

              {/* Conditional: Student ID or Teacher Subject */}
              {newRole === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    รหัสนักเรียน (Student ID)
                  </label>
                  <input
                    type="text"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    placeholder="เช่น ST-6704"
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900"
                  />
                </div>
              )}

              {newRole === 'teacher' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    กลุ่มสาระ / รายวิชาที่สอน
                  </label>
                  <input
                    type="text"
                    value={newTeacherSubject}
                    onChange={(e) => setNewTeacherSubject(e.target.value)}
                    placeholder="เช่น ฟิสิกส์ ม.4-ม.6 (กลศาสตร์และดาราศาสตร์)"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  บันทึกสร้างบัญชี
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              ยืนยันการลบบัญชีผู้ใช้?
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              คุณต้องการลบบัญชี <strong>{userToDelete.name}</strong> ({userToDelete.username}) ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            {deleteError && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                ยืนยันลบบัญชี
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
