import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function DeliveryTracking() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-9824X';

  return (
    <main className="main-content container">
      {/* Page-specific inline CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .tracking-container {
            max-width: 1000px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 30px;
            margin-top: 80px;
            width: 100%;
        }

        @media(max-width: 800px) {
            .tracking-container {
                grid-template-columns: 1fr;
            }
        }

        .map-card {
            background: var(--surface-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-sm);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(148, 163, 184, 0.12);
        }

        .map-mockup {
            height: 450px;
            background: #E2E8F0 linear-gradient(135deg, #e2e8f0 25%, #cbd5e1 25%, #cbd5e1 50%, #e2e8f0 50%, #e2e8f0 75%, #cbd5e1 75%, #cbd5e1 100%);
            background-size: 40px 40px;
            position: relative;
        }

        .map-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(2px);
        }

        /* Animated Delivery Marker */
        .delivery-marker {
            position: absolute;
            top: 40%;
            left: 30%;
            z-index: 10;
            animation: moveMarker 15s linear infinite alternate;
        }

        .delivery-icon {
            background: var(--primary-color);
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
        }

        .pulse {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            background: var(--primary-color);
            border-radius: 50%;
            z-index: -1;
            animation: radar 2s ease-out infinite;
        }

        @keyframes radar {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.6;
            }

            100% {
                transform: translate(-50%, -50%) scale(2.5);
                opacity: 0;
            }
        }

        @keyframes moveMarker {
            0% {
                top: 40%;
                left: 30%;
            }

            50% {
                top: 60%;
                left: 50%;
            }

            100% {
                top: 40%;
                left: 70%;
            }
        }

        .home-marker {
            position: absolute;
            top: 40%;
            left: 70%;
            z-index: 9;
        }

        .home-icon {
            background: #3B82F6;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
        }

        .info-card {
            background: var(--surface-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-sm);
            padding: 24px;
            border: 1px solid rgba(148, 163, 184, 0.12);
        }

        .eta-box {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 24px;
        }

        .eta-time {
            font-size: 32px;
            font-family: 'Outfit';
            font-weight: 700;
            margin: 5px 0;
        }

        .driver-info {
            display: flex;
            align-items: center;
            gap: 15px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 20px;
            text-align: left;
        }

        .driver-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--primary-color);
            padding: 2px;
        }

        .btn-call {
            background: #E0F2FE;
            color: #0284C7;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            border: none;
            cursor: pointer;
            margin-left: auto;
        }

        .timeline {
            position: relative;
            padding-left: 30px;
            text-align: left;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 11px;
            top: 5px;
            bottom: 5px;
            width: 2px;
            background: var(--border-color);
        }

        .timeline-item {
            position: relative;
            margin-bottom: 20px;
        }

        .timeline-item:last-child {
            margin-bottom: 0;
        }

        .timeline-dot {
            position: absolute;
            left: -30px;
            top: 2px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            background: white;
            border: 2px solid var(--border-color);
            color: var(--text-secondary);
        }

        .timeline-item.completed .timeline-dot {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
        }

        .timeline-item.active .timeline-dot {
            border-color: var(--primary-color);
            color: var(--primary-color);
            border-width: 3px;
        }

        .timeline-title {
            font-weight: 600;
            font-size: 15px;
        }

        .timeline-time {
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: 2px;
        }
      `}} />

      <h2 style={{ marginBottom: '20px', textAlign: 'left', marginTop: '20px' }}>
        Order Tracking{' '}
        <span style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 'normal' }}>
          #{orderId}
        </span>
      </h2>

      <div className="tracking-container fade-in">
        {/* Map Side */}
        <div className="map-card">
          <div className="map-mockup">
            <div className="map-overlay"></div>

            <div className="home-marker">
              <div className="home-icon">
                <ion-icon name="home"></ion-icon>
              </div>
              <div
                style={{
                  background: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginTop: '5px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Your Location
              </div>
            </div>

            <div className="delivery-marker">
              <div className="pulse"></div>
              <div className="delivery-icon">
                <ion-icon name="bicycle"></ion-icon>
              </div>
            </div>
          </div>
          <div style={{ padding: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', align: 'items-center', gap: '10px', color: 'var(--text-secondary)' }}>
              <ion-icon
                name="information-circle-outline"
                style={{ fontSize: '24px', color: 'var(--primary-color)' }}
              ></ion-icon>
              <p style={{ fontSize: '14px', margin: 0 }}>
                The driver is near <b>Highland Park Avenue</b>. Live location updates every 3 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Info Side */}
        <div>
          <div className="info-card">
            <div className="eta-box">
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Estimated Delivery</div>
              <div className="eta-time">12 Mins</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>By 10:45 AM</div>
            </div>

            <div className="driver-info">
              <div
                className="driver-avatar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#10B981',
                  color: 'white',
                  fontSize: '24px',
                  border: 'none'
                }}
              >
                <ion-icon name="person"></ion-icon>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', margin: 0 }}>Vidya shankar</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Delivery Partner • ⭐ 4.9
                </p>
              </div>
              <button className="btn-call">
                <ion-icon name="call"></ion-icon>
              </button>
            </div>

            <div className="timeline">
              <div className="timeline-item completed">
                <div className="timeline-dot">
                  <ion-icon name="checkmark"></ion-icon>
                </div>
                <div className="timeline-title">Order Confirmed</div>
                <div className="timeline-time">10:24 AM</div>
              </div>
              <div className="timeline-item completed">
                <div className="timeline-dot">
                  <ion-icon name="checkmark"></ion-icon>
                </div>
                <div className="timeline-title">Order Packed</div>
                <div className="timeline-time">10:28 AM</div>
              </div>
              <div className="timeline-item active">
                <div className="timeline-dot">
                  <ion-icon name="bicycle"></ion-icon>
                </div>
                <div className="timeline-title" style={{ color: 'var(--primary-color)' }}>
                  Out for Delivery
                </div>
                <div className="timeline-time">10:32 AM</div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-title" style={{ color: 'var(--text-secondary)' }}>
                  Delivered
                </div>
                <div className="timeline-time">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
