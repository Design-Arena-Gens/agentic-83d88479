import { ModBuilder } from "@/components/mod-builder";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-lime-100 via-emerald-50 to-sky-100 py-16">
      <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-center">
        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-lime-300 to-emerald-400 opacity-40 blur-3xl" />
      </div>
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 sm:px-10 lg:px-12">
        <ModBuilder />
        <footer className="text-center text-xs text-zinc-500">
          Создано для быстрого прототипирования Minecraft datapack модов.
          Совместимо с Java Edition 1.20+.
        </footer>
      </main>
    </div>
  );
}
