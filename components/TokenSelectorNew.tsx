import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";

interface Card {
    id: string;
    suit: string;
    value: string;
    color: string;
    isSelected: boolean;
    selectedOrder?: number;
}

const initialCards: Card[] = [
    { id: "1", suit: "♠", value: "K", color: "black", isSelected: false },
    { id: "2", suit: "♥", value: "Q", color: "red", isSelected: false },
    { id: "3", suit: "♣", value: "3", color: "black", isSelected: false },
    { id: "4", suit: "♦", value: "A", color: "red", isSelected: false },
    { id: "5", suit: "♠", value: "J", color: "black", isSelected: false },
    { id: "6", suit: "♥", value: "10", color: "red", isSelected: false },
    { id: "7", suit: "♣", value: "9", color: "black", isSelected: false },
    { id: "8", suit: "♦", value: "8", color: "red", isSelected: false },
    { id: "9", suit: "♠", value: "7", color: "black", isSelected: false },
    { id: "10", suit: "♥", value: "6", color: "red", isSelected: false },
    { id: "11", suit: "♣", value: "5", color: "black", isSelected: false },
    { id: "12", suit: "♦", value: "4", color: "red", isSelected: false },
];

export function TokenSelectorNew() {
    const [cards, setCards] = useState<Card[]>(initialCards);
    const [selectedCount, setSelectedCount] = useState(0);

    // Scroll tracking for top container
    const [topCanScrollLeft, setTopCanScrollLeft] = useState(false);
    const [topCanScrollRight, setTopCanScrollRight] = useState(false);
    const topScrollRef = useRef<HTMLDivElement>(null);

    // Scroll tracking for bottom container  
    const [bottomCanScrollLeft, setBottomCanScrollLeft] = useState(false);
    const [bottomCanScrollRight, setBottomCanScrollRight] = useState(false);
    const bottomScrollRef = useRef<HTMLDivElement>(null);

    const checkScrollability = (element: HTMLDivElement, setCanScrollLeft: (val: boolean) => void, setCanScrollRight: (val: boolean) => void) => {
        if (!element) return;
        const { scrollLeft, scrollWidth, clientWidth } = element;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        const topElement = topScrollRef.current;
        const bottomElement = bottomScrollRef.current;

        if (topElement) {
            checkScrollability(topElement, setTopCanScrollLeft, setTopCanScrollRight);
        }
        if (bottomElement) {
            checkScrollability(bottomElement, setBottomCanScrollLeft, setBottomCanScrollRight);
        }
    }, [cards]);

    const handleTopScroll = () => {
        if (topScrollRef.current) {
            checkScrollability(topScrollRef.current, setTopCanScrollLeft, setTopCanScrollRight);
        }
    };

    const handleBottomScroll = () => {
        if (bottomScrollRef.current) {
            checkScrollability(bottomScrollRef.current, setBottomCanScrollLeft, setBottomCanScrollRight);
        }
    };

    const toggleCard = (cardId: string) => {
        setCards(prev => {
            const card = prev.find(c => c.id === cardId);
            if (!card) return prev;

            if (card.isSelected) {
                // Deselecting: remove selectedOrder and adjust others
                setSelectedCount(count => count - 1);
                return prev.map(c => ({
                    ...c,
                    isSelected: c.id === cardId ? false : c.isSelected,
                    selectedOrder: c.id === cardId ? undefined :
                        (c.selectedOrder && card.selectedOrder && c.selectedOrder > card.selectedOrder)
                            ? c.selectedOrder - 1 : c.selectedOrder
                }));
            } else {
                // Selecting: add selectedOrder
                setSelectedCount(count => count + 1);
                return prev.map(c =>
                    c.id === cardId
                        ? { ...c, isSelected: true, selectedOrder: selectedCount }
                        : c
                );
            }
        });
    };

    const selectedCards = cards.filter(card => card.isSelected).sort((a, b) => (a.selectedOrder || 0) - (b.selectedOrder || 0));
    const unselectedCards = cards.filter(card => !card.isSelected);

    const CardComponent = ({ card, isInBottomRow = false }: { card: Card, isInBottomRow?: boolean }) => (
        <div
            className={`
                relative w-20 h-32 bg-white rounded-xl border-2 border-gray-800 cursor-pointer
                transition-all duration-150 shadow-lg hover:shadow-xl
                ${isInBottomRow ? "translate-y-16 hover:translate-y-12" : ""}
                ${!isInBottomRow && "z-30"}
            `}
            onClick={() => isInBottomRow && toggleCard(card.id)}
        >
            {/* Card Content */}
            <div className="w-full h-full p-1 flex flex-col justify-between">
                {/* Top Left */}
                <div className={`text-xs font-bold ${card.color === 'red' ? 'text-red-600' : 'text-black'}`}>
                    <div>{card.value}</div>
                    <div>{card.suit}</div>
                </div>

                {/* Center */}
                <div className={`text-2xl font-bold text-center ${card.color === 'red' ? 'text-red-600' : 'text-black'}`}>
                    {card.suit}
                </div>

                {/* Bottom Right (rotated) */}
                <div className={`text-xs font-bold self-end transform rotate-180 ${card.color === 'red' ? 'text-red-600' : 'text-black'}`}>
                    <div>{card.value}</div>
                    <div>{card.suit}</div>
                </div>
            </div>

            {/* Selected Glow Effect */}
            {!isInBottomRow && (
                <div className="absolute inset-0 border-2 border-yellow-400 rounded-xl shadow-lg shadow-yellow-400/50"></div>
            )}
        </div>
    );

    return (
        <div className="relative text-[#FFD700] w-full h-full flex flex-col font-bold text-[1.2rem]">
            {/* <div className="absolute top-2 left-2 z-30">
                <Star className="h-4 w-4 casino-star" fill="currentColor" />
            </div>
            <div className="absolute top-2 right-2 z-30">
                <Star className="h-4 w-4 casino-star" fill="currentColor" />
            </div>
             */}
            {/* Selected Cards Row - Top */}
            <div className="relative h-1/2 w-full px-12 overflow-visible pt-12">
                {/* Left Chevron */}
                {topCanScrollLeft && (
                    <div className="absolute left-2 top-12 transform -translate-y-1/2 z-40 bg-black/50 rounded-full p-1">
                        <ChevronLeft className="h-4 w-4 text-white" />
                    </div>
                )}

                {/* Right Chevron */}
                {topCanScrollRight && (
                    <div className="absolute right-2 top-12 transform -translate-y-1/2 z-40 bg-black/50 rounded-full p-1">
                        <ChevronRight className="h-4 w-4 text-white" />
                    </div>
                )}

                <div
                    ref={topScrollRef}
                    onScroll={handleTopScroll}
                    className="absolute inset-x-0 -top-10
               h-full overflow-x-auto  z-20
               [scrollbar-width:none]"
                >
                    <div className="relative flex gap-2 px-4 min-w-max h-full items-start">
                        {selectedCards.map((card, index) => (
                            <div
                                key={`selected-${card.id}`}
                                style={{ zIndex: 20 - index }}
                                className="animate-in fade-in duration-300 group relative"
                            >
                                <CardComponent card={card} isInBottomRow={false} />
                                {/* Down chevron that appears on hover */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                                    <div
                                        className="bg-black/70 rounded-full p-1 cursor-pointer hover:bg-black/90 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCard(card.id);
                                        }}
                                    >
                                        <ChevronDownIcon className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Unselected Cards Row - Bottom */}
            <div className="relative h-1/2 w-full px-12">
                {/* Left Chevron */}
                {bottomCanScrollLeft && (
                    <div className="absolute left-2 bottom-4 transform -translate-y-1/2 z-40 bg-black/50 rounded-full p-1">
                        <ChevronLeft className="h-4 w-4 text-white" />
                    </div>
                )}

                {/* Right Chevron */}
                {bottomCanScrollRight && (
                    <div className="absolute right-2 bottom-4 transform -translate-y-1/2 z-40 bg-black/50 rounded-full p-1">
                        <ChevronRight className="h-4 w-4 text-white" />
                    </div>
                )}

                <div
                    ref={bottomScrollRef}
                    className="w-full h-full overflow-x-auto"
                    style={{ scrollbarWidth: 'none' }}
                    onScroll={handleBottomScroll}
                >
                    <div className="relative flex gap-2 px-4 min-w-max h-full items-end pb-4">
                        {unselectedCards.map((card, index) => (
                            <div
                                key={card.id}
                                style={{ zIndex: 10 - index }}
                            >
                                <CardComponent card={card} isInBottomRow={true} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom instruction text */}
            {/* <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-[#FFD700]/80 z-30">
                Click cards to select
            </div> */}
        </div>
    );
}
