import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { VideoLesson } from '../../types';
import { 
  Tv, 
  Plus, 
  Trash2, 
  Play, 
  Clock, 
  Sparkles,
  Link as LinkIcon,
  UploadCloud,
  FileVideo,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  X,
  ExternalLink,
  Film,
  FolderOpen
} from 'lucide-react';
import { 
  extractVideoMetadataAndThumbnail, 
  uploadVideoFileToServer, 
  isDirectVideoFile, 
  normalizeVideoUrl,
  formatBytes 
} from '../../utils/videoUtils';

export const TeacherVideos: React.FC = () => {
  const { videos, uploadVideo, deleteVideo, refreshVideos, syncWithServer, isServerSynced, lastSyncTime } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoLesson | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string>('');

  // Upload mode: 'file' (direct video file upload) or 'link' (YouTube/external URL)
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');

  // Form state
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('กลศาสตร์');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('25:00 นาที');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [keyFormulasText, setKeyFormulasText] = useState('');
  const [summaryPointsText, setSummaryPointsText] = useState('');

  // File upload specific state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [fileSizeFormatted, setFileSizeFormatted] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadDetailText, setUploadDetailText] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesAppInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const physicsTopics = [
    'กลศาสตร์',
    'การเคลื่อนที่ใน 2 มิติ',
    'งานและพลังงาน',
    'คลื่นและแสง',
    'ไฟฟ้าและแม่เหล็ก',
    'ฟิสิกส์นิวเคลียร์และอนุภาค'
  ];

  const commonFormulaPresets = [
    '∑F = ma',
    'Ek = 1/2 m v²',
    'Ep = mgh',
    'W = F·s·cos θ',
    'v = fλ',
    'V = IR',
    'P = IV',
    'E = mc²'
  ];

  // Manual sync with central server
  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithServer(true);
    setTimeout(() => setIsSyncing(false), 500);
  };

  // Handle video file selected via Files app, Gallery, or Drag-and-Drop
  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Flexible video detection supporting Files app (iOS/Android/Desktop)
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isKnownVideoExt = [
      'mp4', 'mov', 'webm', 'mkv', 'm4v', 'ogg', 'avi', '3gp', 'flv', 'wmv', 'ts', 'm4p'
    ].includes(ext);
    const isVideoMime = file.type.startsWith('video/');
    const isGenericMime = !file.type || file.type === 'application/octet-stream' || file.type === 'application/x-download';
    const isDocumentExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip'].includes(ext);

    if (isDocumentExt || (!isVideoMime && !isKnownVideoExt && !isGenericMime)) {
      setUploadError(`ไฟล์ "${file.name}" อาจไม่ใช่ไฟล์วิดีโอ กรุณาเลือกไฟล์วิดีโอ เช่น .mp4, .mov, .webm`);
      return;
    }

    setUploadError('');
    setIsProcessingFile(true);
    setSelectedFile(file);
    setFileSizeFormatted(formatBytes(file.size));

    // Create local object URL for instant preview in modal
    try {
      const tempUrl = URL.createObjectURL(file);
      setFilePreviewUrl(tempUrl);
    } catch (e) {
      console.warn('Could not create ObjectURL:', e);
    }

    // Default title from filename if title is empty
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }

    try {
      // Auto extract duration and frame thumbnail from video file
      const meta = await extractVideoMetadataAndThumbnail(file);
      if (meta.durationFormatted) {
        setDuration(meta.durationFormatted);
      }
      if (meta.thumbnailDataUrl) {
        setThumbnailUrl(meta.thumbnailDataUrl);
      }
    } catch (err) {
      console.warn('Metadata extraction note:', err);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const addFormulaPreset = (preset: string) => {
    const current = keyFormulasText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    if (!current.includes(preset)) {
      setKeyFormulasText(current.length > 0 ? `${keyFormulasText}, ${preset}` : preset);
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setThumbnailUrl('');
    setDuration('25:00 นาที');
    setKeyFormulasText('');
    setSummaryPointsText('');
    setSelectedFile(null);
    setFilePreviewUrl('');
    setFileSizeFormatted('');
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (filesAppInputRef.current) filesAppInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setUploadError('กรุณากรอกชื่อคลิปวิดีโอ');
      return;
    }

    const keyFormulas = keyFormulasText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const summaryPoints = summaryPointsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (uploadMode === 'file') {
      if (!selectedFile) {
        setUploadError('กรุณาเลือกไฟล์วิดีโอจากคอมพิวเตอร์');
        return;
      }

      setIsUploading(true);
      setUploadProgress(5);
      setUploadDetailText('กำลังเตรียมสตรีมไฟล์...');

      try {
        // Upload video file directly to backend server with byte tracking
        const uploadResult = await uploadVideoFileToServer(selectedFile, (pct, loaded, total) => {
          setUploadProgress(pct);
          if (loaded !== undefined && total !== undefined) {
            setUploadDetailText(`${formatBytes(loaded)} / ${formatBytes(total)} (${pct}%)`);
          } else {
            setUploadDetailText(`${pct}%`);
          }
        });

        await uploadVideo({
          title,
          topic,
          description: description.trim() || `การบรรยายและสาธิตการทดลองวิชาฟิสิกส์เรื่อง ${topic}`,
          videoUrl: uploadResult.url,
          duration,
          thumbnailUrl: thumbnailUrl || undefined,
          keyFormulas: keyFormulas.length > 0 ? keyFormulas : ['∑F = ma'],
          summaryPoints: summaryPoints.length > 0 ? summaryPoints : ['สรุปใจความสำคัญและเทคนิคการทำโจทย์'],
          isUploadedFile: true,
          fileName: uploadResult.filename,
          fileSize: uploadResult.fileSize || fileSizeFormatted,
          videoType: 'file'
        });

        setUploadSuccessNotice(`อัปโหลดและซิงก์คลิป "${title}" เรียบร้อยแล้ว! อุปกรณ์อื่นๆ สามารถเปิดดูได้ทันที`);
        setTimeout(() => setUploadSuccessNotice(''), 8000);
        resetForm();
      } catch (err: any) {
        console.error('Upload failed:', err);
        setUploadError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์วิดีโอไปยังเซิร์ฟเวอร์');
        setIsUploading(false);
      }
    } else {
      // Link mode
      if (!videoUrl.trim()) {
        setUploadError('กรุณาระบุลิงก์วิดีโอ YouTube หรือลิงก์วิดีโอ');
        return;
      }

      const normalizedLink = normalizeVideoUrl(videoUrl);
      const ytIdMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
      const autoThumbnail = ytIdMatch && ytIdMatch[1]
        ? `https://img.youtube.com/vi/${ytIdMatch[1]}/hqdefault.jpg`
        : undefined;

      await uploadVideo({
        title,
        topic,
        description: description.trim() || `การบรรยายวิชาฟิสิกส์เรื่อง ${topic}`,
        videoUrl: normalizedLink.url,
        duration,
        thumbnailUrl: thumbnailUrl || autoThumbnail,
        keyFormulas: keyFormulas.length > 0 ? keyFormulas : ['∑F = ma'],
        summaryPoints: summaryPoints.length > 0 ? summaryPoints : ['สรุปใจความสำคัญและเทคนิคการทำโจทย์'],
        isUploadedFile: normalizedLink.isDirect,
        videoType: normalizedLink.provider === 'youtube' ? 'youtube' : (normalizedLink.isDirect ? 'file' : 'external')
      });

      setUploadSuccessNotice(`เผยแพร่คลิป "${title}" เรียบร้อยแล้ว!`);
      setTimeout(() => setUploadSuccessNotice(''), 6000);
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Server Sync status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Tv className="w-5 h-5 text-blue-600" />
              คลังและจัดการคลิปวิดีโอการสอน (Physics Lecture Repository)
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> เชื่อมต่อเซิร์ฟเวอร์กลาง (ซิงก์ทุกเครื่อง)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            อัปโหลดไฟล์วิดีโอจากเครื่องโดยตรง (.mp4, .webm, .mov) หรือแนบลิงก์สื่อการสอน นักเรียนทุกเครื่องจะเปิดดูได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            title="รีเฟรชข้อมูลคลิปจากเซิร์ฟเวอร์"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">ซิงก์ข้อมูล</span>
          </button>

          <button
            id="open-upload-video-modal-btn"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-200 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>อัปโหลดคลิปการสอนใหม่</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {uploadSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-950">สำเร็จ!</p>
              <p className="text-xs text-emerald-700">{uploadSuccessNotice}</p>
            </div>
          </div>
          <button 
            onClick={() => setUploadSuccessNotice('')}
            className="text-emerald-600 hover:text-emerald-900 p-1 text-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Info Notice for Cross-Device Synchronization */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 text-xs text-slate-700 flex items-start gap-3">
        <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
          <FileVideo className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 text-sm">
            💡 รองรับการอัปโหลดไฟล์วิดีโอจากเครื่องโดยตรง ไม่ต้องแปะแค่ลิงก์
          </h4>
          <p className="text-slate-600 leading-relaxed">
            เมื่อครูอัปโหลดไฟล์วิดีโอ (เช่น บันทึกการสอนหรือคลิปแล็บ) ระบบจะจัดเก็บไฟล์ไว้บนเซิร์ฟเวอร์ส่วนกลาง 
            ทำให้นักเรียนหรือครูท่านอื่นที่เปิดผ่านคอมพิวเตอร์ มือถือ หรือแท็บเล็ตเครื่องอื่น สามารถเปิดชมคลิปวิดีโอและฟังเสียงได้อย่างชัดเจน
          </p>
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map(vid => {
          const isFile = isDirectVideoFile(vid.videoUrl);
          return (
            <div
              key={vid.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail preview with play trigger */}
                <div 
                  onClick={() => {
                    setPreviewVideo(vid);
                    setIsPreviewModalOpen(true);
                  }}
                  className="relative aspect-video w-full bg-slate-900 overflow-hidden cursor-pointer"
                >
                  <img
                    src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80'}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                      {vid.topic}
                    </span>
                    <span className="text-[10px] text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">
                      {vid.duration}
                    </span>
                  </div>

                  {/* Badge for file vs YouTube */}
                  <div className="absolute top-2.5 left-2.5">
                    {isFile ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                        <FileVideo className="w-3 h-3" /> ไฟล์วิดีโอ {vid.fileSize ? `(${vid.fileSize})` : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                        <LinkIcon className="w-3 h-3" /> YouTube / ลิงก์
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 
                      onClick={() => {
                        setPreviewVideo(vid);
                        setIsPreviewModalOpen(true);
                      }}
                      className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer"
                    >
                      {vid.title}
                    </h3>
                    <button
                      onClick={() => {
                        if (confirm(`ต้องการลบคลิป "${vid.title}" ออกจากระบบส่วนกลางหรือไม่?`)) {
                          deleteVideo(vid.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                      title="ลบคลิปนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {vid.description}
                  </p>

                  {vid.keyFormulas && vid.keyFormulas.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {vid.keyFormulas.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {f}
                        </span>
                      ))}
                      {vid.keyFormulas.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{vid.keyFormulas.length - 3} สูตร</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 truncate">
                  <span>ผู้สอน: {vid.uploadedBy}</span>
                  <span className="text-[11px] text-slate-400">• {vid.uploadedAt}</span>
                </div>
                <button
                  onClick={() => {
                    setPreviewVideo(vid);
                    setIsPreviewModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" /> เปิดดู
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Preview Modal */}
      {isPreviewModalOpen && previewVideo && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-3xl w-full p-5 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 truncate pr-2">
                <Tv className="w-4 h-4 text-blue-400 shrink-0" />
                <h3 className="font-bold text-sm truncate">{previewVideo.title}</h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden mb-4">
              {(() => {
                const norm = normalizeVideoUrl(previewVideo.videoUrl);
                const isDirect = previewVideo.isUploadedFile || norm.isDirect;
                return isDirect ? (
                  <video
                    key={previewVideo.id + '_' + previewVideo.videoUrl}
                    src={previewVideo.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                  >
                    เบราว์เซอร์ไม่รองรับการเล่นไฟล์นี้
                  </video>
                ) : (
                  <iframe
                    key={previewVideo.id + '_' + norm.url}
                    src={norm.url || previewVideo.videoUrl}
                    title={previewVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                );
              })()}
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-900/60 text-blue-200 border border-blue-700/60 rounded font-semibold">
                    {previewVideo.topic}
                  </span>
                  <span className="text-slate-400">ความยาว: {previewVideo.duration} • อัปโหลดโดย: {previewVideo.uploadedBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> เปิดดูในแท็บใหม่
                  </a>
                </div>
              </div>
              <p className="text-slate-400">{previewVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tv className="w-4 h-4 text-blue-600" />
                อัปโหลดคลิปการสอนฟิสิกส์ (Upload Physics Lecture)
              </h3>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Mode Selector Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  uploadMode === 'file'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>อัปโหลดไฟล์จากเครื่อง (.mp4, .webm)</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('link')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  uploadMode === 'link'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>ใส่ลิงก์ YouTube</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload Zone */}
              {uploadMode === 'file' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      เลือกไฟล์วิดีโอจากเครื่องหรือแอปไฟล์ <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-blue-600 font-medium">สตรีมขึ้นเซิร์ฟเวอร์ให้อุปกรณ์อื่นดูได้ทันที</span>
                  </div>

                  {/* Native Hidden File Inputs */}
                  <input
                    id="teacher-video-files-app-input"
                    type="file"
                    accept="video/*,*/*"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <input
                    id="teacher-video-gallery-input"
                    type="file"
                    accept="video/*"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <input
                    id="teacher-video-dropzone-input"
                    type="file"
                    accept="video/*,*/*"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {!selectedFile ? (
                    <div className="space-y-2.5">
                      {/* Direct Two-Button Selector: Files App vs Video Library */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <label
                          htmlFor="teacher-video-files-app-input"
                          className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-950 transition-all text-left cursor-pointer group shadow-2xs active:scale-[0.99]"
                        >
                          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                            <FolderOpen className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-blue-900">เลือกจาก "แอปไฟล์" (Files)</p>
                              <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-semibold">แนะนำ</span>
                            </div>
                            <p className="text-[11px] text-blue-700/80 mt-0.5">iCloud Drive, Google Drive, ไฟล์ในเครื่อง</p>
                          </div>
                        </label>

                        <label
                          htmlFor="teacher-video-gallery-input"
                          className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-purple-200 bg-purple-50/80 hover:bg-purple-100 text-purple-950 transition-all text-left cursor-pointer group shadow-2xs active:scale-[0.99]"
                        >
                          <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                            <Film className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-purple-900">เลือกจาก "คลังวิดีโอ" (Photos)</p>
                            <p className="text-[11px] text-purple-700/80 mt-0.5">คลังภาพ/วิดีโอ, Camera Roll</p>
                          </div>
                        </label>
                      </div>

                      {/* Dropzone Area with native label trigger */}
                      <label
                        htmlFor="teacher-video-dropzone-input"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="block border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-600 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            หรือแตะเพื่อเลือกไฟล์ / ลากไฟล์วิดีโอมาวางที่นี่
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            รองรับ MP4, WebM, MOV, MKV, M4V (ระบบจะสตรีมขึ้นเซิร์ฟเวอร์เพื่อให้ทุกเครื่องเปิดดูได้)
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 truncate">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                            <FileVideo className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              ขนาดไฟล์: {fileSizeFormatted} • ความยาว: {duration}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <label
                            htmlFor="teacher-video-files-app-input"
                            className="text-blue-600 hover:text-blue-700 text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer font-semibold inline-block"
                          >
                            เลือกใหม่จากแอปไฟล์
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setFilePreviewUrl('');
                              setThumbnailUrl('');
                              setUploadDetailText('');
                            }}
                            className="text-slate-400 hover:text-rose-600 text-xs p-1.5 cursor-pointer rounded-lg hover:bg-slate-200"
                            title="ยกเลิกไฟล์นี้"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Mini Video Preview inside modal */}
                      {filePreviewUrl && (
                        <div className="relative aspect-video w-full rounded-xl bg-black overflow-hidden max-h-48 shadow-inner">
                          <video
                            src={filePreviewUrl}
                            controls
                            playsInline
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}

                      {/* Auto thumbnail capture notification */}
                      {thumbnailUrl && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>สร้างภาพตัวอย่าง (Thumbnail) จากเฟรมวิดีโออัตโนมัติเรียบร้อย</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="mt-4 p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                          กำลังสตรีมวิดีโอขึ้นเซิร์ฟเวอร์ส่วนกลาง...
                        </span>
                        <span className="text-blue-700">{uploadProgress}%</span>
                      </div>
                      
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>{uploadDetailText || 'กำลังส่งข้อมูล...'}</span>
                        <span className="text-blue-600">กรุณาอย่าปิดหน้านี้ขณะอัปโหลด</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* YouTube / Link Mode */}
              {uploadMode === 'link' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      URL วิดีโอ (YouTube หรือ ลิงก์คลิป) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required={uploadMode === 'link'}
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Common Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    หัวข้อบทเรียนฟิสิกส์
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
                    ความยาวของคลิป
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 28:15 นาที"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ชื่อคลิปวิดีโอ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สรุปเข้ม: การคำนวณงานและพลังงานกล Ep + Ek"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  คำอธิบายเนื้อหาและตัวอย่างที่สอน
                </label>
                <textarea
                  rows={2}
                  placeholder="อธิบายเนื้อหาโดยย่อ เทคนิคการจำ และจุดที่นักเรียนมักทำผิด..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Quick Formula Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    สูตรฟิสิกส์สำคัญ (คั่นด้วยจุลภาค , )
                  </label>
                  <span className="text-[10px] text-slate-400">คลิกที่สูตรเพื่อใส่เร็ว</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {commonFormulaPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => addFormulaPreset(preset)}
                      className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="เช่น W = F·s·cos θ , Ek = 1/2 m v² , Ep = mgh"
                  value={keyFormulasText}
                  onChange={(e) => setKeyFormulasText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  สาระสำคัญ/ข้อควรจำ (บรรทัดละ 1 ข้อ)
                </label>
                <textarea
                  rows={2}
                  placeholder="งานจะมีค่าเป็นบวกเมื่อทิศของแรงไปทางเดียวกับการกระจัด&#10;กฎอนุรักษ์พลังงานกลใช้ได้เมื่อไม่มีแรงเสียดทาน"
                  value={summaryPointsText}
                  onChange={(e) => setSummaryPointsText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  id="confirm-upload-video-btn"
                  type="submit"
                  disabled={isUploading || isProcessingFile}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังอัปโหลด ({uploadProgress}%)...</span>
                    </>
                  ) : (
                    <span>บันทึกและเผยแพร่คลิป</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
