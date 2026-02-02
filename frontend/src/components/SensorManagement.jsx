import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sensorAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Thermometer, Droplets, ArrowLeft, Power, PowerOff } from 'lucide-react';

export default function SensorManagement({ bedroom, onBack }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'temperature',
    unit: '°C',
    min_value: '',
    max_value: '',
    is_active: true,
  });
  const queryClient = useQueryClient();

  // Fetch sensors for this bedroom
  const { data: sensorsData, isLoading } = useQuery({
    queryKey: ['sensors', bedroom.id],
    queryFn: () => sensorAPI.getByBedroom(bedroom.id),
  });

  // Create sensor mutation
  const createMutation = useMutation({
    mutationFn: sensorAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['sensors', bedroom.id]);
      queryClient.invalidateQueries(['bedrooms']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // Update sensor mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sensorAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sensors', bedroom.id]);
      queryClient.invalidateQueries(['bedrooms']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // Delete sensor mutation
  const deleteMutation = useMutation({
    mutationFn: sensorAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['sensors', bedroom.id]);
      queryClient.invalidateQueries(['bedrooms']);
    },
  });

  // Toggle sensor mutation
  const toggleMutation = useMutation({
    mutationFn: sensorAPI.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries(['sensors', bedroom.id]);
      queryClient.invalidateQueries(['bedrooms']);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'temperature',
      unit: '°C',
      min_value: '',
      max_value: '',
      is_active: true,
    });
    setEditingSensor(null);
  };

  const handleTypeChange = (type) => {
    const unit = type === 'temperature' ? '°C' : '%';
    const minValue = type === 'temperature' ? '22.5' : '30.0';
    const maxValue = type === 'temperature' ? '35.0' : '70.0';
    
    setFormData({
      ...formData,
      type,
      unit,
      min_value: editingSensor ? formData.min_value : minValue,
      max_value: editingSensor ? formData.max_value : maxValue,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      bedroom_id: bedroom.id,
      min_value: parseFloat(formData.min_value),
      max_value: parseFloat(formData.max_value),
    };

    if (editingSensor) {
      updateMutation.mutate({ id: editingSensor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (sensor) => {
    setEditingSensor(sensor);
    setFormData({
      name: sensor.name,
      type: sensor.type,
      unit: sensor.unit,
      min_value: sensor.min_value.toString(),
      max_value: sensor.max_value.toString(),
      is_active: sensor.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      deleteMutation.mutate(id);
    }
  };

  const sensors = sensorsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bedrooms
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{bedroom.name} - Sensors</h2>
          <p className="text-muted-foreground">Manage sensors for this bedroom</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Sensor
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading sensors...</div>
      ) : sensors.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Thermometer className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No sensors yet. Add your first sensor to start monitoring.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => (
            <Card key={sensor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {sensor.type === 'temperature' ? (
                        <Thermometer className="h-5 w-5 text-orange-500" />
                      ) : (
                        <Droplets className="h-5 w-5 text-blue-500" />
                      )}
                      {sensor.name}
                    </CardTitle>
                    <CardDescription className="mt-2 capitalize">
                      {sensor.type} Sensor
                    </CardDescription>
                  </div>
                  <Badge variant={sensor.is_active ? "default" : "secondary"}>
                    {sensor.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Range: </span>
                    <span className="font-medium">
                      {sensor.min_value} - {sensor.max_value} {sensor.unit}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Unit: </span>
                    <span className="font-medium">{sensor.unit}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={sensor.is_active ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleMutation.mutate(sensor.id)}
                  >
                    {sensor.is_active ? (
                      <><PowerOff className="h-4 w-4 mr-1" /> Deactivate</>
                    ) : (
                      <><Power className="h-4 w-4 mr-1" /> Activate</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(sensor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(sensor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => { setIsDialogOpen(false); resetForm(); }}>
          <DialogHeader>
            <DialogTitle>
              {editingSensor ? 'Edit Sensor' : 'Add New Sensor'}
            </DialogTitle>
            <DialogDescription>
              {editingSensor ? 'Update sensor configuration' : 'Create a new sensor for this bedroom'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Sensor Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Temperature Sensor 1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Sensor Type *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'temperature' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => handleTypeChange('temperature')}
                >
                  <Thermometer className="mr-2 h-4 w-4" /> Temperature
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'humidity' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => handleTypeChange('humidity')}
                >
                  <Droplets className="mr-2 h-4 w-4" /> Humidity
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_value">Min Value *</Label>
                <Input
                  id="min_value"
                  type="number"
                  step="0.01"
                  placeholder="22.5"
                  value={formData.min_value}
                  onChange={(e) => setFormData({ ...formData, min_value: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_value">Max Value *</Label>
                <Input
                  id="max_value"
                  type="number"
                  step="0.01"
                  placeholder="35.0"
                  value={formData.max_value}
                  onChange={(e) => setFormData({ ...formData, max_value: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                placeholder="°C or %"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active">Active (generates data in simulation)</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsDialogOpen(false); resetForm(); }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSensor ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
