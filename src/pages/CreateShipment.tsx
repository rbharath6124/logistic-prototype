import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const schema = z.object({
  from_location: z.string().min(2, 'Origin location is required'),
  to_location: z.string().min(2, 'Destination location is required'),
  description: z.string().min(5, 'Package description must be at least 5 characters'),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const CreateShipment = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiClient.post('/shipments/', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      navigate(`/shipments/${data.tracking_id}`);
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/shipments" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Shipment</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Origin Location *</label>
              <input
                {...register('from_location')}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm"
                placeholder="e.g. Warehouse A, New York"
              />
              {errors.from_location && <p className="text-red-500 text-xs mt-1">{errors.from_location.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Destination Location *</label>
              <input
                {...register('to_location')}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm"
                placeholder="e.g. Store 42, Los Angeles"
              />
              {errors.to_location && <p className="text-red-500 text-xs mt-1">{errors.to_location.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Package Description *</label>
            <input
              {...register('description')}
              className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm"
              placeholder="e.g. Electronics - 2 boxes"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Reference Number</label>
              <input
                {...register('reference_number')}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm"
                placeholder="Optional PO/Invoice number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Internal Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm"
              placeholder="Any special instructions..."
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
            >
              {mutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {mutation.isPending ? 'Creating...' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
