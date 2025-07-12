'use client';
import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
} from 'chart.js';
import { initTWE } from 'tw-elements';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip);

export default function LineChart({ data = [], highlightId = null }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    initTWE({ Chart });

    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    
    const labels = Array.isArray(data) && data.length > 0
      ? data.map((_, i) => i + 1)
      : [];
    const similarityValues = Array.isArray(data) && data.length > 0
      ? data.map(s => s.similarity)
      : [];


    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Similarity',
            data: similarityValues,
            borderColor: 'rgba(168, 85, 247, 1)', // purple line
            backgroundColor: 'rgba(168, 85, 247, 0.1)', // light fill
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 6,
              pointBackgroundColor: (ctx) => {
                const i = ctx.dataIndex;
                const session = data[i];
                return session?.id === highlightId ? '#facc15' : '#9333ea';
              },
              pointBorderColor: (ctx) => {
                const i = ctx.dataIndex;
                const session = data[i];
                return session?.id === highlightId ? '#facc15' : '#9333ea';
              },

          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 20, // optional: slight top padding
          },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Accuracy',
            },
            min: 0,
            max: 1.05,
            
            ticks: {
              stepSize: 0.2,
              callback: (v) => v.toFixed(2),
            },
          },
          x: {
            title: {
              display: true,
              text: 'Trials',
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Similarity: ${ctx.parsed.y.toFixed(3)}`,
            },
          },
        },
      }

    });

    return () => chartInstance.destroy();
  }, [data, highlightId]);

  return (
    <div className="w-full h-49">
      <canvas ref={canvasRef}className="w-full h-full">  </canvas>
    </div>
  );
}
