'use client';

import { useRouter } from 'next/navigation';
import useSearchParamsDX from '../hooks/useSearchParamsDX';
import { MapPin, Bus, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useCallback } from 'react';

export default function SplashPage() {
  const router = useRouter();
  const [,setSearchParams] = useSearchParamsDX();
  const setModal = useCallback((modal: string) => setSearchParams({modal}), [setSearchParams]);
  
  const onLogin = useCallback(() => setModal("login"), [setModal]);
  const onSignUp = useCallback(() => setModal("register"), [setModal]);
  const onContinue = useCallback(() => router.push('/home'), [router]);
  
  return (
      <div className="min-h-screen relative overflow-hidden" style={{background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, black 100%)'}}>
      {/*css classes used within the component*/}
      <style href="splash-page" precedence="medium">{`
        .splash-button {
          width: 180px;
          height: 56px;
          font-size: 18px;
          font-weight: 600;
        }
        .splash-card {
          width: 180px;
          height: 120px;
          backgroundColor: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Arch image inside circular frame */}
      <div className="absolute top-20 left-32 w-64 h-64 rounded-full border-4 border-white overflow-hidden">
        <div className="relative w-full h-full">
          <Image src="/images/ArchPhoto.png" alt="Arch" fill className="object-cover" priority/>
        </div>
      </div>

      {/* G Photo image inside circular frame*/}
      <div className="absolute bottom-40 right-20 w-64 h-64 rounded-full border-4 border-white overflow-hidden">
        <div className="relative w-full h-full">
          <Image src="/images/GeorgiaG.jpg" alt="Georgia G" fill className="object-cover" priority/>
        </div>
      </div>
      
      {/* Decorative circle */}
      <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full border-4 border-white opacity-10" />

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-8">
        {/* Logo container */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center">
            <MapPin className="w-16 h-16 text-red-600" strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 shadow-lg" />
        </div>

        {/* Title */}
        <h1 className="text-white mb-4 text-center" style={{ fontSize: '60px', fontWeight: 700 }}>
          RedRoute
        </h1>

        {/* Subtitle */}
        <p className="text-red-400 mb-8 text-center" style={{ fontSize: '20px', fontWeight: 300 }}>
          Navigate Athens Like a Pro
        </p>

        {/* Description card */}
        <div className="max-w-xl w-full mb-12 p-8 text-center backdrop-blur-md rounded-2xl" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <p className="text-white" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            Real-time traffic analysis around UGA campus. Plan routes, avoid
            congestion, track buses, get alerts.
          </p>
        </div>

        {/* Feature cards */}
        <div className="flex gap-6 mb-12">
          <div className="splash-card backdrop-blur-md rounded-xl p-6 flex flex-col items-center justify-center">
            <MapPin className="w-8 h-8 text-white mb-3" />
            <p className="text-white text-center">Live Traffic</p>
          </div>

          <div className="splash-card backdrop-blur-md rounded-xl p-6 flex flex-col items-center justify-center">
            <Bus className="w-8 h-8 text-white mb-3" />
            <p className="text-white text-center">Bus Tracking</p>
          </div>

          <div className="splash-card backdrop-blur-md rounded-xl p-6 flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-white mb-3" />
            <p className="text-white text-center">Road Alerts</p>
          </div>
        </div>

        {/* Buttons side by side */}
        <div className="flex gap-4 mt-8">
          <button onClick={onLogin} className="splash-button bg-white text-red-600 rounded-full shadow-xl hover:scale-105 transition-all">
            Login
          </button>

          <button onClick={onSignUp} className="splash-button bg-white text-red-600 rounded-full shadow-xl hover:scale-105 transition-all">
            Sign Up
          </button>

          <button onClick={onContinue} className="splash-button bg-white text-red-600 rounded-full shadow-xl hover:scale-105 transition-all">
            Continue Without Login
          </button>
        </div>
      </div>
    </div>
  );
}