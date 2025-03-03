import { useState } from 'react';
import { LoadingState } from './shared/LoadingState';
import { useNotifications } from '@/context/NotificationContext';
import { ZeedChainError, ErrorCode } from '@/types/errors';
import { AIAnalysisResponse, AIInvestmentAdvice } from '@/services/AIService';

interface AIAdvisorProps {
    startupId: number;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ startupId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ZeedChainError | null>(null);
    const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
    const { addNotification } = useNotifications();

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/ai-advisor?startupId=${startupId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch analysis');
            }
            
            const data = await response.json();
            setAnalysis(data);
            
            addNotification({
                type: 'success',
                title: 'Analysis Complete',
                message: 'AI analysis has been generated successfully',
                duration: 5000
            });
        } catch (err: any) {
            const aiError = new ZeedChainError(
                ErrorCode.ANALYSIS_FAILED,
                'Failed to generate AI analysis',
                err
            );
            setError(aiError);
            
            addNotification({
                type: 'error',
                title: 'Analysis Failed',
                message: aiError.message,
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">AI Investment Advisor</h3>
                <button
                    onClick={fetchAnalysis}
                    disabled={loading}
                    className="btn-primary"
                >
                    {loading ? 'Analyzing...' : 'Generate Analysis'}
                </button>
            </div>

            <LoadingState isLoading={loading} error={error}>
                {analysis && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-medium text-lg">Recommendation</h4>
                                    <p className="text-gray-600">{analysis.recommendation}</p>
                                </div>
                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                    Confidence: {analysis.confidenceScore}%
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <h5 className="font-medium mb-2">Strengths</h5>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        {analysis.analysis.strengths.map((strength, i) => (
                                            <li key={i} className="text-green-600">{strength}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-medium mb-2">Weaknesses</h5>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        {analysis.analysis.weaknesses.map((weakness, i) => (
                                            <li key={i} className="text-red-600">{weakness}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h5 className="font-medium mb-2">Market Fit</h5>
                                <p className="text-sm text-gray-600">{analysis.analysis.marketFit}</p>
                            </div>

                            <div className="mt-4">
                                <h5 className="font-medium mb-2">Growth Potential</h5>
                                <p className="text-sm text-gray-600">{analysis.analysis.growthPotential}</p>
                            </div>

                            <div className="mt-4">
                                <h5 className="font-medium mb-2">Risk Factors</h5>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {analysis.analysis.riskFactors.map((risk, i) => (
                                        <li key={i} className="text-yellow-600">{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </LoadingState>
        </div>
    );
};