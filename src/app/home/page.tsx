"use client";
import useSearchParamsDX from '@/src/hooks/useSearchParamsDX';
import { useCallback } from 'react';
import { useEffect, useState } from "react";
import { MapPin, Bus, Info } from "lucide-react";

type ApiRoute = {
  id: string;
  name: string;
  shortName?: string | null;
  serviceTime?: string | null;
  activeVehicles: number;
  status: string;
};

type NearbyResponse = {
  routes?: ApiRoute[];
};

export default function HomePage() {
  // state variables
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // button event handlers
  const [,setSearchParams] = useSearchParamsDX();
  const setModal = (modal: string) => setSearchParams({modal});
  const onLogin = useCallback(() => setModal("login"), [setModal]);
  const onSignUp = useCallback(() => setModal("register"), [setModal]);

  // Load all routes once from our Next API (which talks to Passio)
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/routes/nearby");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: NearbyResponse = await res.json();
        setRoutes(data.routes || []);
      } catch (err) {
        console.error("Failed to load routes for non-auth view:", err);
        setError("Unable to load route information right now.");
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 h-20 shadow-lg flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-white" />
          <span
            className="text-white"
            style={{ fontSize: "24px", fontWeight: 700 }}
          >
            RedRoute
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onLogin}
            className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ fontWeight: 600 }}
          >
            Login
          </button>
          <button
            onClick={onSignUp}
            className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 transition-colors"
            style={{ fontWeight: 600 }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="p-8">
        <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Map section - 2 columns */}
          <div className="col-span-2 space-y-6">
            {/* Map card */}
            <div
              className="bg-white rounded-xl shadow-lg p-6"
              style={{ height: "600px" }}
            >
              <div
                className="w-full h-full rounded-lg flex flex-col items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)",
                }}
              >
                <iframe className="w-full h-full rounded-lg flex flex-col items-center justify-center" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3309.9456374959514!2d
                -83.37366874877299!3d33.94252628646278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1
                s0x88f6136038fba6bf%3A0xdf849d68bb40ef74!2sUniversity%20of%20Georgia!5e0!3m2!1sen!2sus!4
                v1763832363302!5m2!1sen!2sus&iwloc=near" width="800" height="800" 
                style={{border:0}} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </div>
            
            {/* Real-time traffic alerts section was previously removed */}
          </div>

          {/* Right column: Bus Routes (live from Passio) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bus className="w-5 h-5 text-red-600" />
                <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
                  Bus Routes
                </h2>
              </div>

              {loading && (
                <p className="text-gray-600 text-sm mb-2">
                  Loading route information…
                </p>
              )}

              {error && !loading && (
                <p className="text-red-600 text-sm mb-2">{error}</p>
              )}

              {!loading && !error && routes.length === 0 && (
                <p className="text-gray-600 text-sm mb-2">
                  No route information is available at the moment.
                </p>
              )}

              {!loading && !error && routes.length > 0 && (
                <div className="space-y-3 mb-4">
                  {routes.map((route) => {
                    const label = route.shortName
                      ? `${route.name} (${route.shortName})`
                      : route.name;

                    return (
                      <div
                        key={route.id}
                        className="bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <p className="font-semibold">{label}</p>
                        <p className="text-gray-600 text-sm">
                          {route.status}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Active buses: {route.activeVehicles}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 text-sm">
                  Want to save stops and get personalized alerts? Sign up for a
                  free account to track the stops you use most.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
