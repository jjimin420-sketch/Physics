import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuizQuestion } from '../../types';
import { 
  Plus, 
  HelpCircle, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  ListOrdered,
  Eye,
  BookOpen
} from 'lucide-react';

export const TeacherQuizzes: React.FC = () => {
  const { quizzes, quizAttempts, createQuiz, deleteQuiz } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<any>(null);

  // New Quiz state
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('กลศาสตร์');
  const [description, setDescription] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q_1',
      question: 'วัตถุมวล 2 kg วางบนพื้นราบ เมื่อออกแรงดึง 10 N ความเร่งที่เกิดขึ้นคือเท่าใด? (ไม่คิดแรงเสียดทาน)',
      formula: '∑F = ma',
      options: ['2 m/s²', '5 m/s²', '10 m/s²', '20 m/s²'],
      correctIndex: 1,
      explanation: 'จากสมการ ∑F = ma แทนค่า 10 N = (2 kg) × a จะได้ a = 10 / 2 = 5 m/s²'
    }
  ]);

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: `q_${Date.now()}`,
        question: '',
        formula: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: ''
      }
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestionField = (qIdx: number, field: keyof QuizQuestion, val: any) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[qIdx] = { ...updated[qIdx], [field]: val };
      return updated;
    });
  };

  const updateOptionText = (qIdx: number, optIdx: number, text: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      const newOpts = [...updated[qIdx].options];
      newOpts[optIdx] = text;
      updated[qIdx] = { ...updated[qIdx], options: newOpts };
      return updated;
    });
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || questions.some(q => !q.question.trim())) {
      alert('กรุณากรอกหัวข้อ คำถาม และตัวเลือกให้ครบถ้วน');
      return;
    }

    createQuiz({
      title,
      topic,
      description,
      timeLimitMinutes: Number(timeLimitMinutes),
      questions
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setTimeLimitMinutes(15);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            การสร้างและจัดการแบบทดสอบฟิสิกส์ (Quiz & Exam Creator)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สร้างข้อสอบแบบปรนัย 4 ตัวเลือก ใส่สูตรคำนวณ กำหนดเวลา และเฉลยวิธีคิดฟิสิกส์
          </p>
        </div>

        <button
          id="open-create-quiz-modal-btn"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-200 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างข้อสอบใหม่</span>
        </button>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quizzes.map(quiz => {
          const attempts = quizAttempts.filter(a => a.quizId === quiz.id);
          const avgScore = attempts.length > 0
            ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length)
            : 0;

          return (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                    {quiz.topic}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewQuiz(quiz)}
                      className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                      title="ดูตัวอย่างข้อสอบและเฉลย"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`ต้องการลบแบบทดสอบ "${quiz.title}" หรือไม่?`)) {
                          deleteQuiz(quiz.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="ลบชุดข้อสอบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {quiz.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {quiz.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <ListOrdered className="w-3.5 h-3.5 text-blue-500" /> {quiz.questions.length} ข้อ
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> เวลาทำ {quiz.timeLimitMinutes} นาที
                  </span>
                  <span className="text-[11px] text-slate-400">สร้างเมื่อ: {quiz.createdAt}</span>
                </div>
              </div>

              {/* Stats for teacher */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl">
                <div>
                  <span className="text-slate-500">นักเรียนเข้าสอบ: </span>
                  <strong className="text-blue-700 font-bold">{attempts.length} ครั้ง</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">คะแนนเฉลี่ย: </span>
                  <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                    {attempts.length > 0 ? `${avgScore}%` : 'ยังไม่มีข้อมูล'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Create Quiz with Dynamic Questions */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                สร้างชุดแบบทดสอบฟิสิกส์ (Create New Quiz)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ชื่อชุดข้อสอบ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น แบบทดสอบเก็บคะแนน: แรงและกฎนิวตัน"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    หมวดวิชาฟิสิกส์
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น กลศาสตร์, คลื่นและแสง, ไฟฟ้า"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    คำอธิบายชุดข้อสอบ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น คำสั่งให้นักเรียนเลือกคำตอบที่ถูกต้องที่สุด 1 ข้อ"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    เวลาในการทำ (นาที)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Questions Builder */}
              <div className="border-t border-slate-100 pt-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    รายการข้อสอบ ({questions.length} ข้อ)
                  </h4>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่มข้อสอบอีก 1 ข้อ
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        ข้อที่ {qIdx + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> ลบข้อนี้
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        โจทย์คำถามฟิสิกส์ <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="พิมพ์โจทย์ฟิสิกส์..."
                        value={q.question}
                        onChange={(e) => updateQuestionField(qIdx, 'question', e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        สูตรคำนวณที่เกี่ยวข้อง (แสดงเป็นคำใบ้/สูตร)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น ∑F = ma หรือ v = u + at"
                        value={q.formula || ''}
                        onChange={(e) => updateQuestionField(qIdx, 'formula', e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white font-mono"
                      />
                    </div>

                    {/* 4 Choices */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        ตัวเลือกคำตอบ 4 ข้อ (คลิกวงกลมหน้าข้อเพื่อเลือกเป็นเฉลยที่ถูกต้อง)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctIndex === optIdx;
                          const letter = String.fromCharCode(65 + optIdx);

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 p-2 rounded-xl border ${
                                isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => updateQuestionField(qIdx, 'correctIndex', optIdx)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer ${
                                  isCorrect ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                                title="ตั้งเป็นคำตอบที่ถูก"
                              >
                                {letter}
                              </button>
                              <input
                                type="text"
                                required
                                placeholder={`ตัวเลือก ${letter}`}
                                value={opt}
                                onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                                className="w-full text-xs bg-transparent border-0 focus:outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        เฉลยและวิธีคิดอย่างละเอียด (Explanations for students)
                      </label>
                      <input
                        type="text"
                        placeholder="ระบุวิธีแก้สมการ หรือเหตุผลทางฟิสิกส์เพื่อให้นักเรียนเข้าใจเมื่อสอบเสร็จ..."
                        value={q.explanation}
                        onChange={(e) => updateQuestionField(qIdx, 'explanation', e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  id="confirm-create-quiz-btn"
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-200 cursor-pointer"
                >
                  บันทึกและเผยแพร่ข้อสอบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {previewQuiz.topic}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{previewQuiz.title}</h3>
                <p className="text-xs text-slate-500">จำนวน {previewQuiz.questions.length} ข้อ • เวลา {previewQuiz.timeLimitMinutes} นาที</p>
              </div>
              <button onClick={() => setPreviewQuiz(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">✕</button>
            </div>

            <div className="space-y-4">
              {previewQuiz.questions.map((q: QuizQuestion, idx: number) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="font-bold text-slate-900">
                    {idx + 1}. {q.question}
                  </div>
                  {q.formula && (
                    <div className="font-mono text-indigo-700 font-bold bg-indigo-50 p-1.5 rounded inline-block">
                      {q.formula}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded border ${
                          optIdx === q.correctIndex ? 'bg-emerald-100 border-emerald-300 font-bold text-emerald-900' : 'bg-white border-slate-200'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt} {optIdx === q.correctIndex && '✓ (เฉลย)'}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                      วิธีคิด: {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setPreviewQuiz(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
