import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } } },
};

export function BorrowChart({ data = [] }) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [{
      label: 'Books Borrowed',
      data: data.map(d => d.count),
      backgroundColor: 'rgba(37,99,235,0.8)',
      borderColor: '#2563EB',
      borderRadius: 6,
      borderWidth: 0,
    }],
  };
  return (
    <div style={{ height: 280 }}>
      <Bar data={chartData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, title: { display: false } } }} />
    </div>
  );
}

export function ReturnChart({ data = [] }) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [{
      label: 'Books Returned',
      data: data.map(d => d.count),
      borderColor: '#22C55E',
      backgroundColor: 'rgba(34,197,94,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#22C55E',
      pointRadius: 4,
    }],
  };
  return (
    <div style={{ height: 280 }}>
      <Line data={chartData} options={chartDefaults} />
    </div>
  );
}

const COLORS = ['#2563EB','#22C55E','#EF4444','#F59E0B','#06B6D4','#8B5CF6','#EC4899','#14B8A6'];

export function CategoryChart({ data = [] }) {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [{
      data: data.map(d => d.count),
      backgroundColor: COLORS,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };
  return (
    <div style={{ height: 280 }}>
      <Doughnut data={chartData} options={{ ...chartDefaults, cutout: '65%' }} />
    </div>
  );
}

export function MostBorrowedChart({ data = [] }) {
  const chartData = {
    labels: data.map(d => d.title?.length > 20 ? d.title.slice(0, 20) + '…' : d.title),
    datasets: [{
      label: 'Times Borrowed',
      data: data.map(d => d.borrow_count),
      backgroundColor: COLORS,
      borderRadius: 6,
      borderWidth: 0,
    }],
  };
  return (
    <div style={{ height: 280 }}>
      <Bar
        data={chartData}
        options={{
          ...chartDefaults,
          indexAxis: 'y',
          plugins: { ...chartDefaults.plugins, legend: { display: false } },
        }}
      />
    </div>
  );
}
