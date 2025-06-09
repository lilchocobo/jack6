'use client';

import JackpotDonutChart from "@/components/JackpotDonutChart";
import { ChatSection } from "@/components/ChatSection";
import { FloatingTokens } from "@/components/FloatingTokens";
import { SunburstBackground } from "@/components/SunburstBackground";
import { TokenSelector } from "@/components/TokenSelector";
import { LeftColumn } from "@/components/LeftColumn";
import { RightColumn } from "@/components/RightColumn";
import { EnterRound } from "@/components/EnterRound";
import { ThirdRow } from "@/components/ThirdRow";
import { LogoutButton } from "@/components/LogoutButton";
import { chatMessages } from "@/lib/mock-data";
import { useState } from "react";
import { Header } from "@/components/Header";

interface Deposit {
  id: string;
  user: string;
  token: string;
  amount: number;
  timestamp: Date;
}

interface TokenRow {
  mint: string;
  amount: number;
  decimals: number;
  symbol: string;
  name: string;
  image: string;
  selected?: boolean;
  selectedAmount?: number;
}

function CenterColumn({
  currentRoundDeposits,
  setCurrentRoundDeposits,
  total,
  selectedTokens,
  setSelectedTokens,
  delayedExpandToken,
  handleClearDelayedExpand
}: {
  currentRoundDeposits: any,
  setCurrentRoundDeposits: any,
  total: any,
  selectedTokens: any,
  setSelectedTokens: any,
  delayedExpandToken?: any,
  handleClearDelayedExpand?: any
}) {
  return (
    <div className="md:col-span-2 w-full max-w-full min-w-0 h-full flex flex-col gap-2 bg-[#000000]">
      <Header />
      {/* Donut Chart - Takes up remaining space */}
      <div className="flex-1 min-h-0 border-2 border-yellow-500 bg-[#000000]">
        <JackpotDonutChart
          deposits={currentRoundDeposits}
          totalAmount={total}
          simulateData={true}
          onDepositsChange={setCurrentRoundDeposits}
        />
      </div>
      {/* Enter Round Button - always below Donut Chart */}
      <div className="flex-shrink-0 z-10">
        <EnterRound 
          selectedTokens={selectedTokens}
          onSelectedTokensChange={setSelectedTokens}
        />
      </div>
      {/* Token Selector - always at the bottom */}
      <div className="flex-shrink-0">
        <TokenSelector 
          selectedTokens={selectedTokens}
          onSelectedTokensChange={setSelectedTokens}
          delayedExpandToken={delayedExpandToken}
          onClearDelayedExpand={handleClearDelayedExpand}
        />
      </div>
    </div>
  );
}

export default function Home() {
  // State for current round deposits - shared between donut chart and deposits table
  const [currentRoundDeposits, setCurrentRoundDeposits] = useState<Deposit[]>([]);
  
  // State for selected tokens (for the TokenSelector component)
  const [selectedTokens, setSelectedTokens] = useState<TokenRow[]>([]);
  
  // State for which token should auto-expand (delayed)
  const [delayedExpandToken, setDelayedExpandToken] = useState<string | null>(null);
  
  // Calculate total from current round deposits
  const total = currentRoundDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  const handleTokenSelect = (token: TokenRow) => {
    const alreadySelected = selectedTokens.find(t => t.mint === token.mint);
    if (alreadySelected) return; // Already selected
    
    const newToken = { ...token, selectedAmount: token.amount * 0.5 }; // Default 50%
    
    // Add to the TOP of the list (beginning of array) - CLOSED initially
    setSelectedTokens([newToken, ...selectedTokens]);
    
    // After a small delay, auto-expand the newly added token
    setTimeout(() => {
      setDelayedExpandToken(newToken.mint);
    }, 300); // Give time for the token to render first
  };

  const handleRemoveToken = (mint: string) => {
    setSelectedTokens(selectedTokens.filter(t => t.mint !== mint));
    
    // Clear delayed expand if removing the token that was about to expand
    if (delayedExpandToken === mint) {
      setDelayedExpandToken(null);
    }
  };

  const handleUpdateAmount = (mint: string, amount: number) => {
    setSelectedTokens(selectedTokens.map(t => 
      t.mint === mint ? { ...t, selectedAmount: amount } : t
    ));
  };

  const handleClearDelayedExpand = () => {
    setDelayedExpandToken(null);
  };

  return (
    <main className="h-screen w-screen relative overflow-hidden">
      {/* Grid Background */}
      <SunburstBackground /> 

      <FloatingTokens />

      {/* Fixed Logout Button */}
      {/* <LogoutButton /> */}

      <div className="w-full h-full grid grid-rows-[1fr_auto] gap-1 p-2">
        {/* Main Content Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 w-full h-full min-h-0">
          {/* Left Column - Total Deposits, Current Round, Past Winners */}
          <div className="md:col-span-1 h-full">
            <LeftColumn 
              deposits={currentRoundDeposits}
              onDepositsChange={setCurrentRoundDeposits}
            />
          </div>
          
          {/* Center Column - Donut Chart + Enter Round + Token Selector */}
          <CenterColumn
            currentRoundDeposits={currentRoundDeposits}
            setCurrentRoundDeposits={setCurrentRoundDeposits}
            total={total}
            selectedTokens={selectedTokens}
            setSelectedTokens={setSelectedTokens}
            delayedExpandToken={delayedExpandToken}
            handleClearDelayedExpand={handleClearDelayedExpand}
          />
          
          {/* Right Column - Largest Win + Chat + Logo */}
          <div className="md:col-span-1 w-full max-w-full min-w-0 overflow-hidden h-full flex flex-col">
            <RightColumn messages={chatMessages} />
          </div>
        </div>

        {/* Bottom Row - Just wallet connect for non-authenticated users */}
        <ThirdRow />
      </div>
    </main>
  );
}