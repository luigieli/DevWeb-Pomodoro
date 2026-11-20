import React from "react";
import { PresetDto } from "../dominio/Preset";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface PropriedadesListaPresetsView {
  readonly presets: readonly PresetDto[];
  readonly idPresetSelecionado: string | null;
  readonly idPresetSessaoAtiva: string | null;
  readonly onSelecionarPreset: (id: string) => void;
  readonly onNovoPreset: () => void;
  readonly onEditarPreset: (preset: PresetDto) => void;
  readonly onExcluirPreset: (preset: PresetDto) => void;
}

export const ListaPresetsView: React.FC<PropriedadesListaPresetsView> = ({
  presets,
  idPresetSelecionado,
  idPresetSessaoAtiva,
  onSelecionarPreset,
  onNovoPreset,
  onEditarPreset,
  onExcluirPreset,
}) => {
  return (
    <section aria-labelledby="titulo-presets" className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h2 id="titulo-presets" className="text-base font-bold text-slate-800 dark:text-slate-100">
            Temporizadores Personalizados (Presets)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personalize a duração de foco, pausas e quantidade de ciclos
          </p>
        </div>
        <button
          type="button"
          onClick={onNovoPreset}
          aria-label="+ Novo Temporizador personalizado"
          title="Adicionar uma nova configuração de tempos"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
        >
          <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Novo Temporizador</span>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((preset) => {
          const ehAtivo = preset.id === idPresetSelecionado;
          const emUsoPorSessao = preset.id === idPresetSessaoAtiva;
          let estiloBorda = "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-slate-600";
          if (ehAtivo) {
            estiloBorda = "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40";
          }
          let tituloAcaoEditar = "Editar";
          let tituloAcaoExcluir = "Excluir";
          if (emUsoPorSessao) {
            tituloAcaoEditar = "Em uso por sessão ativa (RN-01)";
            tituloAcaoExcluir = "Em uso por sessão ativa (RN-01)";
          }

          return (
            <div
              key={preset.id}
              className={`flex items-center gap-2 rounded-xl border p-2.5 transition ${estiloBorda}`}
            >
              <button
                type="button"
                onClick={() => onSelecionarPreset(preset.id)}
                aria-pressed={ehAtivo}
                aria-label={`Selecionar temporizador ${preset.nome}: ${preset.tempoFocoMin} minutos de foco, ${preset.tempoPausaCurtaMin} minutos de pausa curta`}
                title={`Ativar temporizador ${preset.nome}`}
                className="text-left rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {preset.nome}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  {preset.tempoFocoMin}m foco | {preset.tempoPausaCurtaMin}m pausa | {preset.ciclosAntesPausaLonga} ciclos | {preset.tempoPausaLongaMin}m longa
                </span>
              </button>

              <div className="ml-2 flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-slate-700">
                <button
                  type="button"
                  data-testid={`editar-${preset.id}`}
                  disabled={emUsoPorSessao}
                  aria-disabled={emUsoPorSessao}
                  aria-label={`Editar temporizador ${preset.nome}`}
                  onClick={() => onEditarPreset(preset)}
                  title={tituloAcaoEditar}
                  className="rounded p-1 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  data-testid={`excluir-${preset.id}`}
                  disabled={emUsoPorSessao}
                  aria-disabled={emUsoPorSessao}
                  aria-label={`Excluir temporizador ${preset.nome}`}
                  onClick={() => onExcluirPreset(preset)}
                  title={tituloAcaoExcluir}
                  className="rounded p-1 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
