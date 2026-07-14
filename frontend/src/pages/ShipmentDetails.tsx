import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ArrowLeft, Printer, Download, MapPin, Clock, Camera, User, Package } from 'lucide-react';
import { format } from 'date-fns';

export const ShipmentDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: shipment, isLoading: loadingShipment } = useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => {
      const res = await apiClient.get(`/shipments/${id}`);
      return res.data;
    }
  });

  const { data: timeline, isLoading: loadingTimeline } = useQuery({
    queryKey: ['shipment-timeline', id],
    queryFn: async () => {
      const res = await apiClient.get(`/shipments/${id}/timeline`);
      return res.data;
    }
  });

  if (loadingShipment) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!shipment) return <div className="p-8 text-center text-red-500">Shipment not found</div>;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head><title>Print QR</title></head>
        <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; flex-direction:column;">
          <h2>${shipment.tracking_id}</h2>
          <img src="https://logistic-prototype.onrender.com${shipment.qr_code_url}" style="width: 300px;" />
        </body>
      </html>
    `);
    printWindow?.document.close();
    setTimeout(() => {
      printWindow?.print();
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/shipments" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shipment {shipment.tracking_id}</h1>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {shipment.status}
          </span>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 shadow-sm transition-colors">
            <Printer className="w-4 h-4" /> Print QR
          </button>
          <a 
            href={`https://logistic-prototype.onrender.com${shipment.qr_code_url}`}
            download={`${shipment.tracking_id}_QR.png`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Download QR
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & QR */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
            <h3 className="font-semibold text-gray-800 mb-4">Tracking QR Code</h3>
            {shipment.qr_code_url ? (
              <img src={`https://logistic-prototype.onrender.com${shipment.qr_code_url}`} alt="QR Code" className="w-48 h-48 border rounded-xl" />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">No QR</div>
            )}
            <p className="mt-4 text-sm text-gray-500">Scan this code to update location</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2">Shipment Details</h3>
            <div>
              <p className="text-xs text-gray-500">Origin</p>
              <p className="font-medium text-gray-900">{shipment.from_location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Destination</p>
              <p className="font-medium text-gray-900">{shipment.to_location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Description</p>
              <p className="font-medium text-gray-900">{shipment.description}</p>
            </div>
            {shipment.reference_number && (
              <div>
                <p className="text-xs text-gray-500">Reference Number</p>
                <p className="font-medium text-gray-900">{shipment.reference_number}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Created At</p>
              <p className="font-medium text-gray-900">{format(new Date(shipment.created_at), 'PPP p')}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 border-b pb-4 mb-6">Tracking Timeline</h3>
            
            {loadingTimeline ? (
              <div className="text-center text-gray-500 py-8">Loading timeline...</div>
            ) : timeline && timeline.length > 0 ? (
              <div className="relative border-l-2 border-blue-200 ml-4 space-y-8 pb-4">
                {timeline.map((event: any) => (
                  <div key={event.id} className="relative pl-8">
                    {/* Timeline dot */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white"></div>
                    
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-500" />
                          <span className="font-semibold text-gray-900">{event.executive_name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 bg-white px-2 py-1 rounded-md border">
                          <Clock className="w-4 h-4" />
                          {format(new Date(event.timestamp), 'MMM d, p')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-white p-2 rounded-lg border inline-flex w-full">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="font-medium">Lat: {event.latitude.toFixed(6)}, Lng: {event.longitude.toFixed(6)}</span>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto text-blue-600 hover:underline font-medium text-xs"
                        >
                          View Map
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><Camera className="w-3 h-3"/> Package Photo</p>
                          <img src={`https://logistic-prototype.onrender.com${event.package_photo_url}`} alt="Package" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><Camera className="w-3 h-3"/> Executive Selfie</p>
                          <img src={`https://logistic-prototype.onrender.com${event.selfie_photo_url}`} alt="Selfie" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-gray-600">No scans recorded yet.</p>
                <p className="text-sm">Scan the QR code to add the first movement.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
