
import React from 'react';
import { Evaluation } from '../types';

interface EvaluationBarProps {
  evaluation: Evaluation;
}

const EvaluationBar: React.FC<EvaluationBarProps> = ({ evaluation }) => {
  const items = [
    { label: '출석', val: evaluation.attendance, color: 'bg-blue-400' },
    { label: '중간', val: evaluation.midterm, color: 'bg-indigo-500' },
    { label: '기말', val: evaluation.final, color: 'bg-purple-500' },
    { label: '과제', val: evaluation.assignment, color: 'bg-emerald-500' },
    { label: '태도', val: evaluation.attitude, color: 'bg-amber-400' },
    { label: '퀴즈', val: evaluation.quiz, color: 'bg-rose-400' },
    { label: '기타', val: evaluation.others, color: 'bg-slate-400' },
  ].filter(i => i.val > 0);

  return (
    <div className="w-full">
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-200 mb-2">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className={item.color} 
            style={{ width: `${item.val}%` }}
            title={`${item.label}: ${item.val}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            <span>{item.label} {item.val}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationBar;
