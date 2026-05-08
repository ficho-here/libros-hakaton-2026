import { SolanaLogo } from "@/components/BrandLogos";

type VotingOrbitProps = {
  pollCount: number;
  totalVotes: number;
};

export default function VotingOrbit({ pollCount, totalVotes }: VotingOrbitProps) {
  return (
    <aside className="motion-panel motion-delay-1 vote-orbit-shell" aria-label="Voting network preview">
      <div className="vote-orbit-stage" aria-hidden="true">
        <div className="orbit-ring orbit-ring-one" />
        <div className="orbit-ring orbit-ring-two" />
        <div className="orbit-ring orbit-ring-three" />

        <div className="solana-coin-3d">
          <div className="solana-coin-face">
            <SolanaLogo className="solana-coin-mark" idPrefix="solanaOrbitLogo" />
          </div>
        </div>

        <div className="orbit-beam orbit-beam-one" />
        <div className="orbit-beam orbit-beam-two" />
      </div>

      <div className="orbit-stat orbit-stat-left">
        <span>Mock polls</span>
        <strong>{pollCount}</strong>
      </div>
      <div className="orbit-stat orbit-stat-right">
        <span>Demo votes</span>
        <strong>{totalVotes}</strong>
      </div>
      <div className="orbit-caption">
        <span>Devnet preview</span>
        <p>Local UI layer ready for Anchor data.</p>
      </div>
    </aside>
  );
}
