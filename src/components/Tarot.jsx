'use client'

import React, { useState, useEffect } from 'react';
import { RefreshCw, Fan, BookOpen } from 'lucide-react';

const tarotCards = [
  {
    "name": "The Fool",
    "image": "/api/placeholder/200/350?text=The+Fool",
    "meaning": "A new beginning, taking a leap of faith, embracing the unknown.",
    "reversedMeaning": "Recklessness, risk-taking, lack of direction.",
    "color": "bg-indigo-500"
  },
  {
    "name": "The Magician",
    "image": "/api/placeholder/200/350?text=The+Magician",
    "meaning": "Manifestation, resourcefulness, power, inspired action.",
    "reversedMeaning": "Manipulation, poor planning, untapped talents.",
    "color": "bg-red-500"
  },
  {
    "name": "The High Priestess",
    "image": "/api/placeholder/200/350?text=The+High+Priestess",
    "meaning": "Intuition, subconscious mind, divine wisdom, mystery.",
    "reversedMeaning": "Hidden agendas, lack of intuition, secrets.",
    "color": "bg-blue-600"
  },
  {
    "name": "The Empress",
    "image": "/api/placeholder/200/350?text=The+Empress",
    "meaning": "Fertility, abundance, nurturing, creativity.",
    "reversedMeaning": "Dependence, smothering, lack of growth.",
    "color": "bg-green-500"
  },
  {
    "name": "The Emperor",
    "image": "/api/placeholder/200/350?text=The+Emperor",
    "meaning": "Structure, stability, authority, leadership.",
    "reversedMeaning": "Tyranny, rigidity, lack of control.",
    "color": "bg-red-700"
  },
  {
    "name": "The Lovers",
    "image": "/api/placeholder/200/350?text=The+Lovers",
    "meaning": "Love, harmony, relationships, choices.",
    "reversedMeaning": "Disharmony, imbalance, misalignment of values.",
    "color": "bg-pink-500"
  },
  {
    "name": "The Chariot",
    "image": "/api/placeholder/200/350?text=The+Chariot",
    "meaning": "Determination, control, willpower, success.",
    "reversedMeaning": "Lack of direction, aggression, no control.",
    "color": "bg-amber-500"
  },
  {
    "name": "The Hermit",
    "image": "/api/placeholder/200/350?text=The+Hermit",
    "meaning": "Introspection, solitude, inner guidance, wisdom.",
    "reversedMeaning": "Isolation, loneliness, withdrawal.",
    "color": "bg-gray-600"
  },
  {
    "name": "Wheel of Fortune",
    "image": "/api/placeholder/200/350?text=Wheel+of+Fortune",
    "meaning": "Fate, karma, life cycles, destiny, a turning point.",
    "reversedMeaning": "Bad luck, lack of control, resistance to change.",
    "color": "bg-cyan-500"
  },
  {
    "name": "The Sun",
    "image": "/api/placeholder/200/350?text=The+Sun",
    "meaning": "Joy, success, positivity, vitality.",
    "reversedMeaning": "Negativity, depression, lack of success.",
    "color": "bg-yellow-500"
  }
];

// Card back design
const cardBackImage = "/api/placeholder/200/350?text=Tarot";

const TarotCardSpread = () => {
    // State management
    const [cards, setCards] = useState(tarotCards);
    const [spread, setSpread] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);
    const [showReading, setShowReading] = useState(false);
    const [isReversed, setIsReversed] = useState(Array(tarotCards.length).fill(false));
    const [isShuffling, setIsShuffling] = useState(false);
    const [cardsRevealed, setCardsRevealed] = useState(Array(tarotCards.length).fill(false));
    const [cardStates, setCardStates] = useState(
        cards.map((_, i) => ({ 
            x: 0, 
            y: 0, 
            rotate: 0,
            zIndex: i 
        }))
    );
    
    // Function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Shuffle using the specific logic provided
    const shuffleDeck = () => {
        if (isShuffling) return;
        
        setIsShuffling(true);
        setSpread(false);
        setSelectedCards([]);
        setShowReading(false);
        setCardsRevealed(Array(cards.length).fill(false));
        
        // Create a shuffled order of the cards
        let shuffledOrder = [...cards];
        shuffleArray(shuffledOrder);
        
        // First, scatter cards randomly
        const scatterStates = shuffledOrder.map((_, index) => {
            const randomOffsetX = Math.random() * 60;
            const randomOffsetY = 0;
            const randomRotate = (Math.random() - 0.5) * 10;
            
            return {
                x: randomOffsetX,
                y: randomOffsetY,
                rotate: randomRotate,
                zIndex: index
            };
        });
        
        setCardStates(scatterStates);
        
        // After scatter, re-align cards back into a stacked deck
        setTimeout(() => {
            const alignedStates = shuffledOrder.map((_, index) => {
                return {
                    x: 0,
                    y: 0,
                    rotate: 0,
                    zIndex: index
                };
            });
            
            setCardStates(alignedStates);
            
            // Update card order and set reversed states
            const newReversed = Array(cards.length).fill(false).map(() => Math.random() > 0.7);
            setIsReversed(newReversed);
            setCards(shuffledOrder);
            
            // Finish shuffling
            setTimeout(() => {
                setIsShuffling(false);
            }, 500);
        }, 700);
    };

    // Spread cards in a line
    const spreadCards = () => {
        if (isShuffling) return;
        
        setSpread(true);
        
        // Calculate card positions for spread
        const totalWidth = Math.min(800, window.innerWidth - 40);
        const cardWidth = 80;
        const spacing = (totalWidth - cardWidth) / (cards.length - 1);
        
        const spreadStates = cards.map((_, i) => ({
            x: (i * spacing) - (totalWidth / 2) + (cardWidth / 2),
            y: 0,
            rotate: isReversed[i] ? 180 : 0,
            zIndex: i
        }));
        
        setCardStates(spreadStates);
    };

    // Toggle card selection
    const toggleSelectCard = (card, index) => {
        if (isShuffling) return;
        
        const isSelected = selectedCards.includes(card);
        let newCardStates = [...cardStates];
        let newCardsRevealed = [...cardsRevealed];
        
        if (isSelected) {
            // Deselect card
            setSelectedCards(selectedCards.filter(c => c !== card));
            newCardStates[index] = {
                ...newCardStates[index],
                y: 0
            };
            newCardsRevealed[index] = false;
        } else if (selectedCards.length < 6) {
            // Select card and reveal it
            setSelectedCards([...selectedCards, card]);
            newCardStates[index] = {
                ...newCardStates[index],
                y: -30,
                zIndex: 100 + index
            };
            newCardsRevealed[index] = true;
        }
        
        setCardStates(newCardStates);
        setCardsRevealed(newCardsRevealed);
    };
    
    // Reset the reading
    const resetReading = () => {
        setSelectedCards([]);
        setShowReading(false);
        setCardsRevealed(Array(cards.length).fill(false));
        
        // Reset all cards to non-selected state
        const resetSelectionStates = cardStates.map(state => ({
            ...state,
            y: 0
        }));
        
        setCardStates(resetSelectionStates);
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-8 text-purple-300">Mystic Tarot Reading</h1>
            
            {/* Card Area */}
            <div className="relative w-full max-w-4xl h-64 mb-8">
                {cards.map((card, index) => {
                    const isSelected = selectedCards.includes(card);
                    const state = cardStates[index];
                    const isRevealed = cardsRevealed[index];
                    
                    return (
                        <div
                            key={card.name}
                            className={`absolute w-24 h-36 rounded-lg border-2 transition-all duration-500 ease-out cursor-pointer
                                       ${isSelected ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-gray-700'}`}
                            style={{
                                transform: `translate(${state.x}px, ${state.y}px) rotate(${state.rotate}deg)`,
                                top: '50%',
                                left: '50%',
                                marginLeft: '-40px',
                                marginTop: '-64px',
                                zIndex: state.zIndex,
                                overflow: 'hidden'
                            }}
                            onClick={() => toggleSelectCard(card, index)}
                        >
                            {isRevealed ? (
                                // Revealed card shows the actual tarot card
                                <div className={`w-full h-full ${card.color} flex items-center justify-center`}>
                                    <span className="text-xs font-medium text-center px-1 text-white" style={{
                                        transform: isReversed[index] && spread ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}>
                                        {card.name}
                                    </span>
                                </div>
                            ) : (
                                // Card back design for unrevealed cards
                                <div className="w-full h-full bg-purple-800 bg-opacity-90 flex items-center justify-center">
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-800 to-purple-900 flex items-center justify-center">
                                        <div className="w-12 h-12 border-2 border-yellow-500 rounded-full flex items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-yellow-500 rounded-full flex items-center justify-center">
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Control Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
                <button 
                    className={`px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition flex items-center gap-2 ${isShuffling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={shuffleDeck}
                    disabled={isShuffling}
                >
                    <RefreshCw className={isShuffling ? "animate-spin" : ""} size={18} />
                    Shuffle Deck
                </button>
                
                <button 
                    className={`px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition flex items-center gap-2 ${isShuffling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={spreadCards}
                    disabled={isShuffling}
                >
                    <Fan size={18} />
                    Spread Cards
                </button>
                
                {selectedCards.length > 0 && (
                    <button 
                        className={`px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg transition flex items-center gap-2 
                                   ${selectedCards.length < 3 || isShuffling ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => setShowReading(true)}
                        disabled={selectedCards.length < 3 || isShuffling}
                    >
                        <BookOpen size={18} />
                        {selectedCards.length >= 3 ? 'Show Reading' : `Need ${3 - selectedCards.length} More Cards`}
                    </button>
                )}
            </div>
            
            {/* Reading Results */}
            {showReading && (
                <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Your Tarot Reading</h2>
                        <button 
                            className="text-sm text-purple-400 hover:text-purple-300"
                            onClick={resetReading}
                        >
                            Reset
                        </button>
                    </div>
                    
                    <div className="space-y-8">
                        {selectedCards.map((card, idx) => {
                            const cardIndex = cards.findIndex(c => c.name === card.name);
                            const isCardReversed = cardIndex !== -1 ? isReversed[cardIndex] : false;
                            
                            return (
                                <div key={idx} className="p-4 bg-gray-900 rounded-lg flex flex-col md:flex-row gap-4">
                                    {/* Card Image */}
                                    <div className={`${card.color} rounded-lg w-32 h-48 flex-shrink-0 mx-auto md:mx-0 mb-4 md:mb-0`}>
                                        <div className="w-full h-full flex items-center justify-center p-2">
                                            <span className="text-white text-sm font-bold text-center" style={{
                                                transform: isCardReversed ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }}>
                                                {card.name}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Card Meaning */}
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-semibold flex items-center mb-2">
                                            {idx + 1}. {card.name} {isCardReversed ? '(Reversed)' : ''}
                                        </h3>
                                        <p className="text-gray-300">
                                            {isCardReversed ? card.reversedMeaning : card.meaning}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* Instructions */}
            <div className="mt-8 p-4 bg-gray-800 rounded-lg text-sm max-w-lg">
                <p className="font-semibold mb-2">How to use:</p>
                <ul className="space-y-1 pl-5 list-disc">
                    <li>Click "Shuffle Deck" to randomize the cards</li>
                    <li>Click "Spread Cards" to fan them out</li>
                    <li>Click on cards to select them (choose 3-6 cards)</li>
                    <li>Selected cards will reveal themselves</li> 
                    <li>Click "Show Reading" to see the interpretation</li>
                    <li>Click on a selected card again to deselect it</li>
                </ul>
            </div>
        </div>
    );
};

export default TarotCardSpread;