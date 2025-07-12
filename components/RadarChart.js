'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

import { initTWE } from 'tw-elements';

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function RadarChart({ dataValues = [0, 0, 0], compareValues = null }) {
  const canvasRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    initTWE({ Chart });

    if (chartInstance) chartInstance.destroy();

    const newChart = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels: ['Comprehension', 'Speed', 'Mastery'],
        datasets: [
              {
                label: 'Current Stats',
                data: dataValues,
                fill: true,
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderColor: 'rgba(168, 85, 247, 1)',
                pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(168, 85, 247, 1)',
                animations: {
                  tension: { duration: 0 },
                },
              },

          ...(compareValues
            ? [{
                label: 'Previous Stats',
                data: compareValues,
                fill: true,
                backgroundColor: 'rgba(107, 114, 128, 0.2)', // gray-500
                borderColor: 'rgba(107, 114, 128, 0.6)',
                pointBackgroundColor: 'rgba(107, 114, 128, 0.6)',
                pointBorderColor: '#fff',
              }]
            : []),
        ],
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: 100,
            ticks: { stepSize: 25 },
            grid: { color: '#e5e7eb' },
            pointLabels: { font: { size: 8 } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const i = ctx.dataIndex;
                const metric = ctx.chart.data.labels[i];
                const value = ctx.formattedValue;

                // Descriptions for each stat
                const definitions = {
                  Comprehension:
                    "Average similarity between your recollection and the original note.\nFormula: avg(similarity) × 100",
                  Speed:
                    "Typing speed adjusted for completeness of recall.\nFormula: WPM × completeness ÷ 3",
                  Mastery:
                    "Consistency in earning 3 stars on a note.\nFormula: (3-star sessions ÷ all sessions) × 100",
                };

                return `${metric}: ${value}\n${definitions[metric] || ""}`;
              },
            },
          },
        },

      },
    });

    setChartInstance(newChart);
    return () => newChart.destroy();
  }, [dataValues, compareValues]);

  return (
    <div className="relative w-[400px] h-[400px] p-4">
      <canvas ref={canvasRef}></canvas>

      {/* Floating comparison table */}
      {compareValues && (
        <div className="absolute top-4 right-[-200px] w-[220px] bg-white border border-purple-200 shadow-lg rounded-lg p-3 text-xs transition-opacity duration-300 opacity-100">
          <h3 className="text-center font-semibold text-purple-600 mb-2">Comparison</h3>
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="text-gray-500 text-xs">Metric </th>
                <th className="text-purple-700 text-xs">Now ← Then</th>
              </tr>
            </thead>
            <tbody>
              {['Comprehension', 'Speed', 'Mastery'].map((metric, i) => {
                const definitions = {
                  Comprehension: (
                    <>
                      Avg similarity between recall & original.<br />
                      <span className="text-gray-400 text-xs">
                        Formula: avg(similarity) × 100
                      </span>
                    </>
                  ),
                  Speed: (
                    <>
                      Typing pace × completeness.<br />
                      <span className="text-gray-400 text-xs">
                        Formula: (WPM × completeness ÷ 3)
                      </span>
                    </>
                  ),
                  Mastery: (
                    <>
                      Consistency earning 3 stars.<br />
                      <span className="text-gray-400 text-xs">
                        Formula: (3-star sessions ÷ all sessions) × 100
                      </span>
                    </>
                  ),
                };

                return (
                  <tr key={metric}>
                    <td className="py-1">
                      <span className="relative group cursor-help text-purple-700">
                        {metric}
                        <span className="absolute left-full ml-2 hidden group-hover:block w-max max-w-xs bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-10">
                          {definitions[metric]}
                        </span>
                      </span>
                    </td>
                    <td className="py-1">
                      {dataValues[i]} ← {compareValues[i]}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      )}

    </div>
  );
}
