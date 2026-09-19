import { useEffect, useRef } from 'react';
import type { Character } from '../game/character/character';
import { ITEMS, type ItemId, type WeaponDefinition } from '../game/items/items';
import { getCarriedItemWeight, getCarryCapacity } from '../game/inventory/inventory';

interface InventoryScreenProps {
  character: Character;
  onEquip: (id: ItemId) => void;
  onUnequip: (id: ItemId) => void;
  onClose: () => void;
}

export function InventoryScreen({ character, onEquip, onUnequip, onClose }: InventoryScreenProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialogRef.current?.showModal(); }, []);
  const weight = getCarriedItemWeight(character);
  const itemList = (ids: readonly ItemId[], equipped: boolean) => ids.length === 0
    ? <p>{equipped ? 'No weapon equipped. Equip a weapon before fighting.' : 'Your backpack is empty.'}</p>
    : <ul className="inventory-list">{ids.map((id, index) => {
      const item: WeaponDefinition = ITEMS[id];
      return <li key={`${id}-${index}`}><div><strong>{item.name}</strong>
        <p>{item.damageMin}–{item.damageMax} damage · {item.weightKg === undefined ? 'Weight undefined' : `${item.weightKg} kg`}</p></div>
        <button disabled={!equipped && character.equipment.length > 0} onClick={() => (equipped ? onUnequip : onEquip)(id)}>
          {equipped ? 'Unequip' : 'Equip'}
        </button></li>;
    })}</ul>;
  return <dialog ref={dialogRef} className="journal-screen" aria-labelledby="inventory-title" onClose={onClose}>
    <header><h2 id="inventory-title">Inventory</h2><button autoFocus onClick={onClose}>Close Inventory</button></header>
    <p className="inventory-capacity">Capacity: <strong>{getCarryCapacity(character.strength)} kg</strong> (Strength × 5)</p>
    <p>Carried items: {weight === null ? 'weight not yet defined' : `${weight} kg`} · Gold: {character.gold}</p>
    <p className="muted">Starting load is provisionally unencumbered. Item and gold weights await definition.</p>
    <h3>Equipped weapon</h3>{itemList(character.equipment, true)}
    <h3>Backpack</h3>{itemList(character.backpack, false)}
  </dialog>;
}
