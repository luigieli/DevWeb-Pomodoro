import React, { useState, useEffect, useRef } from "react";
import { TarefaDto } from "../dominio/Tarefa";
import {
  TituloTarefa,
  EstadoTarefa,
  PrioridadeTarefa,
  TipoEstadoTarefa,
  TipoPrioridadeTarefa,
} from "../dominio/ValoresTarefa";

export interface DadosFormularioTarefa {
  readonly titulo: string;
  readonly estado: TipoEstadoTarefa;
  readonly prioridade: TipoPrioridadeTarefa;
}

interface PropriedadesFormularioTarefa {
  readonly aberto: boolean;
  readonly tarefaEdicao?: TarefaDto | null;
  readonly onSalvar: (dados: DadosFormularioTarefa) => void;
  readonly onCancelar: () => void;
}

export const FormularioTarefa: React.FC<PropriedadesFormularioTarefa> = ({
  aberto,
  tarefaEdicao,
  onSalvar,
  onCancelar,
}) => {
  const obterValorInicialTitulo = (): string => {
    if (tarefaEdicao) {
      return tarefaEdicao.titulo;
    }
    return "";
  };

  const obterValorInicialEstado = (): TipoEstadoTarefa => {
    if (tarefaEdicao) {
      return tarefaEdicao.estado;
    }
    return EstadoTarefa.padrao().obterValor();
  };

  const obterValorInicialPrioridade = (): TipoPrioridadeTarefa => {
    if (tarefaEdicao) {
      return tarefaEdicao.prioridade;
    }
    return PrioridadeTarefa.padrao().obterValor();
  };

  const [titulo, setTitulo] = useState(obterValorInicialTitulo);
  const [estado, setEstado] = useState<TipoEstadoTarefa>(obterValorInicialEstado);
  const [prioridade, setPrioridade] = useState<TipoPrioridadeTarefa>(obterValorInicialPrioridade);
  const [erros, setErros] = useState<Record<string, string>>({});
  const inputTituloRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aberto) {
      return;
    }
    const frameId = requestAnimationFrame(() => {
      inputTituloRef.current?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, [aberto]);

  useEffect(() => {
    if (!aberto) {
      return;
    }
    const lidarKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancelar();
      }
    };
    window.addEventListener("keydown", lidarKeyDown);
    return () => window.removeEventListener("keydown", lidarKeyDown);
  }, [aberto, onCancelar]);

  useEffect(() => {
    if (!aberto) {
      return;
    }
    let tituloInicial = "";
    if (tarefaEdicao) {
      tituloInicial = tarefaEdicao.titulo;
    }
    let estadoInicial = EstadoTarefa.padrao().obterValor();
    if (tarefaEdicao) {
      estadoInicial = tarefaEdicao.estado;
    }
    let prioridadeInicial = PrioridadeTarefa.padrao().obterValor();
    if (tarefaEdicao) {
      prioridadeInicial = tarefaEdicao.prioridade;
    }

    setTitulo(tituloInicial);
    setEstado(estadoInicial);
    setPrioridade(prioridadeInicial);
    setErros({});
  }, [aberto, tarefaEdicao]);

  if (!aberto) {
    return null;
  }

  const validarESubmeter = (evento: React.FormEvent) => {
    evento.preventDefault();
    const novosErros: Record<string, string> = {};

    const resTitulo = TituloTarefa.criar(titulo);
    if (resTitulo.temFalha()) {
      novosErros.titulo = resTitulo.obterErro();
    }

    const resEstado = EstadoTarefa.criar(estado);
    if (resEstado.temFalha()) {
      novosErros.estado = resEstado.obterErro();
    }

    const resPrioridade = PrioridadeTarefa.criar(prioridade);
    if (resPrioridade.temFalha()) {
      novosErros.prioridade = resPrioridade.obterErro();
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    onSalvar({
      titulo: resTitulo.obterValor().obterValor(),
      estado: resEstado.obterValor().obterValor(),
      prioridade: resPrioridade.obterValor().obterValor(),
    });
  };

  let tituloModal = "Nova Tarefa de Estudo";
  if (tarefaEdicao) {
    tituloModal = "Editar Tarefa";
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-tarefa"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
        <h2 id="titulo-modal-tarefa" className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {tituloModal}
        </h2>

        <form onSubmit={validarESubmeter} className="mt-4 space-y-4">
          <div>
            <label htmlFor="input-titulo-tarefa" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Título da tarefa (1 a 100 caracteres)
            </label>
            <input
              ref={inputTituloRef}
              id="input-titulo-tarefa"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              aria-invalid={Boolean(erros.titulo)}
              aria-describedby={erros.titulo ? "erro-titulo-tarefa" : undefined}
              placeholder="Ex: Ler capítulo 4 de Biologia"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
            {erros.titulo && (
              <span id="erro-titulo-tarefa" role="alert" className="mt-1 block text-xs font-medium text-rose-600 dark:text-rose-400">
                {erros.titulo}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="select-estado-tarefa" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Estado da tarefa
              </label>
              <select
                id="select-estado-tarefa"
                value={estado}
                onChange={(e) => setEstado(e.target.value as TipoEstadoTarefa)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="backlog">Backlog</option>
                <option value="aFazer">A fazer</option>
                <option value="emExecucao">Em execução</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label htmlFor="select-prioridade-tarefa" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Prioridade da tarefa
              </label>
              <select
                id="select-prioridade-tarefa"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as TipoPrioridadeTarefa)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancelar}
              aria-label="Cancelar criação ou edição de tarefa"
              title="Cancelar e fechar formulário"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              aria-label="Salvar tarefa"
              title="Salvar tarefa na lista"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
