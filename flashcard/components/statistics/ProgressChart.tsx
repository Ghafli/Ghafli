import { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DataPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  label: string;
}

const ProgressChart = ({ data, label }: ProgressChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(point => point.date),
        datasets: [
          {
            label,
            data: data.map(point => point.value),
            fill: true,
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light + '40',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: theme.palette.primary.main,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top' as const,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: theme.palette.divider,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, label, theme]);

  return (
    <Box sx={{ width: '100%', height: 300, position: 'relative' }}>
      <canvas ref={chartRef} />
    </Box>
  );
};

export default ProgressChart;
