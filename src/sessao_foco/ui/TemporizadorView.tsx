import React, { useState } from "react";
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  ArrowPathIcon,
  StopIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { SessaoAtivaDto, TipoFaseSessao } from "../dominio/SessaoAtiva";
import { DialogoConfirmacao } from "../../compartilhado/ui/dialogos/DialogoConfirmacao";

interface PropriedadesTemporizadorView {
  readonly estadoMaquina: "ocioso" | "emExecucao" | "pausado" | "concluido";
  readonly sessao: SessaoAtivaDto | null;
  readonly tempoRestanteSegundos: number;
  readonly sessaoFoiRetomada?: boolean;
  readonly onIniciar: () => void;
  readonly onPersonalizarTempos?: () => void;
  readonly onPausar: () => void;
  readonly onRetomar: () => void;
  readonly onPularFase: () => void;
  readonly onReiniciarCiclos: () => void;
  readonly onEncerrar: () => void;
  readonly onDescartar: () => void;
}

const ROTULOS_FASE: Record<TipoFaseSessao, string> = {
  foco: "Foco",
  pausaCurta: "Pausa Curta",
  pausaLonga: "Pausa Longa",
};

const CORES_FASE: Record<TipoFaseSessao, string> = {
  foco: "bg-rose-100 text-rose-800 border-rose-300",
  pausaCurta: "bg-emerald-100 text-emerald-800 border-emerald-300",
  pausaLonga: "bg-teal-100 text-teal-800 border-teal-300",
};

export const TemporizadorView: React.FC<PropriedadesTemporizadorView> = ({
  estadoMaquina,
  sessao,
  tempoRestanteSegundos,
  sessaoFoiRetomada = false,
  onIniciar,
  onPersonalizarTempos,
  onPausar,
  onRetomar,
  onPularFase,
  onReiniciarCiclos,
  onEncerrar,
  onDescartar,
}) => {
  const [modalAberto, setModalAberto] = useState<"encerrar" | "reiniciar" | "descartar" | null>(null);

  const minutos = Math.floor(Math.max(0, tempoRestanteSegundos) / 60);
  const segundos = Math.max(0, tempoRestanteSegundos) % 60;
  const textoMinutos = String(minutos).padStart(2, "0");
  const textoSegundos = String(segundos).padStart(2, "0");
  const textoFormatado = `${textoMinutos}:${textoSegundos}`;

  let faseAtual: TipoFaseSessao = "foco";
  let totalCiclos = 4;
  let cicloAtual = 1;
  if (sessao) {
    faseAtual = sessao.faseAtual;
    totalCiclos = sessao.snapshotPreset.ciclosAntesPausaLonga;
    cicloAtual = sessao.cicloAtual;
  }

  return (
    <section
      aria-label="Temporizador Pomodoro"
      className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 shadow-sm text-center dark:bg-slate-900 dark:border dark:border-slate-800"
    >
      {sessaoFoiRetomada && estadoMaquina !== "ocioso" && (
        <div
          role="status"
          className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 w-full max-w-md"
        >
          <span>Sessão restaurada da sua última visita.</span>
          <button
            type="button"
            onClick={() => setModalAberto("descartar")}
            className="inline-flex items-center gap-1 font-bold underline hover:text-amber-950 dark:hover:text-amber-100"
          >
            <TrashIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Descartar
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${CORES_FASE[faseAtual]}`}
        >
          Fase: {ROTULOS_FASE[faseAtual]}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Ciclo {cicloAtual} de {totalCiclos}
        </span>
      </div>

      <div
        role="timer"
        aria-live="polite"
        className="my-8 font-mono tabular-nums text-7xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 sm:text-8xl"
      >
        {textoFormatado}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {estadoMaquina === "ocioso" && (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onIniciar}
              aria-label="Iniciar sessão de foco"
              title="Iniciar cronômetro para o ciclo atual"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-3 text-base font-bold text-white shadow-md hover:bg-indigo-700 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
            >
              <PlayIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Iniciar Sessão
            </button>
            {onPersonalizarTempos && (
              <button
                type="button"
                onClick={onPersonalizarTempos}
                aria-label="Personalizar tempos e ciclos do temporizador atual"
                title="Editar duração das fases de foco e pausas"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline transition dark:text-slate-400 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1"
              >
                <PencilSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Personalizar tempos
              </button>
            )}
          </div>
        )}

        {estadoMaquina === "emExecucao" && (
          <>
            <button
              type="button"
              onClick={onPausar}
              aria-label="Pausar cronômetro"
              title="Pausa temporariamente o tempo restante"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-amber-600 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500"
            >
              <PauseIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Pausar
            </button>
            <button
              type="button"
              onClick={onPularFase}
              aria-label="Pular Fase (avançar para o próximo ciclo)"
              title="Avança imediatamente para a próxima fase"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
            >
              <ForwardIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Pular Fase
            </button>
            <button
              type="button"
              onClick={() => setModalAberto("reiniciar")}
              aria-label="Reiniciar contagem de ciclos"
              title="Zera os ciclos concluídos mantendo o temporizador"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Reiniciar Ciclos
            </button>
            <button
              type="button"
              onClick={() => setModalAberto("encerrar")}
              aria-label="Encerrar sessão de estudo"
              title="Finaliza a sessão atual e retorna ao estado inicial"
              className="inline-flex items-center justify-center rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500"
            >
              <StopIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Encerrar
            </button>
            {sessaoFoiRetomada && (
              <button
                type="button"
                onClick={() => setModalAberto("descartar")}
                aria-label="Descartar sessão restaurada"
                title="Descarta a sessão recuperada da visita anterior"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-500 hover:bg-slate-100 transition dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
              >
                <TrashIcon className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                Descartar
              </button>
            )}
          </>
        )}

        {estadoMaquina === "pausado" && (
          <>
            <button
              type="button"
              onClick={onRetomar}
              aria-label="Retomar cronômetro"
              title="Retoma a contagem do tempo"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-700 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500"
            >
              <PlayIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Retomar
            </button>
            <button
              type="button"
              onClick={onPularFase}
              aria-label="Pular Fase (avançar para o próximo ciclo)"
              title="Avança imediatamente para a próxima fase"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
            >
              <ForwardIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Pular Fase
            </button>
            <button
              type="button"
              onClick={() => setModalAberto("reiniciar")}
              aria-label="Reiniciar contagem de ciclos"
              title="Zera os ciclos concluídos mantendo o temporizador"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Reiniciar Ciclos
            </button>
            <button
              type="button"
              onClick={() => setModalAberto("encerrar")}
              aria-label="Encerrar sessão de estudo"
              title="Finaliza a sessão atual e retorna ao estado inicial"
              className="inline-flex items-center justify-center rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500"
            >
              <StopIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Encerrar
            </button>
            <button
              type="button"
              onClick={() => setModalAberto("descartar")}
              aria-label="Descartar sessão restaurada"
              title="Descarta a sessão recuperada da visita anterior"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-500 hover:bg-slate-100 transition dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
            >
              <TrashIcon className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Descartar
            </button>
          </>
        )}

        {estadoMaquina === "concluido" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-lg font-bold text-emerald-600">
              Sessão Concluída com Sucesso! Parabéns pelo foco.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onEncerrar}
                aria-label="Iniciar nova sessão de estudo"
                title="Começar um novo ciclo de estudo"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-700 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
              >
                <PlayIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Nova Sessão
              </button>
              {sessaoFoiRetomada && (
                <button
                  type="button"
                  onClick={() => setModalAberto("descartar")}
                  aria-label="Descartar sessão restaurada"
                  title="Descarta a sessão recuperada da visita anterior"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-500 hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
                >
                  <TrashIcon className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                  Descartar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <DialogoConfirmacao
        aberto={modalAberto === "encerrar"}
        titulo="Encerrar Sessão de Foco?"
        mensagem="Tem certeza que deseja finalizar a sessão em andamento? O progresso da fase atual será perdido."
        textoConfirmar="Sim, Encerrar"
        onConfirmar={() => {
          setModalAberto(null);
          onEncerrar();
        }}
        onCancelar={() => setModalAberto(null)}
      />

      <DialogoConfirmacao
        aberto={modalAberto === "reiniciar"}
        titulo="Reiniciar Ciclos de Estudo?"
        mensagem="Deseja zerar a contagem e voltar ao primeiro ciclo de foco?"
        textoConfirmar="Sim, Reiniciar"
        onConfirmar={() => {
          setModalAberto(null);
          onReiniciarCiclos();
        }}
        onCancelar={() => setModalAberto(null)}
      />

      <DialogoConfirmacao
        aberto={modalAberto === "descartar"}
        titulo="Descartar Sessão Retomada?"
        mensagem="Tem certeza que deseja descartar esta sessão sem contabilizar progresso?"
        textoConfirmar="Sim, Descartar"
        onConfirmar={() => {
          setModalAberto(null);
          onDescartar();
        }}
        onCancelar={() => setModalAberto(null)}
      />
    </section>
  );
};
