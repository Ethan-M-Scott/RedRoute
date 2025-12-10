import {Edit2, Trash2} from 'lucide-react';
import { useState } from "react";

export type routeProps = {
  route: string;
  nextBus: string;
  type: string;
  onDelete?: (id: string) => void;
}



export default function Route(items: routeProps) {

    if (items.type == "basic")
    {
        return (
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p style={{ fontWeight: 600 }}>{items.route}</p>
                  <p className="text-gray-600 text-sm">Next bus: {items.nextBus}</p>
                </div>
        );
    }
    else{
        return (
              <div className="bg-gray-100 p-4 rounded-lg group hover:bg-gray-200 transition-colors relative">
                <p style={{ fontWeight: 600 }}>{items.route}</p>
                <p className="text-gray-600 text-sm">Next bus: {items.nextBus}</p>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => items.onDelete?.(items.route)}
                  className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
        );
    }
}