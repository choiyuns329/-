
import React from 'react';
import { Subject, Lecture } from '../types';
import EvaluationBar from './EvaluationBar';

interface SubjectCardProps {
  subject: Subject;
  timetableLectureIds: string[];
  onToggleTimetable: (lectureId: string) => void;
  onAddLecture: (subjectId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onDeleteLecture: (subjectId: string, lectureId: string) => void;
  onAnalyze: (subject: Subject) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ 
  subject, 
  timetableLectureIds,
  onToggleTimetable,
  onAddLecture, 
  onDeleteSubject, 
  onDeleteLecture, 
  onAnalyze 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
      <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{subject.name}</h3>
          <p className="text-xs text-slate-500 font-mono">{subject.code}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onAnalyze(subject)}
            className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            AI 분석
          </button>
          <button 
            onClick={() => onDeleteSubject(subject.id)}
            className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {subject.lectures.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm italic">
            등록된 강좌가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {subject.lectures.map((lecture) => {
              const isInTimetable = timetableLectureIds.includes(lecture.id);
              return (
                <div 
                  key={lecture.id} 
                  className={`p-4 rounded-xl border transition-all relative group ${isInTimetable ? 'bg-indigo-50/30 border-indigo-200 ring-1 ring-indigo-200' : 'bg-slate-50/50 border-slate-100'}`}
                >
                  <button 
                    onClick={() => onDeleteLecture(subject.id, lecture.id)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">교수님</p>
                      <p className="text-sm font-bold text-slate-700">{lecture.professor} 교수</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">강의실</p>
                      <p className="text-sm font-bold text-slate-700">{lecture.classroom}</p>
                    </div>
                  </div>

                  {lecture.review && (
                    <div className="mb-3 p-3 bg-white border border-slate-100 rounded-lg">
                      <p className="text-[10px] text-indigo-400 uppercase font-bold mb-1 flex items-center gap-1">
                        <span>💬</span> 강의평
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium line-clamp-2 italic">
                        "{lecture.review}"
                      </p>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">강의 시간</p>
                    <div className="flex flex-wrap gap-1">
                      {lecture.timeSlots.length > 0 ? (
                        lecture.timeSlots.map((slot, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[9px] rounded font-mono">
                            {slot.day}({slot.period})
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-300 italic">시간 미지정</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-medium">
                      {lecture.type}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full font-medium">
                      원격 {lecture.remoteRatio}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">평가 비율</p>
                    <EvaluationBar evaluation={lecture.evaluation} />
                  </div>

                  <button 
                    onClick={() => onToggleTimetable(lecture.id)}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm ${
                      isInTimetable 
                        ? 'bg-rose-500 text-white hover:bg-rose-600' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isInTimetable ? (
                      <><span>➖</span> 시간표에서 제외</>
                    ) : (
                      <><span>➕</span> 시간표에 추가</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button 
          onClick={() => onAddLecture(subject.id)}
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm hover:border-indigo-300 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
        >
          <span>+ 강좌 후보 등록</span>
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;
