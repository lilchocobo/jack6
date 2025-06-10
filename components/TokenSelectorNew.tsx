import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { formatAmountAbbreviated } from "@/utils/tokenUtils";
import { createTokenSelectors } from "@/utils/tokenManagement";

interface TokenCard {
    mint: string;
    amount: number;
    decimals: number;
    symbol: string;
    name: string;
    image: string;
    isSelected: boolean;
    selectedOrder?: number;
    selectedAmount?: number;
}

export function TokenSelectorNew() {
    const { authenticated, user } = usePrivy();
    const publicKey = user?.wallet?.address;
    const { tokens, loading, error } = useTokenBalances(publicKey);
    
    const [tokenCards, setTokenCards] = useState<TokenCard[]>([]);
    const [selectedTokens, setSelectedTokens] = useState<TokenCard[]>([]);
    const [selectedCount, setSelectedCount] = useState(0);

    // Convert tokens to token cards when data loads
    useEffect(() => {
        if (tokens && tokens.length > 0) {
            const cards: TokenCard[] = tokens.map(token => ({
                ...token,
                isSelected: false,
                selectedOrder: undefined,
                selectedAmount: token.amount * 0.5 // Default to 50%
            }));
            setTokenCards(cards);
        }
    }, [tokens]);

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
    }, [tokenCards]);

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

    const toggleToken = (mint: string) => {
        setTokenCards(prev => {
            const token = prev.find(t => t.mint === mint);
            if (!token) return prev;

            if (token.isSelected) {
                // Deselecting: remove from selectedTokens and adjust orders
                setSelectedCount(count => count - 1);
                setSelectedTokens(current => current.filter(t => t.mint !== mint));
                return prev.map(t => ({
                    ...t,
                    isSelected: t.mint === mint ? false : t.isSelected,
                    selectedOrder: t.mint === mint ? undefined :
                        (t.selectedOrder && token.selectedOrder && t.selectedOrder > token.selectedOrder)
                            ? t.selectedOrder - 1 : t.selectedOrder
                }));
            } else {
                // Selecting: add to selectedTokens
                setSelectedCount(count => count + 1);
                const updatedToken = { ...token, isSelected: true, selectedOrder: selectedCount };
                setSelectedTokens(current => [...current, updatedToken]);
                return prev.map(t =>
                    t.mint === mint
                        ? updatedToken
                        : t
                );
            }
        });
    };

    const selectedCards = tokenCards.filter(token => token.isSelected).sort((a, b) => (a.selectedOrder || 0) - (b.selectedOrder || 0));
    const unselectedCards = tokenCards.filter(token => !token.isSelected);

    const TokenCardComponent = ({ token, isInBottomRow = false }: { token: TokenCard, isInBottomRow?: boolean }) => (
        <div
            className={`
                relative w-20 h-32 bg-white rounded-xl border-2 border-gray-800 cursor-pointer
                transition-all duration-150 shadow-lg hover:shadow-xl
                ${isInBottomRow ? "translate-y-16 hover:translate-y-12" : ""}
                ${!isInBottomRow && "z-30"}
            `}
            onClick={() => isInBottomRow && toggleToken(token.mint)}
        >
            {/* Card Content */}
            <div className="w-full h-full p-1 flex flex-col justify-between">
                {/* Top Left - Token Image */}
                <div className="w-4 h-4 relative">
                    <Image
                        src={token.image}
                        alt={token.symbol}
                        fill
                        className="rounded-full object-cover"
                        onError={(e) =>
                            ((e.target as HTMLImageElement).src = "/solana-logo.png")
                        }
                    />
                </div>

                {/* Center - Token Symbol */}
                <div className="text-xs font-bold text-center text-black flex-1 flex items-center justify-center">
                    <div>
                        <div className="font-black">{token.symbol}</div>
                        <div className="text-[8px] font-semibold text-gray-600">
                            {formatAmountAbbreviated(
                                token.isSelected && token.selectedAmount !== undefined 
                                    ? token.selectedAmount 
                                    : token.amount, 
                                token.decimals
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Right (rotated) - Token Image */}
                <div className="w-4 h-4 relative self-end transform rotate-180">
                    <Image
                        src={token.image}
                        alt={token.symbol}
                        fill
                        className="rounded-full object-cover"
                        onError={(e) =>
                            ((e.target as HTMLImageElement).src = "/solana-logo.png")
                        }
                    />
                </div>
            </div>

            {/* Selected Glow Effect */}
            {!isInBottomRow && (
                <div className="absolute inset-0 border-2 border-yellow-400 rounded-xl shadow-lg shadow-yellow-400/50"></div>
            )}
        </div>
    );

    // Show loading state
    if (loading) {
        return (
            <div className="relative text-[#FFD700] w-full h-full flex flex-col font-bold text-[1.2rem] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD700] mx-auto"></div>
                    <div className="mt-2 text-sm">Loading tokens...</div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="relative text-[#FFD700] w-full h-full flex flex-col font-bold text-[1.2rem] items-center justify-center">
                <div className="text-center text-red-400">
                    <div className="text-sm">Error loading tokens:</div>
                    <div className="text-xs mt-1">{error}</div>
                </div>
            </div>
        );
    }

    // Show no tokens state
    if (!authenticated || !tokenCards.length) {
        return (
            <div className="relative text-[#FFD700] w-full h-full flex flex-col font-bold text-[1.2rem] items-center justify-center">
                <div className="text-center">
                    <div className="text-sm">
                        {!authenticated ? "Connect wallet to view tokens" : "No tokens found"}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative text-[#FFD700] w-full h-full flex flex-col font-bold text-[1.2rem]">
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
                        {selectedCards.map((token, index) => (
                            <div
                                key={`selected-${token.mint}`}
                                style={{ zIndex: 20 - index }}
                                className="animate-in fade-in duration-300 group relative"
                            >
                                <TokenCardComponent token={token} isInBottomRow={false} />
                                {/* Down chevron that appears on hover */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                                    <div
                                        className="bg-black/70 rounded-full p-1 cursor-pointer hover:bg-black/90 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleToken(token.mint);
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
                        {unselectedCards.map((token, index) => (
                            <div
                                key={token.mint}
                                style={{ zIndex: 10 - index }}
                            >
                                <TokenCardComponent token={token} isInBottomRow={true} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
