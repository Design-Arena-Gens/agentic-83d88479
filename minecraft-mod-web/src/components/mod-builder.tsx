"use client";

import { FormEvent, useMemo, useState } from "react";
import { DEFAULT_EFFECT, EFFECT_OPTIONS } from "@/lib/effects";

type ConfigState = {
  modName: string;
  namespace: string;
  itemId: string;
  effectId: string;
  duration: number;
  amplifier: number;
  message: string;
};

const cyrillicMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const transliterate = (value: string) =>
  value
    .split("")
    .map((char) => {
      const lower = char.toLowerCase();
      const mapped = cyrillicMap[lower];
      if (!mapped) {
        return char;
      }
      return char === lower ? mapped : mapped.toUpperCase();
    })
    .join("");

const slugify = (value: string) =>
  transliterate(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "custom_mod";

const initialEffect = DEFAULT_EFFECT;

const initialState: ConfigState = {
  modName: "Амулет стремительности",
  namespace: slugify("Амулет стремительности"),
  itemId: "minecraft:emerald",
  effectId: initialEffect.id,
  duration: initialEffect.defaultDuration,
  amplifier: initialEffect.defaultAmplifier,
  message: "Новый артефакт активирован! Держи его в руке, чтобы получить бонус.",
};

export function ModBuilder() {
  const [config, setConfig] = useState<ConfigState>(initialState);
  const [namespaceDirty, setNamespaceDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedEffect =
    EFFECT_OPTIONS.find((option) => option.id === config.effectId) ??
    DEFAULT_EFFECT;

  const commandPreview = useMemo(
    () =>
      `execute as @a[nbt={SelectedItem:{id:"${config.itemId}"}}] run effect give @s ${config.effectId} ${config.duration} ${config.amplifier} true`,
    [config.itemId, config.effectId, config.duration, config.amplifier],
  );

  const datapackName = useMemo(
    () => `${config.namespace || "custom_mod"}-datapack.zip`,
    [config.namespace],
  );

  const handleModNameChange = (value: string) => {
    setConfig((prev) => {
      const nextNamespace = namespaceDirty ? prev.namespace : slugify(value);
      return {
        ...prev,
        modName: value,
        namespace: nextNamespace,
      };
    });
  };

  const handleEffectChange = (effectId: string) => {
    const effect = EFFECT_OPTIONS.find((option) => option.id === effectId);
    setConfig((prev) => ({
      ...prev,
      effectId,
      duration: effect?.defaultDuration ?? prev.duration,
      amplifier: effect?.defaultAmplifier ?? prev.amplifier,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/datapack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Не удалось собрать datapack. Попробуйте ещё раз.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = datapackName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("Архив готов! Скопируйте его в папку datapacks вашего мира.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Произошла неизвестная ошибка.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        className="space-y-6 rounded-3xl border border-lime-200/60 bg-white/80 p-8 shadow-lg shadow-lime-200/30 backdrop-blur-lg"
        onSubmit={handleSubmit}
      >
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-lime-600">
            Minecraft Datapack Builder
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900">
            Собери свой мод без Java
          </h1>
          <p className="text-sm text-zinc-600">
            Настройте предмет-артефакт, выберите эффект и скачайте готовый
            datapack для Java Edition 1.20+.
          </p>
        </header>

        <div className="space-y-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700">
              Название мода
            </span>
            <input
              required
              value={config.modName}
              onChange={(event) => handleModNameChange(event.target.value)}
              placeholder="Например, Амулет бури"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-base text-zinc-900 shadow-inner focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-200"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700">
              Namespace (техническое имя)
            </span>
            <input
              required
              value={config.namespace}
              onChange={(event) => {
                setNamespaceDirty(true);
                setConfig((prev) => ({
                  ...prev,
                  namespace: slugify(event.target.value),
                }));
              }}
              placeholder="amulete_speed"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-base text-zinc-900 shadow-inner focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-200"
            />
            <span className="text-xs text-zinc-500">
              Допустимы латинские буквы, цифры и подчёркивания.
            </span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700">
              Предмет-активатор
            </span>
            <input
              required
              value={config.itemId}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, itemId: event.target.value }))
              }
              placeholder="minecraft:emerald"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-base text-zinc-900 shadow-inner focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-200"
            />
            <span className="text-xs text-zinc-500">
              ID предмета в формате namespace:name.
            </span>
          </label>
        </div>

        <fieldset className="space-y-4 rounded-2xl border border-lime-300/60 bg-lime-50/70 p-4">
          <legend className="px-2 text-sm font-semibold uppercase tracking-[0.2em] text-lime-700">
            Эффект
          </legend>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700">
              Тип эффекта
            </span>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-base text-zinc-900 shadow-inner focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-200"
              value={config.effectId}
              onChange={(event) => handleEffectChange(event.target.value)}
            >
              {EFFECT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-700">
                Длительность (сек)
              </span>
              <input
                type="number"
                min={2}
                max={60}
                value={config.duration}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    duration: Number(event.target.value),
                  }))
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-base text-zinc-900 shadow-inner focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-200"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-700">
                Уровень усиления
              </span>
              <input
                type="number"
                min={0}
                max={4}
                value={config.amplifier}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    amplifier: Number(event.target.value),
                  }))
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-base text-zinc-900 shadow-inner focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-200"
              />
            </label>
          </div>

          <p className="rounded-xl bg-white/80 px-4 py-3 text-sm text-zinc-700 shadow-inner">
            {selectedEffect.description}
          </p>
        </fieldset>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">
            Сообщение при загрузке
          </span>
          <textarea
            rows={3}
            value={config.message}
            onChange={(event) =>
              setConfig((prev) => ({ ...prev, message: event.target.value }))
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-base text-zinc-900 shadow-inner focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-200"
          />
          <span className="text-xs text-zinc-500">
            Сообщение появится в чате при добавлении datapack в мир.
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Собираем..." : "Скачать datapack"}
        </button>

        {status && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {status}
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}
      </form>

      <aside className="flex h-fit flex-col gap-6 rounded-3xl border border-zinc-200 bg-zinc-950/90 p-8 text-zinc-50 shadow-xl shadow-zinc-900/40">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">
            {config.modName || "Новый мод"}
          </h2>
          <p className="text-sm text-zinc-300">
            Datapack добавляет артефакт, который выдаёт эффект{" "}
            <span className="font-semibold text-lime-200">
              {selectedEffect.label}
            </span>{" "}
            при удержании предмета{" "}
            <span className="font-semibold text-lime-200">
              {config.itemId || "minecraft:emerald"}
            </span>
            .
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Команда тик-функции
          </h3>
          <pre className="mt-2 overflow-x-auto rounded-2xl bg-zinc-900 px-4 py-3 text-xs text-lime-200">
{commandPreview}
          </pre>
        </div>

        <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Инструкция по установке
          </h3>
          <ol className="space-y-2 text-sm text-zinc-200">
            <li>1. Скачайте архив {datapackName}.</li>
            <li>
              2. Откройте папку мира → <span className="font-mono">datapacks</span>.
            </li>
            <li>3. Скопируйте архив, вернитесь в игру и примените datapack.</li>
            <li>4. Подберите выбранный предмет — эффект применится сразу.</li>
          </ol>
        </div>

        <div className="space-y-2 rounded-2xl border border-lime-500/40 bg-lime-500/10 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-300">
            Полезно знать
          </h3>
          <ul className="space-y-2 text-sm text-lime-100">
            <li>• Продолжительность в секундах перезапускается каждый тик.</li>
            <li>• Можно использовать любые предметы, включая модовые.</li>
            <li>• Datapack совместим с серверами и Realms.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
