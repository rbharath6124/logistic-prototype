import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Package, Truck, CheckCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/stats/dashboard');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  const statCards = [
    { title: "Created Today", value: stats?.packages_created_today || 0, icon: PlusIcon, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Scanned Today", value: stats?.packages_scanned_today || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { title: "Total Movements", value: stats?.package_movements_today || 0, icon: Truck, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Active Packages", value: stats?.active_packages || 0, icon: Package, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
            </div>
            <div className={`${card.bg} p-4 rounded-xl`}>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Movements This Week</h3>
          <div className="h-64">
            <Line 
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                  label: 'Movements',
                  data: [12, 19, 3, 5, 2, 3, stats?.package_movements_today || 0],
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  tension: 0.4
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Package Status Distribution</h3>
          <div className="h-64">
            <Bar 
              data={{
                labels: ['Created', 'In Transit', 'Delivered'],
                datasets: [{
                  label: 'Packages',
                  data: [stats?.never_scanned_packages || 0, stats?.active_packages || 0, 0],
                  backgroundColor: [
                    'rgba(209, 213, 219, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                  ],
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Lucide React doesn't have a PlusIcon by default, wait it does have Plus
function PlusIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  );
}
