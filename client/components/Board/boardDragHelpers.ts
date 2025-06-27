import { arrayMove } from '@dnd-kit/sortable';
import { UniqueIdentifier } from '@dnd-kit/core';
import { Card as CardType, List as ListType } from '@/types';
import { cardsApi } from '@/lib/api';

// **** Calcula a que lista y posición se va a mover la tarjeta ****
export function getTargetListAndOrder(
  over: { id: UniqueIdentifier },
  cards: CardType[],
  lists: ListType[],
  activeCard: CardType
): { targetListId: string | null; targetOrder: number | null } {
  const isOverList = lists.some(list => list.id === over.id);
  const isOverCard = cards.some(card => card.id === over.id);
  let targetListId: string | null = null;
  let targetOrder: number | null = null;
  if (isOverList) {
    targetListId = over.id as string;
    const targetListCards = cards.filter(card => card.listId === targetListId).sort((a, b) => a.order - b.order);
    targetOrder = targetListCards.length;
  } else if (isOverCard) {
    const overCard = cards.find(card => card.id === over.id);
    if (!overCard) return { targetListId: null, targetOrder: null };
    targetListId = overCard.listId;
    const targetListCards = cards.filter(card => card.listId === targetListId).sort((a, b) => a.order - b.order);
    const targetIndex = targetListCards.findIndex(card => card.id === over.id);
    targetOrder = targetIndex;
  }
  return { targetListId, targetOrder };
}

// **** Devuelve el array de tarjetas que deben actualizarse (orden y lista) tras el drag ****
export function getCardsToUpdate(
  activeCard: CardType,
  targetListId: string,
  targetOrder: number,
  cards: CardType[],
  lists: ListType[],
  over: { id: UniqueIdentifier }
): Array<{ id: string; order: number; listId: string }> {
  const isSameList = activeCard.listId === targetListId;
  let cardsToUpdate: Array<{ id: string; order: number; listId: string }> = [];
  if (isSameList) {
    const listCards = cards.filter(card => card.listId === activeCard.listId).sort((a, b) => a.order - b.order);
    const oldIndex = listCards.findIndex(card => card.id === activeCard.id);
    const newIndex = listCards.some(card => card.id === over.id) ? listCards.findIndex(card => card.id === over.id) : targetOrder;
    const reorderedCards = arrayMove(listCards, oldIndex, newIndex);
    cardsToUpdate = reorderedCards.map((card, index) => ({ id: card.id, order: index, listId: card.listId }))
      .filter(update => {
        const originalCard = listCards.find(c => c.id === update.id);
        return originalCard && originalCard.order !== update.order;
      });
  } else {
    const sourceListCards = cards.filter(card => card.listId === activeCard.listId).sort((a, b) => a.order - b.order);
    const targetListCards = cards.filter(card => card.listId === targetListId).sort((a, b) => a.order - b.order);
    const targetIndex = targetOrder;
    const updatedSourceCards = sourceListCards.filter(card => card.id !== activeCard.id);
    const updatedTargetCards = [...targetListCards];
    updatedTargetCards.splice(targetIndex, 0, activeCard);
    const sourceUpdates = updatedSourceCards.map((card, index) => ({ id: card.id, order: index, listId: card.listId }));
    const targetUpdates = updatedTargetCards.map((card, index) => ({ id: card.id, order: index, listId: card.listId }));
    cardsToUpdate = [
      { id: activeCard.id, order: targetIndex, listId: targetListId },
      ...sourceUpdates.filter(update => {
        const originalCard = sourceListCards.find(c => c.id === update.id);
        return originalCard && originalCard.order !== update.order;
      }),
      ...targetUpdates.filter(update => {
        const originalCard = targetListCards.find(c => c.id === update.id);
        return originalCard && originalCard.order !== update.order;
      })
    ];
  }
  return cardsToUpdate;
}

// **** Aplica el nuevo orden localmente en el estado de tarjetas ****
export function applyLocalCardOrder(
  active: { id: UniqueIdentifier },
  over: { id: UniqueIdentifier },
  cards: CardType[],
  setCards: (cards: CardType[]) => void
) {
  const oldIndex = cards.findIndex(card => card.id === active.id);
  const newIndex = cards.findIndex(card => card.id === over.id);
  const newCards = arrayMove(cards, oldIndex, newIndex);
  setCards(newCards);
}

// **** Envia los cambios de orden/lista en la base de datos  ****
export async function persistCardOrder(cardsToUpdate: Array<{ id: string; order: number; listId: string }>) {
  const updatePromises = cardsToUpdate.map(async (cardUpdate) => {
    return await cardsApi.update(cardUpdate.id, {
      order: cardUpdate.order,
      listId: cardUpdate.listId,
    });
  });
  await Promise.all(updatePromises);
} 