
import React from 'react';
import { Subject, Lecture, DayOfWeek, PERIODS } from '../types';

interface TimetableProps {
  subjects: Subject[];
  timetableLectureIds: string[];
}

const DAYS = [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI];

const Timetable: React.FC<TimetableProps> = ({ subjects, timetableLectureIds }) => {
  // 시간표 상에 렌더링할 맵 생성
  const slotMap: Record<string, { subjectName: string; professor: string; color: string; lecture: Lecture }> = {};

  subjects.forEach(subject => {
    subject.lectures.forEach(lecture => {
      // 선택된 강좌만 시간표에 표시
      if (!timetableLectureIds.includes(lecture.id)) return;

      lecture.timeSlots.forEach(slot => {
        const key = `${slot.day}-${slot.period}`;
        slotMap[key] = {
          subjectName: subject.name,
          professor: lecture.professor,
          color: lecture.color || '#6366f1',
          lecture
        };
      });
    });
  });

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
          <span>📅</span> 확정된 내 시간표
        </h3>
        <span className="text-[10px] font-bold text-indigo-400 bg-white px-2 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
          {timetableLectureIds.length} Lectures Active
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase w-24">교시</th>
              {DAYS.map(day => (
                <th key={day} className="py-4 px-2 text-sm font-bold text-slate-700 border-l border-slate-100">{day}요일</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                <td className="py-2 px-2 text-center border-r border-slate-100 bg-slate-50/20">
                  <div className="text-[10px] font-bold text-slate-800 leading-none mb-1">{p.id}교시</div>
                  <div className="text-[8px] text-slate-400 font-mono">{p.time}</div>
                </td>
                {DAYS.map(day => {
                  const data = slotMap[`${day}-${p.id}`];
                  return (
                    <td key={`${day}-${p.id}`} className="p-0.5 border-l border-slate-100 h-14 relative group">
                      {data && (
                        <div 
                          className="w-full h-full rounded-lg p-1.5 flex flex-col justify-center items-center shadow-sm text-center transition-all group-hover:scale-[1.02] cursor-default"
                          style={{ backgroundColor: `${data.color}20`, borderLeft: `4px solid ${data.color}` }}
                        >
                          <div className="text-[10px] font-black text-slate-800 truncate w-full leading-tight mb-0.5">{data.subjectName}</div>
                          <div className="text-[8px] font-bold text-slate-500 truncate w-full">{data.professor}</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {timetableLectureIds.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <span className="text-4xl mb-4 opacity-50">🛒</span>
          <p className="text-sm font-medium">시간표가 비어있습니다.</p>
          <p className="text-xs">과목 리스트에서 '시간표에 추가' 버튼을 눌러보세요.</p>
        </div>
      )}
    </div>
  );
};

export default Timetable;
