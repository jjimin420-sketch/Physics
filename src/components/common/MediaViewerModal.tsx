import React from 'react';
import { X, ExternalLink, Film, Image as ImageIcon, FileText, Download } from 'lucide-react';
import { SubmissionAttachment } from '../../types';

interface MediaViewerModalProps {
  media?: SubmissionAttachment | null;
  attachment?: SubmissionAttachment | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ 
  media, 
  attachment, 
  isOpen, 
  onClose 
}) => {
  const activeMedia = media || attachment;

  if (isOpen === false || !activeMedia) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 truncate pr-2">
            {activeMedia.type === 'image' && <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0" />}
            {activeMedia.type === 'video' && <Film className="w-5 h-5 text-blue-400 shrink-0" />}
            {activeMedia.type === 'pdf' && <FileText className="w-5 h-5 text-rose-400 shrink-0" />}
            <span className="font-semibold text-sm sm:text-base truncate">{activeMedia.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeMedia.url && activeMedia.url.startsWith('http') && (
              <a
                href={activeMedia.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                title="เปิดในแท็บใหม่"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">เปิดแท็บใหม่</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto my-3 flex items-center justify-center bg-black/60 rounded-xl p-2 sm:p-4 min-h-[300px]">
          {activeMedia.type === 'image' ? (
            <img
              src={activeMedia.url}
              alt={activeMedia.name}
              className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
            />
          ) : activeMedia.type === 'video' ? (
            activeMedia.url.includes('youtube.com') || activeMedia.url.includes('youtu.be') ? (
              <iframe
                src={activeMedia.url}
                title={activeMedia.name}
                className="w-full aspect-video rounded-lg max-h-[72vh]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={activeMedia.url}
                controls
                autoPlay
                className="max-h-[72vh] w-full rounded-lg"
              >
                เบราว์เซอร์ไม่รองรับการเล่นวิดีโอนี้
              </video>
            )
          ) : (
            <div className="text-center py-12 px-6 space-y-4">
              <FileText className="w-16 h-16 mx-auto text-rose-400" />
              <p className="text-base font-semibold">{activeMedia.name}</p>
              <p className="text-xs text-slate-400">ไฟล์เอกสาร PDF / ใบงานวิธีทำที่นักเรียนแนบส่ง</p>
              <a
                href={activeMedia.url}
                download={activeMedia.name}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" /> ดาวน์โหลดหรือเปิดเอกสาร
              </a>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span className="uppercase text-[11px] font-mono tracking-wider">
            ประเภท: {activeMedia.type} {activeMedia.size ? `• ขนาด: ${activeMedia.size}` : ''}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
