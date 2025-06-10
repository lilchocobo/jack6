import { EnterRound } from "./EnterRound";
import { Header } from "./Header";
import JackpotDonutChart from "./JackpotDonutChart";
// import { TokenSelector } from "./TokenSelector";

export function DebugBox() {
    return (
        <div className="bg-[#222] text-[#FFD700] w-full h-full border-2 border-[#FFD700] rounded-lg box-border flex items-center justify-center font-bold text-[1.2rem]">
            Debug Box (fills space below chart)
        </div>
    );
}

export function CenterColumn({
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
        <div className="md:col-span-2 w-full max-w-full min-w-0 h-full min-h-0 flex flex-col">
            <Header />
            <div className="w-full h-[340px] md:h-[420px] min-h-0 border-2 border-yellow-500 bg-[#FF69B4]">
                {/* <DebugBox /> */}
                <JackpotDonutChart
                    deposits={currentRoundDeposits}
                    totalAmount={total}
                    simulateData={true}
                    onDepositsChange={setCurrentRoundDeposits}
                />
            </div>
            {/* <div className="flex-shrink-0" style={{ background: "pink" }}>
          <EnterRound 
            selectedTokens={selectedTokens}
            onSelectedTokensChange={setSelectedTokens}
          />
        </div> */}
            <div className="flex-1 min-h-0" style={{ background: "pink", zIndex: 2 }}>
                <DebugBox />
            </div>
        </div>
    );
}