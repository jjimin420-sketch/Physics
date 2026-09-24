import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Film, 
  FileText, 
  Trash2, 
  Eye, 
  Plus, 
  Link as LinkIcon, 
  Check, 
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';
import { SubmissionAttachment } from '../../types';

interface MediaUploaderProps {
  label?: string;
  helperText?: string;
  attachments: SubmissionAttachment[];
  onChange: (attachments: SubmissionAttachment[]) => void;
  maxFiles?: number;
  accept?: string;
  allowUrlInput?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label = 'แนบรูปภาพวิธีทำ / วิดีโอการทดลอง / เอกสาร',
  helperText = 'รองรับไฟล์รูปภาพ (JPG, PNG, WebP), วิดีโอ (MP4, WebM, MOV) และเอกสาร PDF',
  attachments,
  onChange,
  maxFiles = 5,
  accept = 'image/*,video/*,application/pdf',
  allowUrlInput = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlName, setUrlName] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'video' | 'pdf'>('image');
  const [previewMedia, setPreviewMedia] = useState<SubmissionAttachment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Compress image using canvas to avoid blowing up memory or localStorage
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height && width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
              return;
            }
          } catch (err) {
            console.warn('Canvas compression fallback:', err);
          }
          resolve(rawUrl);
        };
        img.onerror = () => resolve(rawUrl);
        img.src = rawUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (fileList: FileList) => {
    setErrorMsg(null);
    const remainingSlots = maxFiles - attachments.length;

    if (remainingSlots <= 0) {
      setErrorMsg(`สามารถแนบไฟล์ได้สูงสุด ${maxFiles} ไฟล์`);
      return;
    }

    const filesToProcess = Array.from(fileList).slice(0, remainingSlots);
    setIsProcessing(true);

    try {
      const processedPromises = filesToProcess.map(async (file): Promise<SubmissionAttachment | null> => {
        // Determine media type
        let type: 'image' | 'video' | 'pdf' | 'other' = 'other';
        if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type.startsWith('video/')) {
          type = 'video';
        } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          type = 'pdf';
        }

        if (type === 'image') {
          const compressedUrl = await compressImageFile(file);
          if (!compressedUrl) return null;
          return {
            name: file.name,
            url: compressedUrl,
            type: 'image',
            size: formatFileSize(file.size)
          };
        } else if (type === 'video') {
          // Use Object URL for video for ultra-smooth performance
          const objectUrl = URL.createObjectURL(file);
          return {
            name: file.name,
            url: objectUrl,
            type: 'video',
            size: formatFileSize(file.size)
          };
        } else {
          // PDF or document
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve((e.target?.result as string) || '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
          if (!dataUrl) return null;
          return {
            name: file.name,
            url: dataUrl,
            type,
            size: formatFileSize(file.size)
          };
        }
      });

      const results = await Promise.all(processedPromises);
      const validAttachments = results.filter((item): item is SubmissionAttachment => item !== null);
      if (validAttachments.length > 0) {
        onChange([...attachments, ...validAttachments]);
      }
    } catch (err) {
      console.error('Error processing files:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการโหลดไฟล์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so re-selecting same file fires event
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const attachment: SubmissionAttachment = {
      name: urlName.trim() || (urlType === 'video' ? 'วิดีโอคลิปแนบ' : urlType === 'image' ? 'รูปภาพแนบ' : 'เอกสารแนบ'),
      url: urlInput.trim(),
      type: urlType,
      size: 'ลิงก์ภายนอก'
    };

    onChange([...attachments, attachment]);
    setUrlInput('');
    setUrlName('');
    setIsUrlModalOpen(false);
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800">
            {label}
          </label>
          <span className="text-[11px] text-slate-500">
            {attachments.length} / {maxFiles} รายการ
          </span>
        </div>
      )}

      {/* Hidden native input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        multiple
        className="hidden"
      />

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01]'
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-white'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-indigo-700">กำลังประมวลผลและเตรียมไฟล์แนบ...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  ลากไฟล์มาวางที่นี่ หรือ <span className="text-indigo-600 underline">คลิกเพื่อเลือกไฟล์</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {helperText}
                </p>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ImageIcon className="w-3 h-3" /> รูปภาพ (JPG/PNG)
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              <Film className="w-3 h-3" /> วิดีโอ (MP4/MOV)
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              <FileText className="w-3 h-3" /> เอกสาร (PDF)
            </span>
          </div>
        </div>
      </div>

      {allowUrlInput && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">หรือต้องการแนบลิงก์รูป/วิดีโอภายนอก?</span>
          <button
            type="button"
            onClick={() => setIsUrlModalOpen(true)}
            className="text-indigo-600 hover:text-indigo-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer hover:underline"
          >
            <LinkIcon className="w-3 h-3" /> แนบด้วยลิงก์ URL
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Attachment Previews List */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {attachments.map((item, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-xl border border-slate-200 p-2.5 flex items-center gap-3 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Media Thumbnail / Icon */}
              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center relative border border-slate-200">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setPreviewMedia(item)}
                  />
                ) : item.type === 'video' ? (
                  <div 
                    onClick={() => setPreviewMedia(item)}
                    className="w-full h-full bg-slate-900 flex items-center justify-center text-white cursor-pointer relative"
                  >
                    <Film className="w-5 h-5 text-indigo-400" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-white/90 text-slate-900 flex items-center justify-center text-[10px] pl-0.5">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  <FileText className="w-6 h-6 text-rose-500" />
                )}
              </div>

              {/* Media Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                  <span className="uppercase font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    {item.type}
                  </span>
                  {item.size && <span>{item.size}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewMedia(item)}
                  title="ดูตัวอย่าง"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  title="ลบไฟล์แนบ"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewMedia(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                {previewMedia.type === 'image' && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                {previewMedia.type === 'video' && <Film className="w-4 h-4 text-blue-600" />}
                {previewMedia.type === 'pdf' && <FileText className="w-4 h-4 text-rose-600" />}
                <h4 className="text-xs font-bold text-slate-800 truncate max-w-sm">
                  {previewMedia.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[70vh]">
              {previewMedia.type === 'image' && (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.name}
                  className="max-h-[65vh] w-auto max-w-full object-contain"
                />
              )}
              {previewMedia.type === 'video' && (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-h-[65vh] w-full"
                >
                  เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอนี้
                </video>
              )}
              {previewMedia.type === 'pdf' && (
                <div className="p-8 text-center text-white space-y-3">
                  <FileText className="w-16 h-16 mx-auto text-rose-400" />
                  <p className="text-sm font-semibold">{previewMedia.name}</p>
                  <a
                    href={previewMedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    เปิดเอกสาร <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>ขนาด: {previewMedia.size || 'ไม่ระบุ'}</span>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URL Input Modal */}
      {isUrlModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsUrlModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              แนบลิงก์รูปภาพ หรือ วิดีโอภายนอก
            </h4>

            <form onSubmit={handleAddUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประเภทสื่อ
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrlType('image')}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      urlType === 'image'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    รูปภาพ
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrlType('video')}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      urlType === 'video'
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    วิดีโอ
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrlType('pdf')}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      urlType === 'pdf'
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    PDF
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อกำกับไฟล์ (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ภาพถ่ายสมุดหน้า 42 หรือ คลิปทดลองลูกตุ้ม"
                  value={urlName}
                  onChange={e => setUrlName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ลิงก์ URL (https://...) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder={urlType === 'video' ? 'https://example.com/video.mp4 หรือ YouTube URL' : 'https://example.com/image.jpg'}
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xs cursor-pointer"
                >
                  เพิ่มไฟล์แนบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
