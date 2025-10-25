'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface IntegrationStatus {
  name: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
  responseTime?: number;
}

export default function IntegrationsDemo() {
  const [integrations, setIntegrations] = useState<Record<string, IntegrationStatus>>({
    claude: {
      name: 'Claude 3.7 Sonnet',
      status: 'idle',
      message: 'AI analysis engine - Click to test',
    },
    stackAuth: {
      name: 'Stack Auth',
      status: 'idle',
      message: 'Authentication system - Click to test',
    },
    s2: {
      name: 's2.dev Events',
      status: 'idle',
      message: 'Event streaming - Click to test',
    },
    lingo: {
      name: 'Lingo.dev Translation',
      status: 'idle',
      message: 'AI translation - Click to test',
    },
    cactus: {
      name: 'Cactus Compute',
      status: 'idle',
      message: 'Batch processing - Click to test',
    },
  });

  const testIntegration = async (key: string) => {
    setIntegrations(prev => ({
      ...prev,
      [key]: { ...prev[key], status: 'testing', message: 'Testing connection...' }
    }));

    const startTime = Date.now();

    try {
      const response = await fetch(`/api/test-${key}`);
      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        setIntegrations(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: 'success',
            message: data.message || 'Connected successfully!',
            responseTime
          }
        }));
      } else {
        throw new Error(data.error || 'Test failed');
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setIntegrations(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: 'error',
          message: error instanceof Error ? error.message : 'Connection failed',
          responseTime
        }
      }));
    }
  };

  const testAll = async () => {
    for (const key of Object.keys(integrations)) {
      await testIntegration(key);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusColor = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-700';
      case 'testing': return 'bg-blue-100 text-blue-700 animate-pulse';
      case 'success': return 'bg-green-100 text-green-700';
      case 'error': return 'bg-red-100 text-red-700';
    }
  };

  const getStatusIcon = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'idle': return '⚪';
      case 'testing': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const allTested = Object.values(integrations).every(i => i.status !== 'idle');
  const allSuccess = Object.values(integrations).every(i => i.status === 'success');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">SyllaBot Integration Status</h1>
          <p className="text-gray-600 mb-4">VIBE25-4 Hackathon - Live Integration Testing</p>

          {allTested && (
            <div className={`inline-block px-6 py-3 rounded-full font-semibold ${
              allSuccess
                ? 'bg-green-600 text-white'
                : 'bg-yellow-600 text-white'
            }`}>
              {allSuccess ? '🎉 All 5 Integrations Connected!' : '⚠️ Some integrations need attention'}
            </div>
          )}
        </div>

        {/* Test All Button */}
        <div className="mb-6 text-center">
          <Button
            onClick={testAll}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
          >
            🧪 Test All Integrations
          </Button>
        </div>

        {/* Integration Cards */}
        <div className="space-y-4">
          {Object.entries(integrations).map(([key, integration]) => (
            <Card key={key} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getStatusIcon(integration.status)}</span>
                    <h2 className="text-xl font-semibold">{integration.name}</h2>
                    {integration.status === 'success' && integration.responseTime && (
                      <span className="text-sm text-gray-500">
                        ({integration.responseTime}ms)
                      </span>
                    )}
                  </div>
                  <p className={`text-sm px-3 py-1 rounded inline-block ${getStatusColor(integration.status)}`}>
                    {integration.message}
                  </p>
                </div>
                <Button
                  onClick={() => testIntegration(key)}
                  disabled={integration.status === 'testing'}
                  variant={integration.status === 'success' ? 'outline' : 'default'}
                >
                  {integration.status === 'testing' ? 'Testing...' : 'Test'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        {allTested && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Integration Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {Object.values(integrations).filter(i => i.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Connected</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {Object.values(integrations).filter(i => i.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {allSuccess ? '+25%' : `+${Object.values(integrations).filter(i => i.status === 'success').length * 5}%`}
                </div>
                <div className="text-sm text-gray-600">Hackathon Bonus</div>
              </div>
            </div>
          </div>
        )}

        {/* Technical Details */}
        <div className="mt-8 p-6 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm">
          <div className="mb-2 text-green-400">$ Integration Details:</div>
          {Object.entries(integrations).map(([key, integration]) => (
            <div key={key} className="mb-1">
              <span className="text-blue-400">[{integration.name}]</span>
              <span className="text-gray-400"> → </span>
              <span className={
                integration.status === 'success' ? 'text-green-400' :
                integration.status === 'error' ? 'text-red-400' :
                integration.status === 'testing' ? 'text-yellow-400' :
                'text-gray-400'
              }>
                {integration.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a href="/" className="text-purple-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
