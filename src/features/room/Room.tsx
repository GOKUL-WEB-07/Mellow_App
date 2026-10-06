import { Coffee, Leaf, Flame, Image, Lock, Check } from "lucide-react";
import { useStore } from "../../app/Store";
import { decorations } from "../../services/data";
import { RoomScene, SectionTitle } from "../../components/ui";
export default function Room() {
  const { room, saveRoom } = useStore();
  return (
    <>
      <div className="page-heading centered">
        <span className="small-label">A corner of the world, just for you</span>
        <h1>Make yourself at home.</h1>
        <p>Your space will slowly grow with you.</p>
      </div>
      <RoomScene large items={room.selectedItems} />
      <div className="room-caption">
        <Leaf size={17} /> No hurry. The nicest things take their time.
      </div>
      <SectionTitle
        title="Little things that find their way here"
        note="Collected through everyday moments"
      />
      <div className="decoration-grid">
        {decorations.map((d) => {
          const unlocked = room.unlockedItems.includes(d.id);
          const selected = room.selectedItems.includes(d.id);
          const Icon =
            d.id === "cup"
              ? Coffee
              : d.id === "plant"
                ? Leaf
                : d.id === "candle"
                  ? Flame
                  : Image;
          return (
            <article
              className={`decoration ${unlocked ? "unlocked" : ""}`}
              key={d.id}
            >
              <div className="decoration-art">
                <Icon size={42} />
              </div>
              <h3>{d.name}</h3>
              <p>
                {unlocked
                  ? "Something new found its way to your room."
                  : d.description}
              </p>
              <button
                className="secondary"
                disabled={!unlocked}
                aria-pressed={selected}
                onClick={() =>
                  saveRoom({
                    ...room,
                    selectedItems: selected
                      ? room.selectedItems.filter((i) => i !== d.id)
                      : [...room.selectedItems, d.id],
                  })
                }
              >
                {unlocked ? (
                  selected ? (
                    <>
                      <Check size={16} /> In your room
                    </>
                  ) : (
                    "Place in room"
                  )
                ) : (
                  <>
                    <Lock size={14} /> Will arrive in time
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
