import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import DeliveryMap from '../components/DeliveryMap';
import { Phone, CheckCircle2, Bike, Home } from 'lucide-react';

export default function DeliveryTracking() {
  const { apiBase } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-9824X';
  const [order, setOrder] = useState(null);

  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${apiBase}/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Error fetching order tracking:", err);
      }
    };

    fetchOrder();
    
    // Poll every 10 seconds for order status updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [apiBase, orderId]);

  useEffect(() => {
    // Setup Socket.io connection for real-time location
    const socket = io(apiBase);

    socket.on('connect', () => {
      console.log('Connected to real-time tracking');
    });

    socket.on('driverLocationUpdate', (location) => {
      setDriverLocation(location);
    });

    return () => {
      socket.disconnect();
    };
  }, [apiBase]);

  const currentStatus = order?.status || 'Out for Delivery'; // Mock default to Out for Delivery

  return (
    <main className="container mx-auto px-4 py-8 mt-28 lg:mt-32 max-w-6xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Order Tracking <span className="text-gray-500 text-lg font-normal">#{orderId}</span>
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        {/* Left Side: Map (60%) */}
        <div className="w-full lg:w-3/5 h-[550px] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-2 relative">
          <div className="flex-grow rounded-xl overflow-hidden relative z-0">
            <DeliveryMap driverLocation={driverLocation} />
          </div>
          
          <div className="p-4 flex items-center gap-3 text-gray-700 bg-emerald-50 rounded-xl mt-2 border border-emerald-100 z-10">
            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
              <Bike size={20} />
            </div>
            <p className="text-sm">
              The driver is near <b>Highland Park Avenue</b>. Live location updates every 3 seconds.
            </p>
          </div>
        </div>

        {/* Right Side: Info Panel (40%) */}
        <div className="w-full lg:w-2/5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            
            {/* ETA Card */}
            <div className={`bg-gradient-to-br ${currentStatus === 'Delivered' ? 'from-teal-600 to-emerald-700' : 'from-emerald-500 to-emerald-600'} text-white p-6 rounded-2xl text-center shadow-lg shadow-emerald-200 mb-8 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-5 rounded-full -ml-8 -mb-8 blur-xl"></div>
              <p className="text-emerald-50 font-medium text-sm">{currentStatus === 'Delivered' ? 'Status' : 'Estimated Delivery'}</p>
              <h1 className="text-5xl font-extrabold my-2 drop-shadow-sm tracking-tight font-sans">
                {currentStatus === 'Delivered' ? 'Delivered' : '12 Mins'}
              </h1>
              <p className="text-emerald-100 text-sm">{currentStatus === 'Delivered' ? 'Package arrived safely' : 'By 10:45 AM'}</p>
            </div>

            {/* Driver Profile */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border-2 border-white shadow-sm overflow-hidden">
                 <ion-icon name="person" style={{fontSize: '24px'}}></ion-icon>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-[17px] leading-tight mb-0.5">Vidya Shankar</h3>
                <p className="text-sm text-gray-500 font-medium">Delivery Partner • ⭐ 4.9</p>
              </div>
              <button className="ml-auto w-11 h-11 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100 transition shadow-sm">
                <Phone size={18} fill="currentColor" />
              </button>
            </div>

            {/* Timeline */}
            <div className="relative pl-4 space-y-7 mt-2">
              <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-100"></div>
              
              {/* Confirmed */}
              <div className="relative flex items-start gap-4">
                <div className="z-10 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white ring-4 ring-emerald-50">
                  <CheckCircle2 size={14} />
                </div>
                <div className="-mt-1">
                  <h4 className="font-semibold text-gray-800 text-[15px]">Order Confirmed</h4>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">Verified</p>
                </div>
              </div>

              {/* Packed */}
              <div className="relative flex items-start gap-4">
                <div className={`z-10 w-6 h-6 rounded-full shadow-sm flex items-center justify-center ${['Processing', 'Out for Delivery', 'Delivered'].includes(currentStatus) ? 'bg-emerald-500 border-2 border-white text-white ring-4 ring-emerald-50' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                  <CheckCircle2 size={14} />
                </div>
                <div className="-mt-1">
                  <h4 className={`font-semibold text-[15px] ${['Processing', 'Out for Delivery', 'Delivered'].includes(currentStatus) ? 'text-gray-800' : 'text-gray-400'}`}>Order Packed & Processing</h4>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">At Store</p>
                </div>
              </div>

              {/* Out for Delivery */}
              <div className="relative flex items-start gap-4">
                <div className={`z-10 w-6 h-6 rounded-full shadow-sm flex items-center justify-center relative ${currentStatus === 'Out for Delivery' ? 'bg-white border-[3px] border-emerald-500 text-emerald-500 ring-4 ring-emerald-50' : currentStatus === 'Delivered' ? 'bg-emerald-500 border-2 border-white text-white ring-4 ring-emerald-50' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                  {currentStatus === 'Out for Delivery' && <div className="absolute -inset-2 rounded-full border border-emerald-200 animate-ping opacity-20"></div>}
                  <Bike size={12} strokeWidth={currentStatus === 'Out for Delivery' ? 3 : 2} />
                </div>
                <div className="-mt-1">
                  <h4 className={`font-bold text-[15px] ${currentStatus === 'Out for Delivery' ? 'text-emerald-600' : currentStatus === 'Delivered' ? 'text-gray-800' : 'text-gray-400'}`}>Out for Delivery</h4>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">On the way</p>
                </div>
              </div>

              {/* Delivered */}
              <div className="relative flex items-start gap-4">
                <div className={`z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center ${currentStatus === 'Delivered' ? 'bg-emerald-500 border-white text-white ring-4 ring-emerald-50 shadow-sm' : 'bg-white border-gray-200 text-gray-400'}`}>
                  <Home size={12} strokeWidth={2} />
                </div>
                <div className="-mt-1">
                  <h4 className={`font-semibold text-[15px] ${currentStatus === 'Delivered' ? 'text-emerald-600' : 'text-gray-400'}`}>Delivered</h4>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">{currentStatus === 'Delivered' ? 'Completed' : 'Pending'}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
