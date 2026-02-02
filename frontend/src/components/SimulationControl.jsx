import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { simulationAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RefreshCw, Settings } from 'lucide-react';

export default function SimulationControl() {
  const [customInterval, setCustomInterval] = useState('60');
  const queryClient = useQueryClient();

  // Fetch simulation status
  const { data: statusData, isLoading } = useQuery({
    queryKey: ['simulation-status'],
    queryFn: simulationAPI.getStatus,
    refetchInterval: 5000, // Check status every 5 seconds
  });

  // Start simulation mutation
  const startMutation = useMutation({
    mutationFn: (intervalMs) => simulationAPI.start(intervalMs),
    onSuccess: () => {
      queryClient.invalidateQueries(['simulation-status']);
    },
  });

  // Stop simulation mutation
  const stopMutation = useMutation({
    mutationFn: simulationAPI.stop,
    onSuccess: () => {
      queryClient.invalidateQueries(['simulation-status']);
    },
  });

  // Restart simulation mutation
  const restartMutation = useMutation({
    mutationFn: (intervalMs) => simulationAPI.restart(intervalMs),
    onSuccess: () => {
      queryClient.invalidateQueries(['simulation-status']);
    },
  });

  const status = statusData?.data;
  const isRunning = status?.is_running || false;
  const currentInterval = status?.interval_seconds || 60;

  const handleStart = () => {
    const intervalMs = parseInt(customInterval) * 1000;
    if (intervalMs >= 1000 && intervalMs <= 3600000) {
      startMutation.mutate(intervalMs);
    } else {
      alert('Interval must be between 1 and 3600 seconds');
    }
  };

  const handleStop = () => {
    stopMutation.mutate();
  };

  const handleRestart = () => {
    const intervalMs = parseInt(customInterval) * 1000;
    if (intervalMs >= 1000 && intervalMs <= 3600000) {
      restartMutation.mutate(intervalMs);
    } else {
      alert('Interval must be between 1 and 3600 seconds');
    }
  };

  const presetIntervals = [
    { label: '10 seconds (Testing)', value: 10 },
    { label: '30 seconds', value: 30 },
    { label: '60 seconds (Default)', value: 60 },
    { label: '2 minutes', value: 120 },
    { label: '5 minutes', value: 300 },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Loading simulation status...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Simulation Control</h2>
        <p className="text-muted-foreground">Manage automated sensor data generation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Status
              </span>
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? 'Running' : 'Stopped'}
              </Badge>
            </CardTitle>
            <CardDescription>Current simulation status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Interval</p>
              <p className="text-2xl font-bold">{currentInterval} seconds</p>
            </div>
            <div className="flex gap-2">
              {isRunning ? (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleStop}
                  disabled={stopMutation.isPending}
                >
                  <Square className="mr-2 h-4 w-4" />
                  {stopMutation.isPending ? 'Stopping...' : 'Stop Simulation'}
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={handleStart}
                  disabled={startMutation.isPending}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {startMutation.isPending ? 'Starting...' : 'Start Simulation'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleRestart}
                disabled={restartMutation.isPending || !isRunning}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Restart
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interval Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Interval Configuration</CardTitle>
            <CardDescription>Set data generation interval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interval">Custom Interval (seconds)</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                max="3600"
                value={customInterval}
                onChange={(e) => setCustomInterval(e.target.value)}
                placeholder="60"
              />
              <p className="text-xs text-muted-foreground">
                Min: 1 second, Max: 3600 seconds (1 hour)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {presetIntervals.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={parseInt(customInterval) === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomInterval(preset.value.toString())}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How Simulation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• The simulation automatically generates random sensor data at the configured interval</p>
          <p>• Only active sensors will generate data</p>
          <p>• Values are generated within each sensor's min/max range</p>
          <p>• All data is stored in the database and visible on the dashboard</p>
          <p>• You can start/stop the simulation anytime without losing data</p>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {startMutation.isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ Simulation started successfully
        </div>
      )}
      {stopMutation.isSuccess && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          ✓ Simulation stopped successfully
        </div>
      )}
      {restartMutation.isSuccess && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-purple-800">
          ✓ Simulation restarted successfully
        </div>
      )}
      {(startMutation.isError || stopMutation.isError || restartMutation.isError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          ✗ An error occurred. Please try again.
        </div>
      )}
    </div>
  );
}
