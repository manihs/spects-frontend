'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

const TarotCardSpread = () => {
    const [cards, setCards] = useState(tarotCards);
    const [shuffled, setShuffled] = useState(false);
    const [spread, setSpread] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);
    const [showReading, setShowReading] = useState(false);

    useEffect(() => {
        if (shuffled) {
            setTimeout(() => setShuffled(false), 1000);
        }
    }, [shuffled]);

    const shuffleDeck = () => {
        let shuffledCards = [...cards];
        for (let i = shuffledCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
        }
        setCards(shuffledCards);
        setShuffled(true);
        setSpread(false);
        setSelectedCards([]);
        setShowReading(false);
    };

    const spreadCards = () => {
        setSpread(true);
    };

    const toggleSelectCard = (card) => {
        if (selectedCards.includes(card)) {
            setSelectedCards(selectedCards.filter(c => c !== card));
        } else if (selectedCards.length < 6) {
            setSelectedCards([...selectedCards, card]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[700px] bg-gray-900 text-white">
            <div className="relative w-[700px] h-[200px] flex items-center">
                {cards.map((card, index) => (
                    <motion.img
                        key={card.name}
                        src={card.image}
                        alt={card.name}
                        className="absolute w-[100px] h-[150px] rounded-lg shadow-lg cursor-pointer"
                        initial={{ x: 0, y: 0 }}
                        animate={{ x: shuffled ? index * 60 : spread ? index * 60 : 0, y: selectedCards.includes(card) ? -20 : 0 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => toggleSelectCard(card)}
                    />
                ))}
            </div>
            <div className="flex gap-4 mt-4">
                <button className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition" onClick={shuffleDeck}>Shuffle Deck</button>
                <button className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition" onClick={spreadCards}>Spread Cards</button>
            </div>
            {selectedCards.length === 6 && (
                <button className="mt-4 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition" onClick={() => setShowReading(true)}>Show Reading</button>
            )}
            {showReading && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-bold">Your Reading</h2>
                    {selectedCards.map(card => (
                        <div key={card.name} className="mt-2">
                            <p><strong>{card.name}</strong>: {card.meaning}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TarotCardSpread;
