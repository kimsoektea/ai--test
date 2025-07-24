
import React from 'react';
import { FilterOptions, StoreType } from '../types';
import { INDUSTRIES, STORE_TYPES, ANALYSIS_PERIODS } from '../constants';

interface FilterPanelProps {
    filters: FilterOptions;
    onFilterChange: React.Dispatch<React.SetStateAction<FilterOptions>>;
    onAnalyze: () => void;
    isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onAnalyze, isLoading }) => {

    const handleStoreTypeChange = (storeType: StoreType) => {
        onFilterChange(prev => {
            const newStoreTypes = prev.storeTypes.includes(storeType)
                ? prev.storeTypes.filter(t => t !== storeType)
                : [...prev.storeTypes, storeType];
            return { ...prev, storeTypes: newStoreTypes };
        });
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">분석 조건 설정</h2>
            
            <div className="space-y-2">
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">상세 주소 입력</label>
                <input
                    type="text"
                    id="region"
                    value={filters.region}
                    onChange={e => onFilterChange(f => ({ ...f, region: e.target.value }))}
                    placeholder="예: 서울시 동대문구 회기동"
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">업종 선택</label>
                <select 
                    id="industry" 
                    value={filters.industry} 
                    onChange={e => onFilterChange(f => ({ ...f, industry: e.target.value }))}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">점포 유형</label>
                <div className="grid grid-cols-2 gap-2">
                    {STORE_TYPES.map(type => (
                        <button 
                            key={type}
                            onClick={() => handleStoreTypeChange(type)}
                            className={`p-2 text-sm rounded-md transition-colors ${
                                filters.storeTypes.includes(type)
                                ? 'bg-primary-600 text-white font-semibold'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">매출 분석 주기</label>
                <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                    {ANALYSIS_PERIODS.map(period => (
                        <button
                            key={period}
                            onClick={() => onFilterChange(f => ({ ...f, analysisPeriod: period }))}
                            className={`w-full py-1.5 text-sm font-medium rounded-md transition-all ${
                                filters.analysisPeriod === period
                                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={onAnalyze}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        분석 중...
                    </>
                ) : (
                    'AI 분석 시작하기'
                )}
            </button>
        </div>
    );
};

export default FilterPanel;
