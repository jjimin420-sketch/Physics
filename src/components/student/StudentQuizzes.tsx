import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Quiz, QuizAttempt } from '../../types';
import { 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle,
  Play,
  BookCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentQuizzes: React.FC = () => {
  const { quizzes, quizAttempts, currentUser, submitQuizAttempt } = useApp();
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  // Student's attempts
  const myAttempts = quizAttempts.filter(a => a.studentId === currentUser.id);

  const getBestScore = (quizId: string) => {
    const attempts = myAttempts.filter(a => a.quizId === quizId);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(a => a.percentage));
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    setTimeLeftSeconds(quiz.timeLimitMinutes * 60);
    setIsCompleted(false);
    setLastAttempt(null);
  };

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || isCompleted || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, isCompleted, timeLeftSeconds]);

  const handleSelectOption = (optionIdx: number) => {
    if (isCompleted) return;
    const updated = [...selectedAnswers];
    updated[currentQuestionIdx] = optionIdx;
    setSelectedAnswers(updated);
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });

    const attempt = submitQuizAttempt(
      activeQuiz.id,
      selectedAnswers,
      score,
      activeQuiz.questions.length
    );

    setLastAttempt(attempt);
    setIsCompleted(true);

    if (attempt.percentage >= 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // If in active quiz mode
  if (activeQuiz) {
    const currentQ = activeQuiz.questions[currentQuestionIdx];
    const answeredCount = selectedAnswers.filter(a => a !== -1).length;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Active Quiz Header / Top bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              {activeQuiz.topic}
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-1">{activeQuiz.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            {!isCompleted && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                timeLeftSeconds < 120 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>
            )}
            <button
              onClick={() => setActiveQuiz(null)}
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ออกจากการทดสอบ
            </button>
          </div>
        </div>

        {/* If Active & In Progress */}
        {!isCompleted ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            {/* Progress steps */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>ข้อที่ <strong className="text-slate-800 font-bold">{currentQuestionIdx + 1}</strong> จาก {activeQuiz.questions.length} ข้อ</span>
              <span>ตอบแล้ว {answeredCount} / {activeQuiz.questions.length}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQuestionIdx + 1}. {currentQ.question}
              </h3>

              {/* Optional Physics Formula Box */}
              {currentQ.formula && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl inline-flex items-center gap-2 text-xs font-mono font-bold text-indigo-900">
                  <span className="text-[10px] text-indigo-500 uppercase tracking-wider font-sans font-semibold">สูตรที่เกี่ยวข้อง:</span>
                  {currentQ.formula}
                </div>
              )}
            </div>

            {/* Choices */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-950 font-semibold shadow-xs'
                        : 'bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {letter}
                    </span>
                    <span className="mt-0.5 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Controls Prev / Next / Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> ข้อก่อนหน้า
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-200 cursor-pointer"
                  >
                    ข้อถัดไป <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    id="finish-quiz-submit-btn"
                    onClick={handleFinishQuiz}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> ส่งคำตอบและตรวจผล
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Result & Explanation Mode */
          <div className="space-y-6">
            {/* Score Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center shadow-xs space-y-4">
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
                (lastAttempt?.percentage || 0) >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}>
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {(lastAttempt?.percentage || 0) >= 70 ? 'ยอดเยี่ยมมาก! คุณผ่านเกณฑ์' : 'ผลการทดสอบของคุณ'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ได้คะแนน {lastAttempt?.score} จาก {lastAttempt?.totalQuestions} ข้อ คิดเป็น {lastAttempt?.percentage}%
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => startQuiz(activeQuiz)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> ทำแบบทดสอบอีกครั้ง
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  กลับสู่รายการแบบทดสอบ
                </button>
              </div>
            </div>

            {/* Detailed Question Review with Physics Explanations */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookCheck className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">เฉลยและวิธีคิดทางฟิสิกส์อย่างละเอียด (Step-by-step Explanations)</h4>
              </div>

              <div className="space-y-6">
                {activeQuiz.questions.map((q, qIdx) => {
                  const studentAnswerIdx = lastAttempt?.answers[qIdx];
                  const isCorrect = studentAnswerIdx === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border ${
                        isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/30 border-rose-200'
                      } space-y-3`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-sm text-slate-900 flex items-start gap-2">
                          <span className="mt-0.5">
                            {isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                          </span>
                          <span>{qIdx + 1}. {q.question}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isCorrect ? '+1 คะแนน' : '0 คะแนน'}
                        </span>
                      </div>

                      {/* Options breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isCorrectOption = optIdx === q.correctIndex;
                          const isSelectedByStudent = optIdx === studentAnswerIdx;

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                isCorrectOption
                                  ? 'bg-emerald-100/70 border-emerald-300 font-semibold text-emerald-950'
                                  : isSelectedByStudent
                                  ? 'bg-rose-100/70 border-rose-300 font-semibold text-rose-950'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                              {isCorrectOption && <span className="text-[10px] text-emerald-700 font-bold ml-2">คำตอบที่ถูกต้อง</span>}
                              {isSelectedByStudent && !isCorrectOption && <span className="text-[10px] text-rose-600 font-bold ml-2">คุณเลือกข้อนี้</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Physics Explanation */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                        <div className="font-bold text-indigo-700 flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" /> คำอธิบายและหลักการฟิสิกส์:
                        </div>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Quizzes list view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            แบบทดสอบวัดความรู้ฟิสิกส์ (Physics Quizzes & Tests)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ฝึกทำข้อสอบประเมินตนเอง พร้อมระบบจับเวลาและเฉลยวิธีคิดละเอียดหลังส่ง
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 text-xs">
            <span className="text-indigo-600 font-medium">คุณทำไปแล้ว:</span>{' '}
            <strong className="text-indigo-950 font-bold">{myAttempts.length} ครั้ง</strong>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quizzes.map(quiz => {
          const bestScore = getBestScore(quiz.id);
          const hasAttempted = bestScore !== null;

          return (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {quiz.topic}
                  </span>

                  {hasAttempted ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      bestScore >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      <Award className="w-3.5 h-3.5" /> คะแนนสูงสุด: {bestScore}%
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      ยังไม่เคยทดสอบ
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {quiz.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {quiz.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> {quiz.questions.length} ข้อ
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> เวลาทำ {quiz.timeLimitMinutes} นาที
                  </span>
                  <span className="text-slate-400">ผู้สร้าง: {quiz.createdBy}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  ทดสอบได้ไม่จำกัดครั้ง
                </span>
                <button
                  id={`start-quiz-btn-${quiz.id}`}
                  onClick={() => startQuiz(quiz)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {hasAttempted ? 'ทดสอบใหม่อีกครั้ง' : 'เริ่มทำแบบทดสอบ'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
