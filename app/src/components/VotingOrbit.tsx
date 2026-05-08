import { SolanaLogo } from "@/components/BrandLogos";

type VotingOrbitProps = {
  pollCount: number;
  totalVotes: number;
};

export default function VotingOrbit({ pollCount, totalVotes }: VotingOrbitProps) {
  const coinSlabs = Array.from({ length: 8 }, (_, index) => index);

  return (
    <aside className="motion-panel motion-delay-1 vote-orbit-shell" aria-label="Voting network">
      <div className="vote-orbit-stage" aria-hidden="true">
        <div className="orbit-ring orbit-ring-one" />
        <div className="orbit-ring orbit-ring-two" />
        <div className="orbit-ring orbit-ring-three" />

        <div className="solana-coin-3d">
          <div className="solana-coin-shell">
            {coinSlabs.map((slab) => (
              <span key={slab} className="solana-coin-slab" />
            ))}
            <div className="solana-coin-face solana-coin-back" />
            <div className="solana-coin-face solana-coin-front">
              <SolanaLogo className="solana-coin-mark" idPrefix="solanaOrbitLogo" />
            </div>
          </div>
        </div>

        <div className="orbit-beam orbit-beam-one" />
        <div className="orbit-beam orbit-beam-two" />
      </div>

      <div className="orbit-stat orbit-stat-left">
        <span>Polls</span>
        <strong>{pollCount}</strong>
      </div>
      <div className="orbit-stat orbit-stat-right">
        <span>Votes</span>
        <strong>{totalVotes}</strong>
      </div>
    </aside>
  );
}
