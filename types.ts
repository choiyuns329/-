
export enum LectureType {
  TBL = 'TBL (팀 기반 학습)',
  PBL = 'PBL (문제 기반 학습)',
  SEMINAR = '세미나',
  ONLINE = '온라인 강의',
  OFFLINE = '대면 강의',
}

export enum RemoteRatio {
  ZERO = '0% (전면 대면)',
  FIFTY = '50% 이상',
  HUNDRED = '100% (전면 원격)',
}

export enum DayOfWeek {
  MON = '월',
  TUE = '화',
  WED = '수',
  THU = '목',
  FRI = '금',
}

export interface TimeSlot {
  day: DayOfWeek;
  period: string; // "1.0", "1.5", ..., "15"
}

export interface Evaluation {
  attendance: number;
  midterm: number;
  final: number;
  assignment: number;
  attitude: number;
  quiz: number;
  others: number;
}

export interface Lecture {
  id: string;
  professor: string;
  classroom: string;
  type: LectureType;
  evaluation: Evaluation;
  remoteRatio: RemoteRatio;
  timeSlots: TimeSlot[];
  memo: string;
  color?: string; // 시간표 표시용 색상
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  lectures: Lecture[];
}

export interface ComparisonResult {
  summary: string;
  recommendation: string;
  prosCons: { lectureId: string; pros: string[]; cons: string[] }[];
}

export const PERIODS = [
  { id: '1.0', time: '09:00~09:30' }, { id: '1.5', time: '09:30~10:00' },
  { id: '2.0', time: '10:00~10:30' }, { id: '2.5', time: '10:30~11:00' },
  { id: '3.0', time: '11:00~11:30' }, { id: '3.5', time: '11:30~12:00' },
  { id: '4.0', time: '12:00~12:30' }, { id: '4.5', time: '12:30~13:00' },
  { id: '5.0', time: '13:00~13:30' }, { id: '5.5', time: '13:30~14:00' },
  { id: '6.0', time: '14:00~14:30' }, { id: '6.5', time: '14:30~15:00' },
  { id: '7.0', time: '15:00~15:30' }, { id: '7.5', time: '15:30~16:00' },
  { id: '8.0', time: '16:00~16:30' }, { id: '8.5', time: '16:30~17:00' },
  { id: '9.0', time: '17:00~17:30' }, { id: '9.5', time: '17:30~18:00' },
  { id: '10', time: '18:00~18:45' }, { id: '11', time: '18:45~19:30' },
  { id: '12', time: '19:35~20:20' }, { id: '13', time: '20:20~21:05' },
  { id: '14', time: '21:10~21:55' }, { id: '15', time: '21:55~22:40' },
];
