import { GoogleGenAI, Type } from "@google/genai";
import { FilterOptions, AnalysisResult, StoreType } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const singleAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        storeType: { type: Type.STRING, description: "분석 대상 점포 유형. '배달전문', '테이크아웃', '일반점포' 중 하나여야 합니다." },
        summary: { type: Type.STRING, description: "선택된 조건에 대한 시장의 간략한 요약. 1-2문장." },
        populationDensity: { type: Type.STRING, description: "분석 지역의 인구 밀집도 특징을 10자 내외로 요약. (예: '1인 가구 밀집')" },
        floatingPopulation: { type: Type.STRING, description: "분석 지역의 유동 인구 특징을 10자 내외로 요약. (예: '주중 주간에 집중')" },
        industryClosureRate: { type: Type.NUMBER, description: "분석 지역 내 해당 업종의 연간 평균 폐업률(%). 0-100 사이의 숫자." },
        newBusinessSurvivalRate: { type: Type.NUMBER, description: "해당 조건으로 신규 창업 시 1년 내 생존 확률(%). 0-100 사이의 숫자." },
        competitorDistribution: {
            type: Type.ARRAY,
            description: "입력된 상세 주소 근방의 동종업계 주요 프랜차이즈 브랜드와 그 수를 보여줍니다. 5개 예시.",
            items: {
                type: Type.OBJECT,
                properties: {
                    brandName: { type: Type.STRING, description: "경쟁 프랜차이즈 브랜드명" },
                    count: { type: Type.INTEGER, description: "해당 브랜드의 점포 수" },
                    estimatedMonthlySales: { type: Type.INTEGER, description: "해당 브랜드의 점포당 월 평균 예상 매출 (단위: 만원)" }
                },
                required: ["brandName", "count", "estimatedMonthlySales"]
            }
        },
        successRate: { type: Type.NUMBER, description: "해당 조건에서의 예상 성공 확률 (0~100 사이의 숫자)" },
        successContext: { type: Type.STRING, description: "주변 동종업계 평균 성공률과 비교하여, 현재 조건의 성공률이 어느정도 수준인지 설명합니다. (예: '주변 평균 대비 15% 높습니다.')" },
        costs: {
            type: Type.OBJECT,
            description: "예상 창업 및 운영 비용 (단위: 만원)",
            properties: {
                franchiseFee: { type: Type.INTEGER, description: "가맹비" },
                deposit: { type: Type.INTEGER, description: "보증금" },
                interior: { type: Type.INTEGER, description: "인테리어 비용" },
                other: { type: Type.INTEGER, description: "기타 비용" },
                totalStartup: { type: Type.INTEGER, description: "총 창업 비용 합계" },
                rent: { type: Type.INTEGER, description: "월 임대료" },
                labor: { type: Type.INTEGER, description: "월 인건비" },
                utilities: { type: Type.INTEGER, description: "월 공과금 및 관리비" },
                totalMonthly: { type: Type.INTEGER, description: "총 월 고정비 합계" }
            },
            required: ["franchiseFee", "deposit", "interior", "other", "totalStartup", "rent", "labor", "utilities", "totalMonthly"]
        },
        sales: {
            type: Type.ARRAY,
            description: "선택된 분석 주기에 따른 예상 매출 데이터. 12개 기간 데이터.",
            items: {
                type: Type.OBJECT,
                properties: {
                    period: { type: Type.STRING, description: "분석 기간 (예: 1일차, 1주차, 1월)" },
                    sales: { type: Type.INTEGER, description: "해당 기간의 예상 매출 (단위: 만원)" }
                },
                required: ["period", "sales"]
            }
        },
        recommendation: { type: Type.STRING, description: "모든 데이터를 종합하여 내리는 최종 투자 추천 및 조언. 3-4문장." }
    },
    required: ["storeType", "summary", "populationDensity", "floatingPopulation", "industryClosureRate", "newBusinessSurvivalRate", "competitorDistribution", "successRate", "successContext", "costs", "sales", "recommendation"]
};


const responseSchema = {
    type: Type.ARRAY,
    description: "점포 유형별 분석 결과 배열. 사용자가 여러 점포 유형을 선택하면, 각 유형에 대한 분석 객체가 이 배열에 포함됩니다.",
    items: singleAnalysisSchema
};


export const fetchAnalysisData = async (filters: FilterOptions): Promise<AnalysisResult[]> => {
    const analysisStoreTypes = filters.storeTypes.length > 0 ? filters.storeTypes : [StoreType.STANDARD];
    const storeTypesString = analysisStoreTypes.join(', ');

    const prompt = `
        당신은 대한민국 프랜차이즈 시장 및 상권 전문 데이터 분석가입니다. 아래 조건에 맞춰 특정 지역 상권에 대한 매우 현실적이고 통찰력 있는 가상 분석 데이터를 생성해주세요.
        모든 금액의 단위는 '만원'입니다.

        - 분석 상세 주소: ${filters.region}
        - 프랜차이즈 업종: ${filters.industry}
        - 점포 유형: ${storeTypesString}
        - 매출 분석 주기: ${filters.analysisPeriod}

        **요구사항:**
        1.  **중요:** 위에 명시된 각 '점포 유형'(${storeTypesString})에 대해 개별적인 분석 데이터를 생성하여 JSON 배열 형태로 반환해주세요. 각 배열 요소는 하나의 점포 유형에 대한 완전한 분석이어야 합니다.
        2.  각 분석 객체에는 'storeType' 필드가 반드시 포함되어야 하며, 값은 분석 대상 점포 유형이어야 합니다.
        3.  **상권 요약:** '${filters.region}' 주변의 상권 특징(유동인구, 주요 고객층, 임대료 수준 등)을 간략히 요약해주세요.
        4.  **상권 환경 분석:**
            *   **인구 밀집도:** 지역의 인구 밀집도와 주요 구성원 특징을 설명해주세요.
            *   **유동 인구:** 주중/주말, 주간/야간 별 유동인구 특징을 설명해주세요.
            *   **업종 폐업률:** 해당 지역의 '${filters.industry}' 업종 연간 평균 폐업률을 추정해주세요.
            *   **신규 업체 생존율:** 위의 모든 조건을 고려했을 때, 신규 업체가 1년 안에 생존할 확률을 추정해주세요.
        5.  **경쟁사 분석:** 해당 주소 근방의 동일 업종(${filters.industry}) 프랜차이즈 브랜드 분포를 분석해주세요. 각 브랜드별 **점포 수**와 **점포당 월 평균 예상 매출**을 포함해야 합니다.
        6.  **성공률 분석:** 제시된 조건에서의 창업 성공률을 예측하고, 주변 동종업계 평균 성공률과 비교하여 맥락을 설명해주세요.
        7.  **비용 분석:** 초기 창업 비용과 월 고정 비용을 현실적으로 추정해주세요.
        8.  **매출 분석:** 선택된 주기에 맞춰 예상 매출을 생성해주세요.
        9.  **최종 조언:** 모든 데이터를 종합하여 최종 투자 추천 및 조언을 제공해주세요.

        결과는 반드시 제공된 JSON 스키마(객체 배열)에 맞춰서 생성해주세요.
        예를 들어, '서울시 동대문구 회기동', '치킨', 점포유형 '배달전문, 일반점포'를 선택했다면, '배달전문'과 '일반점포' 각각에 대한 분석 객체를 배열에 담아 반환해야 합니다. 각 분석은 대학가 상권의 특징을 반영하여 젊은 층 유동인구가 많고 배달 수요가 높은 점, 하지만 수많은 치킨 브랜드가 밀집하여 경쟁이 매우 치열한 상황을 데이터에 현실적으로 반영해야 합니다.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);

        const validatedData = data.map((item: any) => ({
            ...item,
            successRate: Math.max(0, Math.min(100, item.successRate || 0)),
            newBusinessSurvivalRate: Math.max(0, Math.min(100, item.newBusinessSurvivalRate || 0)),
        }));
        
        return validatedData as AnalysisResult[];

    } catch (error) {
        console.error("Error fetching analysis from Gemini:", error);
        throw new Error("AI 분석 데이터를 가져오는 데 실패했습니다. API 키 또는 요청을 확인해주세요.");
    }
};