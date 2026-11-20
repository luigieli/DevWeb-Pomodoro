import React from "react";
import { TarefaDto } from "../dominio/Tarefa";
import { TipoEstadoTarefa, TipoPrioridadeTarefa } from "../dominio/ValoresTarefa";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface PropriedadesPainelTarefasView {
  readonly tarefas: readonly TarefaDto[];
  readonly onNovaTarefa: () => void;
  readonly onEditarTarefa: (tarefa: TarefaDto) => void;
  readonly onExcluirTarefa: (tarefa: TarefaDto) => void;
}

const ROTULOS_ESTADO: Record<TipoEstadoTarefa, string> = {
  backlog: "Backlog",
  aFazer: "A fazer",
  emExecucao: "Em execução",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const CORES_ESTADO: Record<TipoEstadoTarefa, string> = {
  backlog: "bg-slate-100 text-slate-700",
  aFazer: "bg-blue-100 text-blue-700",
  emExecucao: "bg-amber-100 text-amber-700",
  concluida: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-rose-100 text-rose-700",
};

const ROTULOS_PRIORIDADE: Record<TipoPrioridadeTarefa, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const CORES_PRIORIDADE: Record<TipoPrioridadeTarefa, string> = {
  alta: "text-rose-600 border-rose-300 bg-rose-50",
  media: "text-amber-600 border-amber-300 bg-amber-50",
  baixa: "text-slate-600 border-slate-300 bg-slate-50",
};

export const PainelTarefasView: React.FC<PropriedadesPainelTarefasView> = ({
  tarefas,
  onNovaTarefa,
  onEditarTarefa,
  onExcluirTarefa,
}) => {
  return (
    <aside
      aria-labelledby="titulo-painel-tarefas"
      className="flex flex-col rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h2 id="titulo-painel-tarefas" className="text-base font-bold text-slate-800 dark:text-slate-100">
            Tarefas de Estudo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ordenação automática por prioridade e estado
          </p>
        </div>
        <button
          type="button"
          onClick={onNovaTarefa}
          aria-label="+ Adicionar nova tarefa de estudo"
          title="Criar nova tarefa para a lista"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
        >
          <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Adicionar</span>
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {tarefas.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
            Nenhuma tarefa cadastrada. Adicione sua primeira tarefa!
          </p>
        )}

        {tarefas.map((tarefa) => (
          <div
            key={tarefa.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/80"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {tarefa.titulo}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span
                  aria-label={`Estado: ${ROTULOS_ESTADO[tarefa.estado]}`}
                  className={`rounded-md px-2 py-0.5 font-medium ${CORES_ESTADO[tarefa.estado]}`}
                >
                  {ROTULOS_ESTADO[tarefa.estado]}
                </span>
                <span
                  aria-label={`Prioridade: ${ROTULOS_PRIORIDADE[tarefa.prioridade]}`}
                  className={`rounded-md border px-1.5 py-0.5 font-medium ${CORES_PRIORIDADE[tarefa.prioridade]}`}
                >
                  {ROTULOS_PRIORIDADE[tarefa.prioridade]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                data-testid={`editar-${tarefa.id}`}
                aria-label={`Editar tarefa: ${tarefa.titulo}`}
                onClick={() => onEditarTarefa(tarefa)}
                title="Editar Tarefa"
                className="rounded p-1 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                data-testid={`excluir-${tarefa.id}`}
                aria-label={`Excluir tarefa: ${tarefa.titulo}`}
                onClick={() => onExcluirTarefa(tarefa)}
                title="Excluir Tarefa"
                className="rounded p-1 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
