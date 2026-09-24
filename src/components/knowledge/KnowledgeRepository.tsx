import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Calculator, 
  Layers, 
  Sparkles, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Lightbulb, 
  AlertTriangle,
  Info,
  X,
  Trash2,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KnowledgeFormula, DifficultyLevel, SolvedExample } from '../../types';

export const KnowledgeRepository: React.FC = () => {
  const { formulas, addFormula, deleteFormula, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [expandedFormulaId, setExpandedFormulaId] = useState<string | null>(null);
  
  // Interactive Calculator modal
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);
  const [calcInputs, setCalcInputs] = useState<{ [key: string]: number | '' }>({});

  // Add Formula Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('กลศาสตร์');
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('basic');
  const [newFormula, setNewFormula] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [newConditions, setNewConditions] = useState('');
  
  // Variable defs in new formula
  const [newVariables, setNewVariables] = useState<Array<{ symbol: string; meaning: string; unit: string }>>([
    { symbol: '', meaning: '', unit: '' }
  ]);

  // Solved example in new formula
  const [exampleProblem, setExampleProblem] = useState('');
  const [exampleGiven, setExampleGiven] = useState('');
  const [exampleFormulaUsed, setExampleFormulaUsed] = useState('');
  const [exampleSteps, setExampleSteps] = useState('');
  const [exampleAnswer, setExampleAnswer] = useState('');
  const [exampleTips, setExampleTips] = useState('');

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

  // Filter formulas
  const filteredFormulas = useMemo(() => {
    return formulas.filter(f => {
      const matchTopic = selectedTopic === 'all' || f.topic === selectedTopic;
      const matchDifficulty = selectedDifficulty === 'all' || f.difficulty === selectedDifficulty;
      
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchTopic && matchDifficulty;

      const inTitle = f.title.toLowerCase().includes(q);
      const inFormula = f.formula.toLowerCase().includes(q);
      const inConcept = f.conceptSummary.toLowerCase().includes(q);
      const inVariables = f.variableDefinitions.some(v => 
        v.symbol.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)
      );
      const inExamples = f.examples.some(ex => 
        ex.problem.toLowerCase().includes(q) || 
        ex.answer.toLowerCase().includes(q) ||
        ex.solutionSteps.some(s => s.toLowerCase().includes(q))
      );

      return matchTopic && matchDifficulty && (inTitle || inFormula || inConcept || inVariables || inExamples);
    });
  }, [formulas, selectedTopic, selectedDifficulty, searchQuery]);

  const getDifficultyBadge = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'basic':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            พื้นฐาน (Basic)
          </span>
        );
      case 'intermediate':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            ปานกลาง (Intermediate)
          </span>
        );
      case 'advanced':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            ประยุกต์ / สอวน. (Advanced)
          </span>
        );
    }
  };

  const handleAddVariableRow = () => {
    setNewVariables([...newVariables, { symbol: '', meaning: '', unit: '' }]);
  };

  const handleRemoveVariableRow = (idx: number) => {
    setNewVariables(newVariables.filter((_, i) => i !== idx));
  };

  const handleCreateFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFormula.trim() || !newConcept.trim()) return;

    const validVars = newVariables.filter(v => v.symbol.trim() !== '');
    
    const conditionsArr = newConditions
      .split('\n')
      .map(c => c.trim())
      .filter(Boolean);

    const examplesArr: SolvedExample[] = [];
    if (exampleProblem.trim()) {
      examplesArr.push({
        id: `ex_${Date.now()}`,
        problem: exampleProblem.trim(),
        given: exampleGiven.split('\n').map(g => g.trim()).filter(Boolean),
        formulaUsed: exampleFormulaUsed.trim() || newFormula,
        solutionSteps: exampleSteps.split('\n').map(s => s.trim()).filter(Boolean),
        answer: exampleAnswer.trim(),
        tips: exampleTips.trim() || undefined
      });
    }

    addFormula({
      title: newTitle.trim(),
      topic: newTopic,
      difficulty: newDifficulty,
      formula: newFormula.trim(),
      conceptSummary: newConcept.trim(),
      variableDefinitions: validVars,
      conditions: conditionsArr.length > 0 ? conditionsArr : undefined,
      examples: examplesArr
    });

    // Reset form
    setNewTitle('');
    setNewFormula('');
    setNewConcept('');
    setNewConditions('');
    setNewVariables([{ symbol: '', meaning: '', unit: '' }]);
    setExampleProblem('');
    setExampleGiven('');
    setExampleFormulaUsed('');
    setExampleSteps('');
    setExampleAnswer('');
    setExampleTips('');
    setIsAddModalOpen(false);
  };

  // Quick Interactive Calculators
  const calculateResult = () => {
    if (!activeCalculator) return null;

    if (activeCalculator === 'newton_fma') {
      const m = Number(calcInputs.m);
      const a = Number(calcInputs.a);
      if (!isNaN(m) && !isNaN(a) && calcInputs.m !== '' && calcInputs.a !== '') {
        const F = m * a;
        return {
          formula: '∑F = m · a',
          steps: [
            `มวล (m) = ${m} kg`,
            `ความเร่ง (a) = ${a} m/s²`,
            `คำนวณ: F = ${m} × ${a} = ${F.toFixed(2)} N`
          ],
          result: `${F.toFixed(2)} นิวตัน (N)`
        };
      }
    }

    if (activeCalculator === 'motion_uvast') {
      const u = Number(calcInputs.u);
      const a = Number(calcInputs.a);
      const t = Number(calcInputs.t);
      if (!isNaN(u) && !isNaN(a) && !isNaN(t) && calcInputs.u !== '' && calcInputs.a !== '' && calcInputs.t !== '') {
        const v = u + a * t;
        const s = u * t + 0.5 * a * t * t;
        return {
          formula: 'v = u + at  และ  s = ut + ½at²',
          steps: [
            `ความเร็วต้น (u) = ${u} m/s, ความเร่ง (a) = ${a} m/s², เวลา (t) = ${t} s`,
            `ความเร็วปลาย: v = ${u} + (${a})(${t}) = ${v.toFixed(2)} m/s`,
            `การกระจัด: s = (${u})(${t}) + 0.5(${a})(${t})² = ${s.toFixed(2)} m`
          ],
          result: `v = ${v.toFixed(2)} m/s  |  s = ${s.toFixed(2)} เมตร`
        };
      }
    }

    if (activeCalculator === 'kinetic_energy') {
      const m = Number(calcInputs.m);
      const v = Number(calcInputs.v);
      if (!isNaN(m) && !isNaN(v) && calcInputs.m !== '' && calcInputs.v !== '') {
        const ek = 0.5 * m * v * v;
        return {
          formula: 'E_k = ½ · m · v²',
          steps: [
            `มวล (m) = ${m} kg`,
            `อัตราเร็ว (v) = ${v} m/s`,
            `คำนวณ: E_k = 0.5 × ${m} × (${v})² = 0.5 × ${m} × ${(v * v).toFixed(2)} = ${ek.toFixed(2)} J`
          ],
          result: `${ek.toFixed(2)} จูล (J)`
        };
      }
    }

    if (activeCalculator === 'ohms_law') {
      const v = Number(calcInputs.v);
      const r = Number(calcInputs.r);
      if (!isNaN(v) && !isNaN(r) && r > 0 && calcInputs.v !== '' && calcInputs.r !== '') {
        const i = v / r;
        const p = v * i;
        return {
          formula: 'I = V / R  และ  P = V · I',
          steps: [
            `ความต่างศักย์ (V) = ${v} V, ความต้านทาน (R) = ${r} Ω`,
            `กระแสไฟฟ้า: I = ${v} / ${r} = ${i.toFixed(3)} A`,
            `กำลังไฟฟ้า: P = ${v} × ${i.toFixed(3)} = ${p.toFixed(2)} W`
          ],
          result: `กระแส I = ${i.toFixed(3)} A  |  กำลัง P = ${p.toFixed(2)} W`
        };
      }
    }

    if (activeCalculator === 'wave_speed') {
      const f = Number(calcInputs.f);
      const lambda = Number(calcInputs.lambda);
      if (!isNaN(f) && !isNaN(lambda) && calcInputs.f !== '' && calcInputs.lambda !== '') {
        const v = f * lambda;
        const period = f > 0 ? 1 / f : 0;
        return {
          formula: 'v = f · λ  และ  T = 1 / f',
          steps: [
            `ความถี่ (f) = ${f} Hz, ความยาวคลื่น (λ) = ${lambda} m`,
            `อัตราเร็ว: v = ${f} × ${lambda} = ${v.toFixed(2)} m/s`,
            `คาบคลื่น: T = 1 / ${f} = ${period.toFixed(4)} s`
          ],
          result: `อัตราเร็ว v = ${v.toFixed(2)} m/s  |  คาบ T = ${period.toFixed(4)} วินาที`
        };
      }
    }

    return null;
  };

  const calcResult = calculateResult();

  return (
    <div className="space-y-6" id="knowledge-repository-root">
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-1">
              <BookOpen className="w-5 h-5" />
              <span>คลังความรู้ & ฐานข้อมูลสูตรฟิสิกส์ (Physics Knowledge Base)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              ฐานสูตร มโนทัศน์ และโจทย์ตัวอย่างพร้อมวิธีทำ
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              สืบค้นสูตรสำคัญ สรุปใจความฟิสิกส์ ตรวจสอบเงื่อนไขการใช้ พร้อมตัวอย่างข้อสอบและวิธีแก้โจทย์แบบเป็นขั้นตอน
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-open-calc"
              onClick={() => {
                setActiveCalculator('newton_fma');
                setCalcInputs({ m: 10, a: 3.5 });
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Calculator className="w-4 h-4 text-blue-600" />
              เครื่องคิดเลขฟิสิกส์
            </button>

            {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
              <button
                id="btn-add-formula"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                เพิ่มสูตร / ตัวอย่างใหม่
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="input-formula-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาตามชื่อสูตร, สัญลักษณ์ (เช่น ∑F=ma, v=u+at), ตัวแปร, หรือข้อความโจทย์ตัวอย่าง..."
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

        {/* Topic Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>หมวดหมู่เนื้อหาฟิสิกส์:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                id={`topic-filter-${topic}`}
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

        {/* Difficulty Filters */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              ระดับความยาก:
            </span>
            <div className="flex gap-1.5">
              {(['all', 'basic', 'intermediate', 'advanced'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {diff === 'all' ? 'ทุกระดับ' : diff === 'basic' ? 'พื้นฐาน' : diff === 'intermediate' ? 'ปานกลาง' : 'ประยุกต์ / สอวน.'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500">
            พบ <span className="font-bold text-slate-900">{filteredFormulas.length}</span> รายการสูตรและโจทย์
          </div>
        </div>
      </div>

      {/* Formulas List */}
      <div className="space-y-4" id="formula-cards-container">
        {filteredFormulas.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">ไม่พบข้อมูลสูตรที่ตรงกับคำค้นหา</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหาสูตรและโจทย์ตัวอย่างฟิสิกส์
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopic('all');
                setSelectedDifficulty('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 font-medium text-sm rounded-xl hover:bg-blue-100 transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          filteredFormulas.map((item) => {
            const isExpanded = expandedFormulaId === item.id;

            return (
              <div
                key={item.id}
                id={`formula-card-${item.id}`}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 hover:border-slate-300 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {item.topic}
                    </span>
                    {getDifficultyBadge(item.difficulty)}
                    <span className="text-xs text-slate-400">
                      บันทึกโดย {item.addedBy}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.calculatorType && (
                      <button
                        onClick={() => {
                          setActiveCalculator(item.calculatorType || null);
                          if (item.calculatorType === 'newton_fma') setCalcInputs({ m: 10, a: 4 });
                          if (item.calculatorType === 'motion_uvast') setCalcInputs({ u: 0, a: 9.8, t: 3 });
                          if (item.calculatorType === 'kinetic_energy') setCalcInputs({ m: 2, v: 10 });
                          if (item.calculatorType === 'ohms_law') setCalcInputs({ v: 220, r: 44 });
                          if (item.calculatorType === 'wave_speed') setCalcInputs({ f: 440, lambda: 0.77 });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
                        title="เปิดเครื่องคิดเลขสำหรับสูตรนี้"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        คำนวณสูตรนี้
                      </button>
                    )}

                    {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                      <button
                        onClick={() => deleteFormula(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบสูตรนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h2>

                {/* Formula Highlight Container */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner my-4">
                  <div>
                    <div className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-1">
                      สมการหลัก (Core Formula)
                    </div>
                    <div className="font-mono text-xl sm:text-2xl font-bold tracking-wide text-amber-300">
                      {item.formula}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 max-w-xs text-left sm:text-right">
                    หน่วยมาตรฐานสากล (SI Units)
                  </div>
                </div>

                {/* Concept Summary */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    คำอธิบายมโนทัศน์ (Concept Summary)
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    {item.conceptSummary}
                  </p>
                </div>

                {/* Variable Definitions Table */}
                {item.variableDefinitions && item.variableDefinitions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                      ความหมายของตัวแปรและหน่วย (Variables & Units)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/60">
                            <th className="py-2 px-3 w-28">สัญลักษณ์</th>
                            <th className="py-2 px-3">ความหมาย / ปริมาณฟิสิกส์</th>
                            <th className="py-2 px-3 w-44">หน่วยในระบบ SI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {item.variableDefinitions.map((v, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-mono font-bold text-blue-700 bg-blue-50/30 rounded-l">
                                {v.symbol}
                              </td>
                              <td className="py-2 px-3">{v.meaning}</td>
                              <td className="py-2 px-3 text-slate-500 font-mono">{v.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Conditions / Assumptions */}
                {item.conditions && item.conditions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      เงื่อนไขและข้อควรระวัง (Conditions & Limitations)
                    </h4>
                    <ul className="space-y-1">
                      {item.conditions.map((cond, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Solved Examples Accordion Toggle */}
                {item.examples && item.examples.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      id={`btn-toggle-example-${item.id}`}
                      onClick={() => setExpandedFormulaId(isExpanded ? null : item.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>โจทย์ตัวอย่างพร้อมวิธีทำอย่างละเอียด ({item.examples.length} ข้อ)</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <span>{isExpanded ? 'ซ่อนวิธีทำ' : 'แสดงวิธีทำและคำอธิบาย'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Expanded Solved Examples */}
                    {isExpanded && (
                      <div className="mt-4 space-y-4 pl-2 pr-1">
                        {item.examples.map((ex, exIdx) => (
                          <div
                            key={ex.id || exIdx}
                            className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 text-sm space-y-3.5"
                          >
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                                โจทย์ตัวอย่างที่ {exIdx + 1}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                ใช้: {ex.formulaUsed}
                              </span>
                            </div>

                            {/* Problem */}
                            <div>
                              <span className="font-semibold text-slate-900 block mb-1">โจทย์:</span>
                              <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/70">
                                {ex.problem}
                              </p>
                            </div>

                            {/* Given */}
                            {ex.given && ex.given.length > 0 && (
                              <div>
                                <span className="font-semibold text-slate-700 text-xs block mb-1">
                                  สิ่งที่โจทย์กำหนดให้:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {ex.given.map((g, gIdx) => (
                                    <span
                                      key={gIdx}
                                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                                    >
                                      {g}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Solution Steps */}
                            <div>
                              <span className="font-semibold text-slate-900 text-xs block mb-1.5">
                                ขั้นตอนแสดงวิธีทำ:
                              </span>
                              <div className="space-y-1.5 pl-2">
                                {ex.solutionSteps.map((step, sIdx) => (
                                  <div key={sIdx} className="text-xs text-slate-700 flex items-start gap-2 font-mono">
                                    <span className="text-blue-600 font-bold">›</span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Final Answer Box */}
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-xs font-bold">คำตอบ: {ex.answer}</span>
                            </div>

                            {/* Tips */}
                            {ex.tips && (
                              <div className="text-xs text-amber-800 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold">เทคนิคคิดลัด & จุดระวัง: </span>
                                  <span>{ex.tips}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Physics Calculator Modal */}
      {activeCalculator && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div 
            id="modal-physics-calculator"
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">เครื่องคิดเลขฟิสิกส์อัตโนมัติ</h3>
                  <p className="text-xs text-slate-500">เลือกสูตร ป้อนตัวเลข แล้วดูการแก้สมการทีละขั้นตอน</p>
                </div>
              </div>
              <button
                onClick={() => setActiveCalculator(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Calculator Type Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                เลือกสูตรที่ต้องการคำนวณ:
              </label>
              <select
                value={activeCalculator}
                onChange={(e) => {
                  setActiveCalculator(e.target.value);
                  setCalcInputs({});
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="newton_fma">กฎข้อ 2 นิวตัน (∑F = m · a)</option>
                <option value="motion_uvast">การเคลื่อนที่แนวตรง (v = u + at, s = ut + ½at²)</option>
                <option value="kinetic_energy">พลังงานจลน์ (E_k = ½ · m · v²)</option>
                <option value="ohms_law">กฎของโอห์ม & กำลังไฟฟ้า (V = IR, P = VI)</option>
                <option value="wave_speed">อัตราเร็วคลื่น (v = f · λ)</option>
              </select>
            </div>

            {/* Inputs based on type */}
            <div className="space-y-4 mb-6">
              {activeCalculator === 'newton_fma' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      มวลของวัตถุ (m) [kg]
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.m ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, m: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 10"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ความเร่ง (a) [m/s²]
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.a ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, a: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 3.5"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </>
              )}

              {activeCalculator === 'motion_uvast' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ความเร็วต้น (u) [m/s]
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.u ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, u: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 0 หรือ 20"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ความเร่ง (a) [m/s²] (ถ้าชะลอความเร็วให้ใส่ค่าลบ)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.a ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, a: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 9.8 หรือ -2"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ช่วงเวลา (t) [s]
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.t ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, t: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 4"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </>
              )}

              {activeCalculator === 'kinetic_energy' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      มวล (m) [kg]
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.m ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, m: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 0.5"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      อัตราเร็ว (v) [m/s]
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.v ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, v: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 15"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </>
              )}

              {activeCalculator === 'ohms_law' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ความต่างศักย์ (V) [Volts]
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.v ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, v: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 220"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ความต้านทาน (R) [Ohms (Ω)]
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.r ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, r: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 44"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </>
              )}

              {activeCalculator === 'wave_speed' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ความถี่ (f) [Hz]
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.f ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, f: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 50"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ความยาวคลื่น (λ) [เมตร]
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={calcInputs.lambda ?? ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, lambda: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="เช่น 6.8"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Calculation Output */}
            {calcResult ? (
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 font-mono">
                <div className="text-xs text-blue-400 font-semibold">{calcResult.formula}</div>
                <div className="text-xs text-slate-300 space-y-1">
                  {calcResult.steps.map((s, i) => (
                    <div key={i}>• {s}</div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800 text-amber-300 font-bold text-sm">
                  ผลลัพธ์: {calcResult.result}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                กรุณากรอกตัวเลขให้ครบถ้วนเพื่อแสดงผลการคำนวณอัตโนมัติ
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Formula Modal (For Teachers & Admins) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div 
            id="modal-add-formula"
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">เพิ่มสูตรและโจทย์ตัวอย่างใหม่</h3>
                  <p className="text-xs text-slate-500">บันทึกเนื้อหาลงในคลังความรู้เพื่อให้ทุกคนสืบค้นได้</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFormula} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อสูตร / หัวข้อ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="เช่น กฎแรงดึงดูดระหว่างมวลของนิวตัน"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ระดับความยาก
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="basic">พื้นฐาน (Basic)</option>
                    <option value="intermediate">ปานกลาง (Intermediate)</option>
                    <option value="advanced">ประยุกต์ / สอวน. (Advanced)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สมการ / สูตรหลัก <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFormula}
                    onChange={(e) => setNewFormula(e.target.value)}
                    placeholder="เช่น F_g = G · (m₁ · m₂) / r²"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำอธิบายมโนทัศน์ (Concept Summary) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  placeholder="อธิบายหลักการทางฟิสิกส์และความสัมพันธ์ของตัวแปร..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Variables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    รายการตัวแปรและหน่วย SI
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariableRow}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + เพิ่มแถวตัวแปร
                  </button>
                </div>
                <div className="space-y-2">
                  {newVariables.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="สัญลักษณ์ (เช่น G)"
                        value={v.symbol}
                        onChange={(e) => {
                          const updated = [...newVariables];
                          updated[idx].symbol = e.target.value;
                          setNewVariables(updated);
                        }}
                        className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="ความหมาย (เช่น ค่าคงตัวโน้มถ่วงสากล)"
                        value={v.meaning}
                        onChange={(e) => {
                          const updated = [...newVariables];
                          updated[idx].meaning = e.target.value;
                          setNewVariables(updated);
                        }}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="หน่วย (เช่น N·m²/kg²)"
                        value={v.unit}
                        onChange={(e) => {
                          const updated = [...newVariables];
                          updated[idx].unit = e.target.value;
                          setNewVariables(updated);
                        }}
                        className="w-32 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                      {newVariables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariableRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เงื่อนไขและข้อควรระวัง (บรรทัดละ 1 ข้อ)
                </label>
                <textarea
                  rows={2}
                  value={newConditions}
                  onChange={(e) => setNewConditions(e.target.value)}
                  placeholder="เช่น มวลต้องเป็นมวลจุด (Point mass) หรือทรงกลมสมมาตร"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Optional Solved Example Problem */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  โจทย์ตัวอย่างพร้อมวิธีทำ (Optional)
                </h4>
                <div className="space-y-2.5">
                  <textarea
                    rows={2}
                    placeholder="ข้อความโจทย์..."
                    value={exampleProblem}
                    onChange={(e) => setExampleProblem(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="สิ่งที่โจทย์ให้ (เช่น m1 = 5 kg, m2 = 10 kg, r = 2 m)"
                    value={exampleGiven}
                    onChange={(e) => setExampleGiven(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <textarea
                    rows={2}
                    placeholder="ขั้นตอนแสดงวิธีทำ (บรรทัดละ 1 ขั้นตอน)..."
                    value={exampleSteps}
                    onChange={(e) => setExampleSteps(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="คำตอบสุดท้ายพร้อมหน่วย..."
                      value={exampleAnswer}
                      onChange={(e) => setExampleAnswer(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-emerald-800"
                    />
                    <input
                      type="text"
                      placeholder="เทคนิคคิดลัด / ข้อควรระวัง..."
                      value={exampleTips}
                      onChange={(e) => setExampleTips(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-amber-800"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  บันทึกลงคลังความรู้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
