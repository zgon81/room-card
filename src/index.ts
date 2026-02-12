import "./room-card";

console.info(
  "%c ROOM-CARD %c v0.1.0 ",
  "background:#222;color:#fff;padding:4px 8px;",
  "background:#4caf50;color:#fff;padding:4px 8px;"
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "room-card",
  name: "Adam Room Card",
  description: "Room overview card",
});