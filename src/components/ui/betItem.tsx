export type betItemProps = {
  route: string;
  yourBet: number;
  timeForReveal: number;
  points: number;
  actualTime: number;
}

export default function BetItem(items: betItemProps) {
    if (items.timeForReveal != 0)
    {
        return (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 p-4 rounded-lg">
                  <p style={{ fontWeight: 600 }}>{items.route}</p>
                  <p className="text-sm mt-1">Your bet: {items.yourBet} min</p>
                  <p className="text-sm text-orange-700 mt-2">{items.timeForReveal}
                     min until reveal • {items.points} pts</p>
                </div>
        );
    }
    else{
        if (items.actualTime == items.yourBet)
        {
        return (
                <div className="bg-gradient-to-r from-green-100 
                to-green-200 border border-green-300 p-4 rounded-lg">
                  <p style={{ fontWeight: 600 }}>{items.route}</p>
                  <p className="text-green-700 text-sm mt-1">Won! +{items.points} pts</p>
                </div>
        );
        }
        else{
         return (
                <div className="bg-gradient-to-r from-red-100 to-red
                -200 border border-red-300 p-4 rounded-lg">
                  <p style={{ fontWeight: 600 }}>{items.route}</p>
                  <p className="text-red-700 text-sm mt-1">Lost! -{items.points} pts</p>
                </div>
        );
        }
    }
}