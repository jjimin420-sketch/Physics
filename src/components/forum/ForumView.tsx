import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  ThumbsUp, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft, 
  Send, 
  Tag, 
  Layers, 
  Sparkles, 
  UserCheck, 
  X,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ForumQuestion } from '../../types';

export const ForumView: React.FC = () => {
  const { 
    currentUser, 
    forumQuestions, 
    createQuestion, 
    addAnswer, 
    toggleQuestionUpvote, 
    toggleAnswerUpvote, 
    acceptAnswer,
    deleteQuestion 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'solved'>('all');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // New Question Modal
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('กลศาสตร์');
  const [newContent, setNewContent] = useState('');
  const [newFormulaSnippet, setNewFormulaSnippet] = useState('');
  const [newTags, setNewTags] = useState('');

  // Answer Input State
  const [answerContent, setAnswerContent] = useState('');
  const [answerFormula, setAnswerFormula] = useState('');

  const TOPICS = [
    'ทั้งหมด',
    'กลศาสตร์',
    'งานและพลังงาน',
    'การเคลื่อนที่ใน 2 มิติ',
    'คลื่นและเสียง',
    'แสงและทัศนูปกรณ์',
    'ไฟฟ้าและแม่เหล็ก',
    'เทอร์โมไดนามิกส์',
    'ฟิสิกส์ยุคใหม่'
  ];

  // Active question
  const activeQuestion = forumQuestions.find(q => q.id === activeQuestionId);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return forumQuestions.filter(q => {
      const matchTopic = selectedTopic === 'all' || q.topic === selectedTopic;
      const matchStatus = statusFilter === 'all' || q.status === statusFilter;

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchTopic && matchStatus;

      const inTitle = q.title.toLowerCase().includes(query);
      const inContent = q.content.toLowerCase().includes(query);
      const inTags = q.tags.some(t => t.toLowerCase().includes(query));
      const inAuthor = q.authorName.toLowerCase().includes(query);

      return matchTopic && matchStatus && (inTitle || inContent || inTags || inAuthor);
    });
  }, [forumQuestions, selectedTopic, statusFilter, searchQuery]);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArr = newTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    createQuestion({
      title: newTitle.trim(),
      topic: newTopic,
      content: newContent.trim(),
      formulaSnippet: newFormulaSnippet.trim() || undefined,
      tags: tagsArr.length > 0 ? tagsArr : [newTopic]
    });

    setNewTitle('');
    setNewContent('');
    setNewFormulaSnippet('');
    setNewTags('');
    setIsAskModalOpen(false);
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestionId || !answerContent.trim()) return;

    addAnswer(
      activeQuestionId, 
      answerContent.trim(), 
      answerFormula.trim() || undefined
    );

    setAnswerContent('');
    setAnswerFormula('');
  };

  return (
    <div className="space-y-6" id="forum-view-root">
      {/* If looking at a single question detail */}
      {activeQuestion ? (
        <div className="space-y-6">
          {/* Back button */}
          <button
            id="btn-back-to-forum"
            onClick={() => setActiveQuestionId(null)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm flex items-center gap-2 border border-slate-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับสู่รายการกระทู้ถาม-ตอบ
          </button>

          {/* Question Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  {activeQuestion.topic}
                </span>
                {activeQuestion.status === 'solved' ? (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    มีคำตอบที่ได้รับการรับรองแล้ว
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    กำลังรอคำตอบ / อภิปราย
                  </span>
                )}
              </div>

              {(currentUser.role === 'admin' || currentUser.id === activeQuestion.authorId) && (
                <button
                  onClick={() => {
                    deleteQuestion(activeQuestion.id);
                    setActiveQuestionId(null);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="ลบกระทู้คำถามนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Question Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 leading-snug">
              {activeQuestion.title}
            </h1>

            {/* Question Content */}
            <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line mb-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-100">
              {activeQuestion.content}
            </div>

            {/* Formula snippet if any */}
            {activeQuestion.formulaSnippet && (
              <div className="mb-4 p-3.5 bg-slate-900 text-amber-300 rounded-xl font-mono text-xs sm:text-sm">
                <span className="text-slate-400 text-xs block mb-1 font-sans">สมการ / สูตรที่เกี่ยวข้อง:</span>
                {activeQuestion.formulaSnippet}
              </div>
            )}

            {/* Tags */}
            {activeQuestion.tags && activeQuestion.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {activeQuestion.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer row: Author & Upvotes */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeQuestion.authorAvatar}
                  alt={activeQuestion.authorName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{activeQuestion.authorName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      activeQuestion.authorRole === 'teacher' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {activeQuestion.authorRole === 'teacher' ? 'ครูผู้สอน' : 'นักเรียน'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">ถามเมื่อ {activeQuestion.createdAt}</span>
                </div>
              </div>

              <button
                id="btn-upvote-question"
                onClick={() => toggleQuestionUpvote(activeQuestion.id)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>เห็นว่ามีประโยชน์ ({activeQuestion.upvotes})</span>
              </button>
            </div>
          </div>

          {/* Answers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                คำตอบทั้งหมด ({activeQuestion.answers.length})
              </h2>
              <span className="text-xs text-slate-500">
                คุณครูและเพื่อนๆ สามารถร่วมแลกเปลี่ยนความรู้ได้
              </span>
            </div>

            {activeQuestion.answers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400">
                <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">ยังไม่มีคำตอบในข้อซักถามนี้</p>
                <p className="text-xs text-slate-400 mt-1">เป็นคนแรกที่ช่วยไขข้อข้องใจฟิสิกส์ข้อนี้ได้เลยที่ช่องด้านล่าง</p>
              </div>
            ) : (
              activeQuestion.answers.map((ans, idx) => {
                const isTeacher = ans.authorRole === 'teacher';
                const canAccept = (currentUser.role === 'teacher' || currentUser.id === activeQuestion.authorId) && !ans.isAccepted;

                return (
                  <div
                    key={ans.id || idx}
                    id={`answer-item-${ans.id}`}
                    className={`bg-white rounded-3xl p-6 sm:p-7 shadow-sm border transition-all ${
                      ans.isAccepted 
                        ? 'border-emerald-300 ring-2 ring-emerald-100' 
                        : isTeacher 
                        ? 'border-indigo-200 bg-indigo-50/20' 
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        {isTeacher && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            คำตอบจากครูผู้สอน
                          </span>
                        )}
                        {ans.isAccepted && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            คำตอบที่ได้รับการรับรองว่าถูกต้อง
                          </span>
                        )}
                      </div>

                      {canAccept && (
                        <button
                          onClick={() => acceptAnswer(activeQuestion.id, ans.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          รับรองคำตอบนี้
                        </button>
                      )}
                    </div>

                    {/* Answer Content */}
                    <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line mb-4">
                      {ans.content}
                    </div>

                    {/* Formula Snippet */}
                    {ans.formulaSnippet && (
                      <div className="mb-4 p-3 bg-slate-900 text-amber-300 rounded-xl font-mono text-xs">
                        <span className="text-slate-400 text-[10px] block mb-0.5">สูตรที่ใช้อธิบาย:</span>
                        {ans.formulaSnippet}
                      </div>
                    )}

                    {/* Author & Upvotes */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ans.authorAvatar}
                          alt={ans.authorName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{ans.authorName}</span>
                            <span className="text-[10px] text-slate-400">({ans.authorRole === 'teacher' ? 'ครูผู้สอน' : 'นักเรียน'})</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{ans.createdAt}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleAnswerUpvote(activeQuestion.id, ans.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>({ans.upvotes})</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Answer Input Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 mt-6">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                เขียนคำตอบของคุณ
              </h3>
              <form onSubmit={handleAnswerSubmit} className="space-y-3">
                <textarea
                  id="textarea-answer-content"
                  required
                  rows={4}
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder={`ตอบในนาม ${currentUser.name} (${currentUser.role === 'teacher' ? 'ครูผู้สอน' : 'นักเรียน'}): อธิบายแนวคิด ขั้นตอน หรือข้อสังเกต...`}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={answerFormula}
                    onChange={(e) => setAnswerFormula(e.target.value)}
                    placeholder="สมการ/สูตรฟิสิกส์ประกอบ (Optional เช่น v = u + at)"
                    className="w-full sm:flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <button
                    id="btn-submit-answer"
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    ส่งคำตอบ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Questions Feed / List View */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-1">
                  <MessageSquare className="w-5 h-5" />
                  <span>เว็บบอร์ดถาม-ตอบ ฟิสิกส์ (Physics Q&A Community)</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  ห้องซักถามข้อสงสัยและแลกเปลี่ยนความรู้
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  ติดปัญหาโจทย์ฟิสิกส์ข้อไหน? โพสต์ถามได้ทันที ครูผู้สอนและเพื่อนๆ ในชั้นเรียนพร้อมช่วยตอบและอธิบาย
                </p>
              </div>

              <button
                id="btn-open-ask-modal"
                onClick={() => setIsAskModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                ตั้งคำถามใหม่
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="input-forum-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหากระทู้ตามหัวข้อ, คำถาม, หรือแท็ก เช่น แตกแรง, พื้นเอียง, ดอปเปลอร์..."
                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Topic Filter Pills */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>จำแนกตามหัวข้อ:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic === 'ทั้งหมด' ? 'all' : topic)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      (selectedTopic === 'all' && topic === 'ทั้งหมด') || selectedTopic === topic
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">สถานะ:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setStatusFilter('solved')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === 'solved' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    มีคำตอบแล้ว
                  </button>
                  <button
                    onClick={() => setStatusFilter('open')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === 'open' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    รอคำตอบ
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                พบ <span className="font-bold text-slate-900">{filteredQuestions.length}</span> คำถาม
              </div>
            </div>
          </div>

          {/* Question List Feed */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">ไม่พบกระทู้ที่ตรงกับเงื่อนไข</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                  ยังไม่มีคำถามในหมวดนี้ คุณสามารถเป็นคนแรกที่กด &quot;ตั้งคำถามใหม่&quot; ได้เลย!
                </p>
                <button
                  onClick={() => setIsAskModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors"
                >
                  ตั้งคำถามแรกเลย
                </button>
              </div>
            ) : (
              filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  id={`question-card-${q.id}`}
                  onClick={() => setActiveQuestionId(q.id)}
                  className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Topic & Status */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {q.topic}
                        </span>
                        {q.status === 'solved' ? (
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ตอบแล้ว
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-amber-600" />
                            รอคำตอบ
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {q.createdAt}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-2 line-clamp-2">
                        {q.title}
                      </h3>

                      {/* Snippet */}
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
                        {q.content}
                      </p>

                      {/* Tags & Author */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {q.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <img
                            src={q.authorAvatar}
                            alt={q.authorName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-semibold text-slate-700">{q.authorName}</span>
                          <span className="text-[10px] text-slate-400">
                            ({q.authorRole === 'teacher' ? 'ครูผู้สอน' : 'นักเรียน'})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Pill on right */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{q.answers.length} คำตอบ</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                        <span>{q.upvotes} โหวต</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Ask Question Modal */}
      {isAskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div 
            id="modal-ask-question"
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">ตั้งกระทู้ถามปัญหาฟิสิกส์</h3>
                  <p className="text-xs text-slate-500">โพสต์คำถามเพื่อให้ครูและเพื่อนๆ ช่วยวิเคราะห์</p>
                </div>
              </div>
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หัวข้อคำถาม (สั้นกระชับ ชัดเจน) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น สงสัยเรื่องการแตกแรงบนพื้นเอียง ทำไมต้องใช้ mg sin θ?"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หมวดหมู่ฟิสิกส์
                </label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  {TOPICS.filter(t => t !== 'ทั้งหมด').map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดของคำถาม / สิ่งที่สงสัย <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="อธิบายว่าติดปัญหาตรงจุดไหน หรือได้ลองคิดวิธีใดไปแล้วบ้าง..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สมการหรือสูตรที่เกี่ยวข้อง (Optional)
                </label>
                <input
                  type="text"
                  value={newFormulaSnippet}
                  onChange={(e) => setNewFormulaSnippet(e.target.value)}
                  placeholder="เช่น W = F · s · cos θ"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  แท็กคำค้นหา (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="เช่น แตกแรง, นิวตัน, งานและพลังงาน"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  โพสต์คำถาม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
