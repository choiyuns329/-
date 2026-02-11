
import React, { useState, useEffect } from 'react';
import { Subject, Lecture, LectureType, RemoteRatio, ComparisonResult, DayOfWeek, PERIODS, TimeSlot } from './types';
import SubjectCard from './components/SubjectCard';
import Timetable from './components/Timetable';
import { analyzeLectures } from './services/geminiService';

const SUBJECT_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'
];

const App: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetableLectureIds, setTimetableLectureIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'timetable'>('list');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ComparisonResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form states
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newProf, setNewProf] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newType, setNewType] = useState<LectureType>(LectureType.OFFLINE);
  const [newRemote, setNewRemote] = useState<RemoteRatio>(RemoteRatio.ZERO);
  const [newEval, setNewEval] = useState({
    attendance: 10, midterm: 30, final: 40, assignment: 20, attitude: 0, quiz: 0, others: 0
  });
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const savedSubjects = localStorage.getItem('uni-course-data-v2');
    const savedTimetable = localStorage.getItem('uni-timetable-ids');
    if (savedSubjects) {
      try {
        setSubjects(JSON.parse(savedSubjects));
      } catch (e) { console.error("Failed to load subjects", e); }
    }
    if (savedTimetable) {
      try {
        setTimetableLectureIds(JSON.parse(savedTimetable));
      } catch (e) { console.error("Failed to load timetable", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('uni-course-data-v2', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('uni-timetable-ids', JSON.stringify(timetableLectureIds));
  }, [timetableLectureIds]);

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const newSub: Subject = {
      id: Date.now().toString(),
      name: newSubjectName,
      code: newSubjectCode || 'G-000',
      lectures: []
    };
    setSubjects([...subjects, newSub]);
    setNewSubjectName('');
    setNewSubjectCode('');
    setIsSubjectModalOpen(false);
  };

  const handleAddLecture = () => {
    if (!activeSubjectId) return;
    const lecture: Lecture = {
      id: Date.now().toString(),
      professor: newProf || '교수 미정',
      classroom: newRoom || '미정',
      type: newType,
      remoteRatio: newRemote,
      evaluation: { ...newEval },
      timeSlots: [...selectedSlots],
      memo: '',
      color: SUBJECT_COLORS[subjects.findIndex(s => s.id === activeSubjectId) % SUBJECT_COLORS.length]
    };

    setSubjects(subjects.map(s => 
      s.id === activeSubjectId ? { ...s, lectures: [...s.lectures, lecture] } : s
    ));
    
    resetLectureForm();
    setIsLectureModalOpen(false);
  };

  const toggleLectureInTimetable = (lectureId: string) => {
    if (timetableLectureIds.includes(lectureId)) {
      setTimetableLectureIds(timetableLectureIds.filter(id => id !== lectureId));
    } else {
      setTimetableLectureIds([...timetableLectureIds, lectureId]);
    }
  };

  const resetLectureForm = () => {
    setNewProf('');
    setNewRoom('');
    setNewType(LectureType.OFFLINE);
    setNewRemote(RemoteRatio.ZERO);
    setNewEval({ attendance: 10, midterm: 30, final: 40, assignment: 20, attitude: 0, quiz: 0, others: 0 });
    setSelectedSlots([]);
  };

  const toggleTimeSlot = (day: DayOfWeek, period: string) => {
    const exists = selectedSlots.find(s => s.day === day && s.period === period);
    if (exists) {
      setSelectedSlots(selectedSlots.filter(s => !(s.day === day && s.period === period)));
    } else {
      setSelectedSlots([...selectedSlots, { day, period }]);
    }
  };

  const totalEval = (Object.values(newEval) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">26</div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              UniCourse Master
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">스마트 시간표 설계 툴</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            과목 리스트 {timetableLectureIds.length > 0 && `(${timetableLectureIds.length})`}
          </button>
          <button 
            onClick={() => setViewMode('timetable')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'timetable' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            내 시간표
          </button>
        </div>

        <button 
          onClick={() => setIsSubjectModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          <span>+ 새 과목 등록</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {viewMode === 'list' ? (
          subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 animate-bounce">
                <span className="text-5xl">🎓</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">수강 신청 마스터가 되어보세요!</h2>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                26학번 동기 여러분, 환영합니다.<br/>오른쪽 상단의 '새 과목 등록' 버튼을 눌러 비교할 과목들을 추가해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.map(subject => (
                <SubjectCard 
                  key={subject.id} 
                  subject={subject} 
                  timetableLectureIds={timetableLectureIds}
                  onToggleTimetable={toggleLectureInTimetable}
                  onAddLecture={(id) => { setActiveSubjectId(id); setIsLectureModalOpen(true); }}
                  onDeleteSubject={(id) => confirm('과목을 삭제할까요?') && setSubjects(subjects.filter(s => s.id !== id))}
                  onDeleteLecture={(sId, lId) => {
                    setSubjects(subjects.map(s => s.id === sId ? { ...s, lectures: s.lectures.filter(l => l.id !== lId) } : s));
                    setTimetableLectureIds(timetableLectureIds.filter(id => id !== lId));
                  }}
                  onAnalyze={async (s) => {
                    setIsAnalyzing(true); setIsAnalysisModalOpen(true);
                    setAnalysisResult(await analyzeLectures(s));
                    setIsAnalyzing(false);
                  }}
                />
              ))}
            </div>
          )
        ) : (
          <Timetable subjects={subjects} timetableLectureIds={timetableLectureIds} />
        )}
      </main>

      {/* Modal: Add Subject */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl scale-in">
            <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">새 과목 등록</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">과목명</label>
                <input 
                  type="text" 
                  value={newSubjectName} 
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="예: 현대 사회의 이해"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">학수번호</label>
                <input 
                  type="text" 
                  value={newSubjectCode} 
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  placeholder="예: SOC1001"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-mono"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setIsSubjectModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm">취소</button>
              <button onClick={handleAddSubject} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all text-sm">과목 저장</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Lecture */}
      {isLectureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl p-8 shadow-2xl my-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">상세 강좌 정보 입력</h3>
                <p className="text-slate-400 text-sm font-medium">강의 시간과 평가 방식을 정확히 입력해주세요.</p>
              </div>
              <button onClick={() => setIsLectureModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Side: Professor, Classroom & Time */}
              <div className="space-y-6">
                <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">핵심 정보</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">교수님 성함</label>
                      <input 
                        type="text" 
                        value={newProf} 
                        onChange={(e) => setNewProf(e.target.value)} 
                        placeholder="예: 홍길동 교수님" 
                        className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-semibold" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">강의실 위치</label>
                      <input 
                        type="text" 
                        value={newRoom} 
                        onChange={(e) => setNewRoom(e.target.value)} 
                        placeholder="예: 제1공학관 201호" 
                        className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-semibold" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">강의 유형</label>
                        <select value={newType} onChange={(e) => setNewType(e.target.value as LectureType)} className="w-full px-3 py-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 outline-none text-xs font-medium">
                          {Object.values(LectureType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">원격 비율</label>
                        <select value={newRemote} onChange={(e) => setNewRemote(e.target.value as RemoteRatio)} className="w-full px-3 py-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 outline-none text-xs font-medium">
                          {Object.values(RemoteRatio).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">강의 시간 선택 (교시)</h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-[250px] overflow-y-auto">
                    <div className="grid grid-cols-6 gap-1">
                      <div className="h-8"></div>
                      {Object.values(DayOfWeek).map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</div>)}
                      {PERIODS.map(p => (
                        <React.Fragment key={p.id}>
                          <div className="text-[9px] font-bold text-slate-400 flex flex-col items-end justify-center pr-2">
                            <span>{p.id}</span>
                          </div>
                          {Object.values(DayOfWeek).map(d => {
                            const active = selectedSlots.some(s => s.day === d && s.period === p.id);
                            return (
                              <button 
                                key={`${d}-${p.id}`}
                                onClick={() => toggleTimeSlot(d, p.id)}
                                className={`h-8 rounded-md border transition-all ${active ? 'bg-indigo-600 border-indigo-600 shadow-md scale-105 z-10' : 'bg-white border-slate-200 hover:border-indigo-200'}`}
                              />
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Side: Evaluation */}
              <div>
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">평가 방식 비율 (%)</h4>
                    <span className={`text-xs font-black px-2 py-1 rounded-full ${totalEval === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      합계: {totalEval}%
                    </span>
                  </div>
                  <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    {[
                      { key: 'attendance', label: '출석' }, { key: 'midterm', label: '중간고사' }, { key: 'final', label: '기말고사' },
                      { key: 'assignment', label: '과제' }, { key: 'attitude', label: '수업태도' }, { key: 'quiz', label: '퀴즈' }, { key: 'others', label: '기타' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-4">
                        <label className="text-xs font-bold text-slate-600 w-20">{label}</label>
                        <input 
                          type="range" min="0" max="100" step="5"
                          value={newEval[key as keyof typeof newEval]} 
                          onChange={(e) => setNewEval({ ...newEval, [key]: parseInt(e.target.value) || 0 })}
                          className="flex-1 accent-indigo-600"
                        />
                        <span className="text-xs font-mono font-bold text-slate-400 w-8">{newEval[key as keyof typeof newEval]}%</span>
                      </div>
                    ))}
                  </div>
                </section>
                
                <div className="mt-10 flex gap-4">
                  <button onClick={() => setIsLectureModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold text-sm">취소</button>
                  <button 
                    onClick={handleAddLecture}
                    disabled={totalEval !== 100}
                    className={`flex-[2] py-4 text-white rounded-2xl font-black text-sm transition-all shadow-xl ${totalEval === 100 ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-200' : 'bg-slate-200 cursor-not-allowed text-slate-400'}`}
                  >
                    강좌 정보 등록 완료
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Analysis Result */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl p-10 shadow-2xl my-8 relative">
            <button onClick={() => setIsAnalysisModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                <span className="text-3xl">🪄</span>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">AI 강의 인사이트</h3>
                <p className="text-slate-400 font-medium">Gemini가 분석한 최고의 수강 가이드</p>
              </div>
            </div>

            {isAnalyzing ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <div className="w-20 h-20 border-8 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                <p className="text-xl font-bold text-slate-800 animate-pulse">데이터를 교차 분석하는 중...</p>
                <p className="text-slate-400 text-sm mt-2 font-medium">잠시만 기다려주세요!</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-10 fade-in overflow-y-auto max-h-[60vh] pr-4">
                <section>
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">종합 분석</h4>
                  <div className="text-slate-700 leading-relaxed bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 text-base font-medium">
                    {analysisResult.summary}
                  </div>
                </section>
                <section>
                  <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-3">전략적 추천</h4>
                  <div className="text-slate-700 leading-relaxed bg-purple-50/50 p-6 rounded-3xl border border-purple-100 text-base font-medium italic">
                    " {analysisResult.recommendation} "
                  </div>
                </section>
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">강좌별 비교 데이터</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisResult.prosCons.map((pc, idx) => (
                      <div key={idx} className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="font-black text-lg text-slate-800 mb-4 pb-3 border-b border-slate-50 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          {subjects.find(s => s.lectures.some(l => l.id === pc.lectureId))?.lectures.find(l => l.id === pc.lectureId)?.professor} 교수님
                        </div>
                        <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-black text-emerald-500 mb-2 uppercase tracking-widest flex items-center gap-1">
                              <span className="text-sm">✓</span> Strength
                            </p>
                            <ul className="text-xs space-y-2 text-slate-500 font-medium">
                              {pc.pros.map((p, i) => <li key={i} className="flex items-start gap-2"><span>•</span> {p}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-rose-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                              <span className="text-sm">!</span> Risk
                            </p>
                            <ul className="text-xs space-y-2 text-slate-500 font-medium">
                              {pc.cons.map((c, i) => <li key={i} className="flex items-start gap-2"><span>•</span> {c}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <div className="py-12 text-center text-rose-500 font-bold">분석에 실패했습니다. 데이터를 다시 확인해주세요.</div>
            )}
            <div className="mt-12">
              <button onClick={() => setIsAnalysisModalOpen(false)} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200">확인 완료</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-in { animation: fade-in 0.5s ease-out; }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;
