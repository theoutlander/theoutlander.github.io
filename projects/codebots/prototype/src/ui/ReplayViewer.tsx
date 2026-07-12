// src/ui/ReplayViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import type { BattleEvent } from "../sim/battle";
import type { Arena } from "../sim/types";
import { mountBattle, type MountedBattle } from "../view/mountBattle";
import type { BattleBotDef } from "../view/BattleScene";
import { Button } from "./components/Button";

/**
 * Replays an already-decided fight. Every WATCH button and the Hub's featured match slot point here
 * — the sim is deterministic, so "watch this pairing" is just "play this event log again," no live
 * battle involved.
 */
export function ReplayViewer({
  arena,
  bots,
  events,
  autoPlay = true,
  height = 220,
}: {
  arena: Arena;
  bots: BattleBotDef[];
  events: readonly BattleEvent[];
  autoPlay?: boolean;
  height?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const battle = useRef<MountedBattle | null>(null);
  const [done, setDone] = useState(false);

  const play = () => {
    const b = battle.current;
    if (!b) return;
    b.scene.reset();
    setDone(false);
    b.scene.play(events, { onDone: () => setDone(true) });
  };

  useEffect(() => {
    let cancelled = false;
    if (host.current) {
      mountBattle(host.current, arena, bots).then((m) => {
        if (cancelled) { m.destroy(); return; }
        battle.current = m;
        if (autoPlay) play();
      });
    }
    return () => { cancelled = true; battle.current?.destroy(); battle.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- events/bots/arena identity is stable per mounted replay
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div ref={host} style={{ height, borderRadius: 10, overflow: "hidden", position: "relative" }} />
      {done ? (
        <Button variant="quiet" size="sm" onClick={play} style={{ alignSelf: "flex-start" }}>
          ▶ REPLAY
        </Button>
      ) : null}
    </div>
  );
}
