'use client'

import { useState } from 'react';

const tarotCards = [
  {
    "name": "The Fool",
    "image": "https://dummyimage.com/200x350",
    "reversedImage": "https://dummyimage.com/200x350?text=The+Fool+Reversed",
    "meaning": "A new beginning, taking a leap of faith, embracing the unknown.",
    "reversedMeaning": "Recklessness, risk-taking, lack of direction."
  },
  {
    "name": "The Magician",
    "image": "https://dummyimage.com/200x350",
    "reversedImage": "https://dummyimage.com/200x350?text=The+Magician+Reversed",
    "meaning": "Manifestation, resourcefulness, power, inspired action.",
    "reversedMeaning": "Manipulation, poor planning, untapped talents."
  },
  {
    "name": "The High Priestess",
    "image": "https://dummyimage.com/200x350",
    "reversedImage": "https://dummyimage.com/200x350?text=The+High+Priestess+Reversed",
    "meaning": "Intuition, subconscious mind, divine wisdom, mystery.",
    "reversedMeaning": "Hidden agendas, lack of intuition, secrets."
  },
  {
    "name": "The Empress",
    "image": "https://dummyimage.com/200x350",
    "reversedImage": "https://dummyimage.com/200x350?text=The+Empress+Reversed",
    "meaning": "Fertility, abundance, nurturing, creativity.",
    "reversedMeaning": "Dependence, smothering, lack of growth."
  },
  {
    "name": "The Emperor",
    "image": "https://dummyimage.com/200x350",
    "reversedImage": "https://dummyimage.com/200x350?text=The+Emperor+Reversed",
    "meaning": "Structure, stability, authority, leadership.",
    "reversedMeaning": "Tyranny, rigidity, lack of control."
  },
  {
    "name": "The Lovers",
    "image": "https://dummyimage.com/200x350",
    "reversedImage": "https://dummyimage.com/200x350?text=The+Lovers+Reversed",
    "meaning": "Love, harmony, relationships, choices.",
    "reversedMeaning": "Disharmony, imbalance, misalignment of values."
  },
  {
    "name": "The Chariot",
    "image": "https://dummyimage.com/200x350",
    "reversedImage": "https://dummyimage.com/200x350?text=The+Chariot+Reversed",
    "meaning": "Determination, control, willpower, success.",
    "reversedMeaning": "Lack of direction, aggression, no control."
  },
  {
    "name": "The Hermit",
    "image": "https://dummyimage.com/200x350",
    "reversedImage": "https://dummyimage.com/200x350?text=The+Hermit+Reversed",
    "meaning": "Introspection, solitude, inner guidance, wisdom.",
    "reversedMeaning": "Isolation, loneliness, withdrawal."
  },
  {
    "name": "Wheel of Fortune",
    "image": "https://dummyimage.com/200x350",
    "reversedImage": "https://dummyimage.com/200x350?text=Wheel+of+Fortune+Reversed",
    "meaning": "Fate, karma, life cycles, destiny, a turning point.",
    "reversedMeaning": "Bad luck, lack of control, resistance to change."
  },
  {
    "name": "The Sun",
    "image": "https://dummyimage.com/200x350",
    "reversedImage": "https://dummyimage.com/200x350?text=The+Sun+Reversed",
    "meaning": "Joy, success, positivity, vitality.",
    "reversedMeaning": "Negativity, depression, lack of success."
  }
];

export default function TarotReading() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [drawn, setDrawn] = useState(false);
  const [spreadType, setSpreadType] = useState('single');

  const shuffleDeck = () => {
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
    setShuffledDeck(shuffled);
    setSelectedCards([]);
    setDrawn(false);
  };

  const drawCard = () => {
    if (shuffledDeck.length > 0) {
      const cardsToDraw = spreadType === 'single' ? 1 : spreadType === 'three' ? 3 : 5;
      const newCards = shuffledDeck.slice(0, cardsToDraw).map(card => ({
        ...card,
        reversed: Math.random() < 0.5
      }));
      setSelectedCards(newCards);
      setDrawn(true);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Tarot Card Reading</h1>
      <button 
        onClick={shuffleDeck} 
        className="px-4 py-2 bg-blue-600 text-white rounded-md mb-4">
        Shuffle Deck
      </button>
      <div className="mb-4">
        <label className="mr-2">Select Spread:</label>
        <select 
          value={spreadType} 
          onChange={(e) => setSpreadType(e.target.value)}
          className="px-4 py-2 bg-gray-200 rounded-md">
          <option value="single">Single Card</option>
          <option value="three">Three Card Spread</option>
          <option value="five">Five Card Spread</option>
        </select>
      </div>
      <button 
        onClick={drawCard} 
        className="px-4 py-2 bg-green-600 text-white rounded-md mb-4" 
        disabled={drawn}>
        Draw Cards
      </button>
      <div className="flex flex-wrap justify-center">
        {selectedCards.map((card, index) => (
          <div key={index} className="m-4 text-center">
            <img 
              src={card.reversed ? card.reversedImage : card.image} 
              alt={card.name} 
              width={200} 
              height={350} 
              className="mb-2"
            />
            <h2 className="text-2xl font-semibold">{card.name}</h2>
            <p className="mt-2">{card.reversed ? card.reversedMeaning : card.meaning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}