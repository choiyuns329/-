
import { GoogleGenAI, Type } from "@google/genai";
import { Subject, ComparisonResult } from "../types";

export const analyzeLectures = async (subject: Subject): Promise<ComparisonResult | null> => {
  if (subject.lectures.length < 1) return null;

  // API 인스턴스를 호출 시점에 생성하여 process.env.API_KEY 로딩 유연성 확보
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    다음은 '${subject.name}' 과목에 대한 여러 강좌 정보입니다. 
    각 강좌의 교수님, 강의실, 강의 유형, 평가 비율, 원격 비율을 분석하여 
    26학번 새내기가 어떤 강의를 선택하면 좋을지 심층 비교 분석을 해주세요.
    
    데이터: ${JSON.stringify(subject.lectures)}

    결과는 반드시 다음 JSON 형식을 따라야 합니다:
    {
      "summary": "전체적인 강좌 구성에 대한 요약",
      "recommendation": "특정 성향(예: 시험 중심, 과제 중심, 원격 선호 등)에 따른 추천",
      "prosCons": [
        {
          "lectureId": "강좌ID",
          "pros": ["장점1", "장점2"],
          "cons": ["단점1", "단점2"]
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            prosCons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  lectureId: { type: Type.STRING },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
              }
            }
          },
          required: ["summary", "recommendation", "prosCons"]
        }
      },
    });

    if (!response.text) return null;
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
