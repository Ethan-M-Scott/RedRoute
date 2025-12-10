import type { routeProps } from './route';
import Route from "./route";

type routeArrProps = {
  items: routeProps[]
  onDelete?: (id: string) => void;
}

export default function RouteArr({items, onDelete}: routeArrProps) {
  return (
<section>
        <div >
          {items.map(item => (
         <Route {...item} onDelete={onDelete}/>
        ))}
        </div>
   </section>
  );
}