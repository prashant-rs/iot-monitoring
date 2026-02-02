import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bedroomAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Home } from 'lucide-react';

export default function BedroomManagement({ onSelectBedroom }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBedroom, setEditingBedroom] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  // Fetch bedrooms
  const { data: bedroomsData, isLoading } = useQuery({
    queryKey: ['bedrooms'],
    queryFn: bedroomAPI.getAll,
  });

  // Create bedroom mutation
  const createMutation = useMutation({
    mutationFn: bedroomAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['bedrooms']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // Update bedroom mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => bedroomAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bedrooms']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // Delete bedroom mutation
  const deleteMutation = useMutation({
    mutationFn: bedroomAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['bedrooms']);
    },
  });

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingBedroom(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBedroom) {
      updateMutation.mutate({ id: editingBedroom.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (bedroom) => {
    setEditingBedroom(bedroom);
    setFormData({ name: bedroom.name, description: bedroom.description || '' });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this bedroom? All associated sensors will be deleted.')) {
      deleteMutation.mutate(id);
    }
  };

  const bedrooms = bedroomsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bedrooms</h2>
          <p className="text-muted-foreground">Manage your apartment bedrooms</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Bedroom
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading bedrooms...</div>
      ) : bedrooms.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No bedrooms yet. Add your first bedroom to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bedrooms.map((bedroom) => (
            <Card key={bedroom.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      {bedroom.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {bedroom.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      Sensors: <Badge variant="secondary">{bedroom.sensor_count || 0}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active: <Badge variant={bedroom.active_sensors > 0 ? "default" : "outline"}>
                        {bedroom.active_sensors || 0}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onSelectBedroom(bedroom)}
                  >
                    Manage Sensors
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(bedroom)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(bedroom.id)}
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
              {editingBedroom ? 'Edit Bedroom' : 'Add New Bedroom'}
            </DialogTitle>
            <DialogDescription>
              {editingBedroom ? 'Update bedroom information' : 'Create a new bedroom in your apartment'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bedroom Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Master Bedroom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Bedroom with en-suite bathroom"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
                {editingBedroom ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
