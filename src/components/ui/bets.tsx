import type { betItemProps } from "./betItem";
import BetItem from "./betItem";

type projectProps = {
  items: betItemProps[]
}

export default function Bets({items}: projectProps) {
  return (
<section>
        <div >
          {items.map((item) => (
            <BetItem {...item}></BetItem>
          ))}
        </div>
   </section>
  );
}