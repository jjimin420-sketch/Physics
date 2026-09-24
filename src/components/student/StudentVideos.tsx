import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VideoLesson } from '../../types';
import { 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Search, 
  Share2, 
  Bookmark, 
  Tv,
  ListVideo,
  FileVideo,
  Download,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Play
} from 'lucide-react';
import { isDirectVideoFile, normalizeVideoUrl } from '../../utils/videoUtils';

export const StudentVideos: React.FC = () => {
  const { videos, completedVideoIds, toggleVideoCompleted, syncWithServer, isServerSynced, lastSyncTime } = useApp();
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(videos[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [videoPlayError, setVideoPlayError] = useState(false);

  // Keep selectedVideo in sync when videos list loads or changes from server
  useEffect(() => {
    if (!selectedVideo && videos.length > 0) {
      setSelectedVideo(videos[0]);
    } else if (selectedVideo) {
      const exists = videos.some(v => v.id === selectedVideo.id);
      if (!exists && videos.length > 0) {
        setSelectedVideo(videos[0]);
      }
    }
  }, [videos, selectedVideo]);

  // Reset video error on change
  useEffect(() => {
    setVideoPlayError(false);
  }, [selectedVideo?.id]);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await syncWithServer(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const topics = ['all', ...Array.from(new Set(videos.map(v => v.topic)))];

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || v.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const isCompleted = selectedVideo ? completedVideoIds.includes(selectedVideo.id) : false;
  const completedCount = videos.filter(v => completedVideoIds.includes(v.id)).length;
  const progressPercent = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

  const normalized = selectedVideo ? normalizeVideoUrl(selectedVideo.videoUrl) : null;
  const isDirectFile = selectedVideo ? (selectedVideo.isUploadedFile || normalized?.isDirect) : false;

  return (
    <div className="space-y-6">
      {/* Top Banner with Learning Progress */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-2">
            <Tv className="w-3.5 h-3.5" /> วิดีโอคลิปการสอนย้อนหลัง (Physics On-Demand)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            ทบทวนบทเรียนฟิสิกส์ได้ทุกที่ ทุกเวลา
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            ดูวิดีโอคำบรรยาย บันทึกสูตรสำคัญ และฝึกทำโจทย์ตัวอย่างควบคู่ไปกับอาจารย์ผู้สอน
          </p>
        </div>

        {/* Progress Bar Badge */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-56 shrink-0">
          <div className="flex items-center justify-between text-xs font-medium mb-1.5 text-indigo-100">
            <span>ความคืบหน้าการรับชม</span>
            <span className="font-bold text-white">{completedCount} / {videos.length} บทเรียน ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-300 mt-2">
            {progressPercent === 100 ? 'เยี่ยมมาก! คุณเรียนครบทุกวิดีโอแล้ว' : 'กด "ทำเครื่องหมายว่าเรียนแล้ว" เมื่อดูคลิปจบ'}
          </p>
        </div>
      </div>

      {/* Main Video Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Video Player & Notes */}
        <div className="lg:col-span-2 space-y-5">
          {selectedVideo ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Responsive Video Frame */}
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                {isDirectFile ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      key={selectedVideo.id + '_' + selectedVideo.videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      onError={() => setVideoPlayError(true)}
                      className="w-full h-full object-contain"
                    >
                      <source src={selectedVideo.videoUrl} type="video/mp4" />
                      <source src={selectedVideo.videoUrl} type="video/quicktime" />
                      <source src={selectedVideo.videoUrl} type="video/webm" />
                      เบราว์เซอร์ไม่รองรับการเล่นวิดีโอรูปแบบนี้
                    </video>

                    {videoPlayError && (
                      <div className="absolute inset-0 bg-slate-950/95 text-white flex flex-col items-center justify-center p-6 text-center z-10">
                        <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                        <h4 className="font-bold text-sm mb-1">
                          เบราว์เซอร์บนเครื่องนี้ต้องการเปิดวิดีโอผ่านโปรแกรมเล่นของระบบ
                        </h4>
                        <p className="text-xs text-slate-300 max-w-md mb-4">
                          หากคลิปไม่เริ่มเล่นอัตโนมัติ คุณสามารถคลิกเพื่อเปิดเล่นไฟล์โดยตรงในแท็บใหม่ หรือดาวน์โหลดเพื่อเปิดด้วยแอปไฟล์ได้ทันที
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <a
                            href={selectedVideo.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
                          >
                            <ExternalLink className="w-4 h-4" /> เปิดดูในแท็บใหม่ (Direct Player)
                          </a>
                          <a
                            href={selectedVideo.videoUrl}
                            download={selectedVideo.fileName || `${selectedVideo.title}.mp4`}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700"
                          >
                            <Download className="w-4 h-4" /> ดาวน์โหลดคลิป
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <iframe
                    key={selectedVideo.id + '_' + (normalized?.url || selectedVideo.videoUrl)}
                    src={normalized?.url || selectedVideo.videoUrl}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                )}
              </div>

              {/* Video Info Bar */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedVideo.topic}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" /> {selectedVideo.duration}
                    </span>
                    {selectedVideo.fileSize && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        {selectedVideo.fileSize}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 hidden sm:inline">• ผู้สอน: {selectedVideo.uploadedBy}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Direct Tab / External View Button */}
                    <a
                      href={selectedVideo.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
                      title="เปิดดูคลิปในแท็บใหม่ หรือแอปภายนอก"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-600" />
                      <span className="hidden sm:inline">เปิดในแท็บใหม่</span>
                    </a>

                    {isDirectFile && (
                      <a
                        href={selectedVideo.videoUrl}
                        download={selectedVideo.fileName || `${selectedVideo.title}.mp4`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
                        title="ดาวน์โหลดหรือเปิดไฟล์เพื่อบันทึกลงเครื่อง/แอปไฟล์"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                        <span className="hidden sm:inline">ดาวน์โหลดไฟล์</span>
                      </a>
                    )}

                    {/* Completion Toggle Button */}
                    <button
                      id="toggle-video-completed-btn"
                      onClick={() => toggleVideoCompleted(selectedVideo.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {isCompleted ? 'เรียนจบแล้ว' : 'ทำเครื่องหมายว่าเรียนแล้ว'}
                    </button>
                  </div>
                </div>

                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedVideo.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {selectedVideo.description}
                </p>

                {/* Key Physics Formulas Cheat Sheet */}
                {selectedVideo.keyFormulas && selectedVideo.keyFormulas.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      สูตรสำคัญประจำบทเรียนนี้ (Key Formulas)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVideo.keyFormulas.map((f, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-mono font-bold text-indigo-700 shadow-2xs"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary points */}
                {selectedVideo.summaryPoints && selectedVideo.summaryPoints.length > 0 && (
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      สาระสำคัญที่ต้องจำได้ (Core Takeaways)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                      {selectedVideo.summaryPoints.map((pt, idx) => (
                        <li key={idx} className="leading-relaxed">{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500">เลือกวิดีโอจากรายการด้านขวาเพื่อเริ่มรับชม</p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Video Playlist & Topic Filters */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ListVideo className="w-4 h-4 text-indigo-600" />
                เพลย์ลิสต์บทเรียน ({videos.length})
              </h3>
              <button
                onClick={handleManualSync}
                disabled={isRefreshing}
                title={`ซิงก์คลิปจากเซิร์ฟเวอร์ส่วนกลาง (ซิงก์ล่าสุด: ${lastSyncTime})`}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>รีเฟรชคลิป</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาคลิปวิดีโอ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Topic Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {topics.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    selectedTopic === t
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'all' ? 'ทุกหัวข้อ' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Video List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredVideos.map((vid, index) => {
              const isCurrent = selectedVideo?.id === vid.id;
              const completed = completedVideoIds.includes(vid.id);

              return (
                <div
                  key={vid.id}
                  onClick={() => setSelectedVideo(vid)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                    isCurrent
                      ? 'bg-indigo-50/70 border-indigo-400 shadow-xs ring-1 ring-indigo-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 rounded text-[9px] text-white font-mono">
                      {vid.duration}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-600">
                        {vid.topic}
                      </span>
                      {(vid.isUploadedFile || isDirectVideoFile(vid.videoUrl)) && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center gap-0.5">
                          <FileVideo className="w-2.5 h-2.5" /> ไฟล์วิดีโอ {vid.fileSize ? `(${vid.fileSize})` : ''}
                        </span>
                      )}
                      {completed && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 ml-auto">
                          <CheckCircle2 className="w-3 h-3" /> เรียนแล้ว
                        </span>
                      )}
                    </div>
                    <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isCurrent ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {vid.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {vid.uploadedBy}
                    </p>
                  </div>
                </div>
              );
            })}

            {filteredVideos.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-400">ไม่พบวิดีโอที่ค้นหา</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
