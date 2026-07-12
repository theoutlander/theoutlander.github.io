import React from "react";
import { exportBot, slugifyBotName } from "../export/toRealJs";
import { SDK_DECLARATION, SDK_FILENAME } from "../export/sdk";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";

/** Blob + anchor: the only way to hand a file to the kid without a server or a library. */
function downloadText(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // Chrome needs the object URL alive through the click; revoke on the next turn of the loop.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * EXPORT MY BOT — the payoff. Two files land in her Downloads folder: her program as a real ES
 * module, and the SDK's type declarations so an editor knows what her commands mean.
 *
 * Self-contained on purpose: hand it the code currently in the editor and the bot's name.
 */
export function ExportPanel({ source, botName }: { source: string; botName: string }) {
  const disabled = source.trim().length === 0;

  const onExport = () => {
    downloadText(`${slugifyBotName(botName)}.js`, exportBot(source, { botName }));
    downloadText(SDK_FILENAME, SDK_DECLARATION);
  };

  return (
    <Panel label="EXPORT MY BOT">
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", lineHeight: 1.5 }}>
        Download your program as real JavaScript — the same code, in a file that runs outside the
        game. You get <strong style={{ color: "var(--ink)" }}>{slugifyBotName(botName)}.js</strong>{" "}
        and <strong style={{ color: "var(--ink)" }}>{SDK_FILENAME}</strong>.
      </div>
      <Button variant="primary" size="sm" disabled={disabled} onClick={onExport} style={{ alignSelf: "flex-start" }}>
        EXPORT MY BOT
      </Button>
    </Panel>
  );
}
