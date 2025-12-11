import { NextRequest, NextResponse } from "next/server";
import { buildDataPack, ModConfig } from "@/lib/datapack";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<ModConfig>;

  const modName = (payload.modName ?? "Agentic Artifact").trim();
  const namespace = (payload.namespace ?? modName).trim();
  const itemId = (payload.itemId ?? "minecraft:emerald").trim();
  const effectId = (payload.effectId ?? "minecraft:speed").trim();
  const duration = Number(payload.duration ?? 10);
  const amplifier = Number(payload.amplifier ?? 1);
  const message = payload.message?.toString().slice(0, 120);

  const archive = await buildDataPack({
    modName,
    namespace,
    itemId,
    effectId,
    duration,
    amplifier,
    message,
  });

  const fileName = `${namespace
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-") || "datapack"}.zip`;

  const byteArray = new Uint8Array(archive);
  const blob = new Blob([byteArray.buffer], { type: "application/zip" });

  return new NextResponse(blob.stream(), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
