'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TarotCardSpread = () => {
    const [cards, setCards] = useState([...Array(10).keys()].map(n => n + 1));
    const [shuffled, setShuffled] = useState(false);
    const [spread, setSpread] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="relative w-[700px] h-[200px] flex items-center">
                {cards.map((card, index) => (
                    <motion.div
                        key={card}
                        className={`absolute w-[100px] h-[150px] bg-yellow-500 rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg cursor-pointer ${selectedCards.includes(card) ? 'shadow-white' : ''}`}
                        initial={{ x: 0, y: 0, rotate: 0 }}
                        animate={{
                            x: shuffled ? index * 60 : spread ? index * 60 : 0,
                            y: selectedCards.includes(card) ? -20 : 0,
                            rotate: 0,
                        }}
                        transition={{ duration: 0.5 }}
                        onClick={() => toggleSelectCard(card)}
                    >
                        {card}
                    </motion.div>
                ))}
            </div>
            <div className="flex gap-4 mt-4">
                <button className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition" onClick={shuffleDeck}>Shuffle Deck</button>
                <button className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition" onClick={spreadCards}>Spread Cards</button>
            </div>
        </div>
    );
};

export default TarotCardSpread;
