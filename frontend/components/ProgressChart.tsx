/**
 * Progress Chart Component
 * Line chart showing improvement over time
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressChartProps {
  data: {
    dates: string[];
    lexicalScores: number[];
    grammarScores: number[];
    cefrLevels: string[];
  };
}

export default function ProgressChart({ data }: ProgressChartProps) {
  // Transform data for recharts
  const chartData = data.dates.map((date, index) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    vocabulary: data.lexicalScores[index] || 0,
    grammar: data.grammarScores[index] || 0,
    level: data.cefrLevels[index],
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            domain={[0, 100]} 
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="vocabulary" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Vocabulary"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="grammar" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="Grammar"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

