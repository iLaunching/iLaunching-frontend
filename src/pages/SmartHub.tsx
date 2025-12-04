import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';

interface SmartHubData {
  id: string;
  name: string;
  hub_color: string;
  is_default: boolean;
  created_at: string;
}

interface SmartMatrixData {
  id: string;
  name: string;
  smart_hub_id: string;
  created_at: string;
}

export default function SmartHub() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hubData, setHubData] = useState<SmartHubData | null>(null);
  const [matrixData, setMatrixData] = useState<SmartMatrixData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/');
          return;
        }

        // TODO: Add API endpoint to fetch user's Smart Hub and Matrix
        // For now, show welcome message
        setLoading(false);
      } catch (err) {
        console.error('Failed to load Smart Hub:', err);
        setError('Failed to load your Smart Hub');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Header aiActive={true} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your Smart Hub...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Header aiActive={true} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header aiActive={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Your Smart Hub! 🚀
          </h1>
          <p className="text-lg text-gray-600">
            Your intelligent workspace is ready. Let's get started!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matrix</h3>
            <p className="text-gray-600 mb-4">
              Your intelligent data center and brain for all operations
            </p>
            <button className="text-purple-600 font-medium hover:text-purple-700">
              Open Matrix →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant</h3>
            <p className="text-gray-600 mb-4">
              Get help from your intelligent business advisor
            </p>
            <button className="text-purple-600 font-medium hover:text-purple-700">
              Start Chat →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Hub Settings</h3>
            <p className="text-gray-600 mb-4">
              Customize your workspace and preferences
            </p>
            <button className="text-purple-600 font-medium hover:text-purple-700">
              Configure →
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Explore Your Smart Matrix</h4>
                <p className="text-gray-600">Learn how to organize and manage your business data</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-pink-50 rounded-lg">
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Connect Your Tools</h4>
                <p className="text-gray-600">Integrate your favorite business tools and platforms</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Invite Your Team</h4>
                <p className="text-gray-600">Collaborate with your team members in your Smart Hub</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

