type alertProps = {
  type: string;
  road: string;
  lastUpdated: string;
  color: string;
}

export default function Alert(items: alertProps) {
    if (items.color == "green")
    {
        return (
   <div className="bg-yellow-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-900" style={{ fontWeight: 600 }}>{items.type}</p>
                  <p className="text-green-700 text-sm mt-1">{items.road}</p>
                  <p className="text-green-600 text-xs mt-2">{items.lastUpdated}</p>
     </div>
  );
    }
    else if (items.color == "yellow")
    {
        return (
   <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-yellow-900" style={{ fontWeight: 600 }}>{items.type}</p>
                  <p className="text-yellow-700 text-sm mt-1">{items.road}</p>
                  <p className="text-yellow-600 text-xs mt-2">{items.lastUpdated}</p>
     </div>
  );
    }
    else if (items.color == "red")
    {
        return (
   <div className="bg-yellow-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-900" style={{ fontWeight: 600 }}>{items.type}</p>
                  <p className="text-red-700 text-sm mt-1">{items.road}</p>
                  <p className="text-red-600 text-xs mt-2">{items.lastUpdated}</p>
     </div>
  );
    }
}
