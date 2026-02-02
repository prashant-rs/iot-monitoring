import { useQuery } from '@tanstack/react-query';
import { sensorLogAPI, sensorAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Droplets, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SensorCard({ reading }) {
  const isTemperature = reading.type === 'temperature';
  const Icon = isTemperature ? Thermometer : Droplets;
  const color = isTemperature ? 'text-orange-500' : 'text-blue-500';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            {reading.sensor_name}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {reading.bedroom_name}
          </Badge>
        </div>
        <CardDescription className="text-xs capitalize">{reading.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {reading.value} {reading.unit}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(reading.timestamp).toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}

function SensorStats({ sensorId, sensorName }) {
  const { data: statsData } = useQuery({
    queryKey: ['sensor-stats', sensorId],
    queryFn: () => sensorLogAPI.getSensorStats(sensorId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = statsData?.data;

  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{sensorName} Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Min</p>
            <p className="font-bold text-lg flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              {stats.min_value}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg</p>
            <p className="font-bold text-lg flex items-center gap-1">
              <Activity className="h-4 w-4 text-green-500" />
              {parseFloat(stats.avg_value).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Max</p>
            <p className="font-bold text-lg flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-red-500" />
              {stats.max_value}
            </p>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Total Readings: {stats.reading_count}
        </div>
      </CardContent>
    </Card>
  );
}

function SensorChart({ sensorId, sensorName }) {
  const { data: readingsData } = useQuery({
    queryKey: ['sensor-readings', sensorId],
    queryFn: () => sensorLogAPI.getBySensor(sensorId),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const readings = readingsData?.data || [];
  
  // Take last 20 readings and reverse for chronological order
  const chartData = readings
    .slice(0, 20)
    .reverse()
    .map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString(),
      value: parseFloat(r.value),
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{sensorName} - Historical Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{sensorName} - Last 20 Readings</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  // Fetch latest readings with auto-refresh every 10 seconds
  const { data: latestData, isLoading: isLoadingLatest } = useQuery({
    queryKey: ['latest-readings'],
    queryFn: sensorLogAPI.getLatest,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Fetch all sensors
  const { data: sensorsData } = useQuery({
    queryKey: ['sensors'],
    queryFn: sensorAPI.getAll,
  });

  const latestReadings = latestData?.data || [];
  const sensors = sensorsData?.data || [];
  const activeSensors = sensors.filter(s => s.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Live Dashboard</h2>
        <p className="text-muted-foreground">Real-time monitoring of all sensors</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sensors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{activeSensors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Latest Readings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{latestReadings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Sensor Readings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Current Readings</h3>
        {isLoadingLatest ? (
          <div className="text-center py-8">Loading sensor data...</div>
        ) : latestReadings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No sensor data available. Make sure the simulation is running.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestReadings.map((reading) => (
              <SensorCard key={reading.id} reading={reading} />
            ))}
          </div>
        )}
      </div>

      {/* Sensor Statistics */}
      {activeSensors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Sensor Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSensors.slice(0, 6).map((sensor) => (
              <SensorStats key={sensor.id} sensorId={sensor.id} sensorName={sensor.name} />
            ))}
          </div>
        </div>
      )}

      {/* Historical Charts */}
      {activeSensors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Historical Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSensors.slice(0, 4).map((sensor) => (
              <SensorChart key={sensor.id} sensorId={sensor.id} sensorName={sensor.name} />
            ))}
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="text-xs text-muted-foreground text-center">
        Dashboard auto-refreshes every 10 seconds
      </div>
    </div>
  );
}
