import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AnalysisResult, FilterOptions, StoreType, CostData } from '../types';

interface DashboardProps {
    data: AnalysisResult[] | null;
    isLoading: boolean;
    error: string | null;
    filters: FilterOptions;
}

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-gray-700 text-white rounded-md shadow-lg border border-gray-600">
                <p className="label font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => {
                     const unit = pld.dataKey === 'count' ? '개' : '만원';
                     return (
                        <p key={index} style={{ color: pld.fill }}>
                            {`${pld.name}: ${formatNumber(pld.value)} ${unit}`}
                        </p>
                    )
                })}
            </div>
        );
    }
    return null;
};

const Dashboard: React.FC<DashboardProps> = ({ data, isLoading, error, filters }) => {
    const [editableData, setEditableData] = useState<AnalysisResult[] | null>(null);
    const [activeTab, setActiveTab] = useState<StoreType | null>(null);

    useEffect(() => {
        setEditableData(data);
        if (data && data.length > 0) {
            const currentTabIsValid = data.some(d => d.storeType === activeTab);
            if (!activeTab || !currentTabIsValid) {
                setActiveTab(data[0].storeType);
            }
        } else {
            setActiveTab(null);
        }
    }, [data, activeTab]);

    const handleCostChange = (field: keyof Omit<CostData, 'totalStartup' | 'totalMonthly'>, value: number) => {
        if (!activeTab) return;

        setEditableData(prevData => {
            if (!prevData) return null;
            return prevData.map(result => {
                if (result.storeType === activeTab) {
                    const newCosts = { ...result.costs, [field]: isNaN(value) ? 0 : value };
                    
                    newCosts.totalStartup = newCosts.franchiseFee + newCosts.deposit + newCosts.interior + newCosts.other;
                    newCosts.totalMonthly = newCosts.rent + newCosts.labor + newCosts.utilities;

                    return { ...result, costs: newCosts };
                }
                return result;
            });
        });
    };

    const renderInitialState = () => (
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">분석을 시작하세요</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">좌측 패널에서 조건을 설정하고 'AI 분석 시작하기' 버튼을 눌러주세요.</p>
        </div>
    );
    
    const renderLoading = () => (
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col items-center justify-center h-full">
             <svg className="animate-spin h-12 w-12 text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">AI가 데이터를 분석하고 있습니다...</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">최적의 결과를 위해 잠시만 기다려주세요.</p>
        </div>
    );

    const renderError = () => (
        <div className="text-center p-12 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-xl shadow-lg flex flex-col items-center justify-center h-full">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">분석 실패</h2>
            <p className="mt-2 text-red-600 dark:text-red-300 max-w-md">{error}</p>
        </div>
    );
    
    const CostInput = ({ field, value }: { field: keyof Omit<CostData, 'totalStartup' | 'totalMonthly'>, value: number }) => (
        <input
            type="number"
            value={value}
            onChange={(e) => handleCostChange(field, parseInt(e.target.value, 10))}
            className="w-28 p-1 text-right bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            aria-label={field}
        />
    );

    const renderData = (d: AnalysisResult) => (
        <div className="space-y-8">
            {/* Summary & Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h3 className="font-bold text-lg text-primary-600 dark:text-primary-400 mb-2">시장 요약</h3>
                    <p className="text-gray-600 dark:text-gray-300">{d.summary}</p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <h3 className="font-bold text-lg text-green-600 dark:text-green-400 mb-2">AI 최종 조언</h3>
                    <p className="text-gray-600 dark:text-gray-300">{d.recommendation}</p>
                </div>
            </div>

            {/* Commercial Environment Analysis */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-6">상권 환경 분석</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-1">인구 밀집도</h4>
                        <p className="text-lg text-gray-800 dark:text-gray-100 font-bold">{d.populationDensity}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /><path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5H18" /></svg>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-1">유동 인구</h4>
                        <p className="text-lg text-gray-800 dark:text-gray-100 font-bold">{d.floatingPopulation}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mb-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.611-1.573a8.967 8.967 0 015.711-2.032l5.611 1.573a12.02 12.02 0 00-2.923-9.058z" />
                             </svg>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-1">신규 업체 생존율 (1년)</h4>
                         <div className="flex items-baseline">
                            <p className="text-2xl font-bold text-teal-500 dark:text-teal-400">{d.newBusinessSurvivalRate}</p>
                            <span className="text-lg font-bold text-teal-500 dark:text-teal-400 ml-1">%</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-1">업종 폐업률 (연)</h4>
                         <div className="flex items-baseline">
                            <p className="text-2xl font-bold text-red-500 dark:text-red-400">{d.industryClosureRate}</p>
                            <span className="text-lg font-bold text-red-500 dark:text-red-400 ml-1">%</span>
                        </div>
                    </div>
                </div>
            </div>


            {/* Success Rate & Costs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg md:col-span-1 flex flex-col justify-center items-center">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">예상 성공률</h3>
                    <div className="relative w-40 h-40">
                         <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path className="text-gray-200 dark:text-gray-700"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-primary-500"
                                strokeDasharray={`${d.successRate}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold text-gray-800 dark:text-white">{d.successRate}</span>
                            <span className="text-xl font-bold text-gray-500 dark:text-gray-400 mt-2">%</span>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-center font-medium text-gray-600 dark:text-gray-300">{d.successContext}</p>
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg md:col-span-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">예상 비용 (단위: 만원)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">초기 창업 비용</h4>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex justify-between items-center"><span>가맹비</span> <CostInput field="franchiseFee" value={d.costs.franchiseFee} /></li>
                                <li className="flex justify-between items-center"><span>보증금</span> <CostInput field="deposit" value={d.costs.deposit} /></li>
                                <li className="flex justify-between items-center"><span>인테리어</span> <CostInput field="interior" value={d.costs.interior} /></li>
                                <li className="flex justify-between items-center"><span>기타</span> <CostInput field="other" value={d.costs.other} /></li>
                                <li className="flex justify-between font-bold text-gray-700 dark:text-gray-200 pt-2 border-t border-gray-200 dark:border-gray-700"><span>총 합계</span> <span>{formatNumber(d.costs.totalStartup)}</span></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">월 고정 비용</h4>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex justify-between items-center"><span>월세</span> <CostInput field="rent" value={d.costs.rent} /></li>
                                <li className="flex justify-between items-center"><span>인건비</span> <CostInput field="labor" value={d.costs.labor} /></li>
                                <li className="flex justify-between items-center"><span>공과금 등</span> <CostInput field="utilities" value={d.costs.utilities} /></li>
                                 <li className="flex justify-between font-bold text-gray-700 dark:text-gray-200 pt-2 border-t border-gray-200 dark:border-gray-700 mt-4"><span>총 합계</span> <span>{formatNumber(d.costs.totalMonthly)}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg h-96">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">{filters.region} 내 경쟁사 분석</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={d.competitorDistribution} margin={{ top: 5, right: 20, left: 10, bottom: 45 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="brandName" angle={-45} textAnchor="end" interval={0} tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }} />
                            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{ fill: '#3b82f6', fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: '#10b981', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}/>
                            <Legend wrapperStyle={{paddingTop: '40px'}}/>
                            <Bar yAxisId="left" dataKey="count" name="점포 수 (개)" fill="#3b82f6" maxBarSize={40} />
                            <Bar yAxisId="right" dataKey="estimatedMonthlySales" name="월 평균 매출 (만원)" fill="#10b981" maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg h-96">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">{filters.analysisPeriod} 예상 매출 분석 (단위: 만원)</h3>
                     <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={d.sales} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="period" tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="sales" name="예상 매출" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderTabs = () => {
        if (!editableData || editableData.length <= 1) return null;

        return (
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {editableData.map((result) => (
                        <button
                            key={result.storeType}
                            onClick={() => setActiveTab(result.storeType)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === result.storeType
                                    ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                            }`}
                        >
                            {result.storeType} 분석
                        </button>
                    ))}
                </nav>
            </div>
        );
    };

    if (isLoading) return renderLoading();
    if (error) return renderError();
    if (!editableData || editableData.length === 0 || !activeTab) return renderInitialState();
    
    const activeResult = editableData.find(d => d.storeType === activeTab);

    return (
        <div>
            {renderTabs()}
            {activeResult ? renderData(activeResult) : renderInitialState()}
        </div>
    );
};

export default Dashboard;