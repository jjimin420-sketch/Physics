import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  BookOpen, 
  Clock, 
  Award, 
  FileCheck, 
  BarChart3, 
  MessageSquare,
  X,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNotification } from '../../types';

interface NotificationCenterProps {
  onNavigateTab?: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigateTab }) => {
  const { 
    currentUser, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to current user
  const userNotifications = notifications.filter(n => {
    if (n.recipientId && n.recipientId !== currentUser.id) {
      return false;
    }
    if (n.recipientRole === 'all') return true;
    return n.recipientRole === currentUser.role;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const displayNotifications = filter === 'unread' 
    ? userNotifications.filter(n => !n.read) 
    : userNotifications;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'assignment_new':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'assignment_deadline':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'grade_update':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'submission_new':
        return <FileCheck className="w-4 h-4 text-purple-600" />;
      case 'performance_summary':
        return <BarChart3 className="w-4 h-4 text-indigo-600" />;
      case 'forum_reply':
        return <MessageSquare className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTypeBadge = (type: AppNotification['type']) => {
    switch (type) {
      case 'assignment_new':
        return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">งานใหม่</span>;
      case 'assignment_deadline':
        return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">เตือนส่งงาน</span>;
      case 'grade_update':
        return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">ผลตรวจคะแนน</span>;
      case 'submission_new':
        return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">งานส่งใหม่</span>;
      case 'performance_summary':
        return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">สรุปคะแนน</span>;
      case 'forum_reply':
        return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-100 text-teal-700">เว็บบอร์ด</span>;
      default:
        return null;
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
    }
    if (notif.actionTab && onNavigateTab) {
      onNavigateTab(notif.actionTab);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef} id="notification-center-root">
      {/* Bell Button */}
      <button
        id="btn-toggle-notifications"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        title="การแจ้งเตือน"
        aria-label="เปิดหน้าต่างการแจ้งเตือน"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          id="notification-dropdown-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">การแจ้งเตือน</h3>
                <p className="text-xs text-slate-500">
                  {unreadCount > 0 ? `มี ${unreadCount} รายการที่ยังไม่ได้อ่าน` : 'ไม่มีรายการค้างอ่าน'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  id="btn-mark-all-read"
                  onClick={() => markAllNotificationsAsRead(currentUser.role)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                  title="ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"
                >
                  <Check className="w-3.5 h-3.5" />
                  อ่านทั้งหมด
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 bg-white px-3 pt-2 gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`pb-2 px-3 font-medium transition-all relative ${
                filter === 'all' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ทั้งหมด ({userNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-2 px-3 font-medium transition-all relative ${
                filter === 'unread' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ยังไม่ได้อ่าน ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {displayNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-sm">ไม่มีการแจ้งเตือน{filter === 'unread' ? 'ที่ยังไม่ได้อ่าน' : ''}</p>
              </div>
            ) : (
              displayNotifications.map((notif) => (
                <div
                  key={notif.id}
                  id={`notif-item-${notif.id}`}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 relative group ${
                    !notif.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {/* Status Indicator Dot */}
                  {!notif.read && (
                    <span className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-blue-600" />
                  )}

                  {/* Icon */}
                  <div className="mt-0.5 p-2 rounded-xl bg-white shadow-xs border border-slate-100 shrink-0">
                    {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeBadge(notif.type)}
                      <span className="text-[11px] text-slate-400">{notif.timestamp}</span>
                    </div>
                    <h4 className={`text-xs ${notif.read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'} line-clamp-1`}>
                      {notif.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    {notif.actionTab && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:underline">
                        <span>ไปยังส่วนที่เกี่ยวข้อง</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-all shrink-0"
                    title="ลบการแจ้งเตือน"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
            ระบบแจ้งเตือนแบบเรียลไทม์สำหรับการบ้าน แบบทดสอบ และคะแนน
          </div>
        </div>
      )}
    </div>
  );
};
