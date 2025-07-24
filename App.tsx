
import React, { useState, useCallback } from 'react';
import { FilterOptions, AnalysisResult, StoreType } from './types';
import { INDUSTRIES, STORE_TYPES, ANALYSIS_PERIODS } from './constants';
import FilterPanel from './components/FilterPanel';
import Dashboard from './components/Dashboard';
import { fetchAnalysisData } from './services/geminiService';

const App: React.FC = () => {
    const [filters, setFilters] = useState<FilterOptions>({
        region: '서울시 강남구 역삼동',
        industry: INDUSTRIES[0],
        storeTypes: [STORE_TYPES[2]],
        analysisPeriod: ANALYSIS_PERIODS[2],
    });
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const data = await fetchAnalysisData(filters);
            setAnalysisResult(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <header className="bg-white dark:bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
                        AI 프랜차이즈 성공 내비게이터
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        최적의 창업 위치와 업종을 AI로 분석하여 성공 확률을 높여보세요.
                    </p>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3">
                        <FilterPanel 
                            filters={filters} 
                            onFilterChange={setFilters} 
                            onAnalyze={handleAnalysis}
                            isLoading={isLoading}
                        />
                    </div>
                    <div className="lg:col-span-9">
                        <Dashboard 
                            data={analysisResult}
                            isLoading={isLoading}
                            error={error}
                            filters={filters}
                        />
                    </div>
                </div>
                 <footer className="text-center mt-8 text-xs text-gray-500 dark:text-gray-400">
                    <p>본 분석 결과는 AI가 생성한 가상 데이터를 기반으로 하며, 실제 시장 상황과 다를 수 있습니다. 투자 결정의 참고 자료로만 활용해주세요.</p>
                </footer>
            </main>
        </div>
    );
};

export default App;