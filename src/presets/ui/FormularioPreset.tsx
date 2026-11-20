import React, { useState, useEffect, useRef } from "react";
import { PresetDto } from "../dominio/Preset";
import {
  NomePreset,
  MinutosFoco,
  MinutosPausaCurta,
  CiclosAntesPausaLonga,
  MinutosPausaLonga,
} from "../dominio/ValoresPreset";

export interface DadosFormularioPreset {
  readonly nome: string;
  readonly tempoFocoMin: number;
  readonly tempoPausaCurtaMin: number;
  readonly ciclosAntesPausaLonga: number;
  readonly tempoPausaLongaMin: number;
}

interface PropriedadesFormularioPreset {
  readonly aberto: boolean;
  readonly presetEdicao?: PresetDto | null;
  readonly onSalvar: (dados: DadosFormularioPreset) => void;
  readonly onCancelar: () => void;
}

export const FormularioPreset: React.FC<PropriedadesFormularioPreset> = ({
  aberto,
  presetEdicao,
  onSalvar,
  onCancelar,
}) => {
  const obterValorInicialNome = (): string => {
    if (presetEdicao) {
      return presetEdicao.nome;
    }
    return "";
  };

  const obterValorInicialTempoFoco = (): number => {
    if (presetEdicao) {
      return presetEdicao.tempoFocoMin;
    }
    return 25;
  };

  const obterValorInicialPausaCurta = (): number => {
    if (presetEdicao) {
      return presetEdicao.tempoPausaCurtaMin;
    }
    return 5;
  };

  const obterValorInicialCiclos = (): number => {
    if (presetEdicao) {
      return presetEdicao.ciclosAntesPausaLonga;
    }
    return 4;
  };

  const obterValorInicialPausaLonga = (): number => {
    if (presetEdicao) {
      return presetEdicao.tempoPausaLongaMin;
    }
    return 15;
  };

  const [nome, setNome] = useState(obterValorInicialNome);
  const [tempoFoco, setTempoFoco] = useState(obterValorInicialTempoFoco);
  const [pausaCurta, setPausaCurta] = useState(obterValorInicialPausaCurta);
  const [ciclos, setCiclos] = useState(obterValorInicialCiclos);
  const [pausaLonga, setPausaLonga] = useState(obterValorInicialPausaLonga);
  const [erros, setErros] = useState<Record<string, string>>({});
  const inputNomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aberto) {
      return;
    }
    const frameId = requestAnimationFrame(() => {
      inputNomeRef.current?.focus();
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
    if (presetEdicao) {
      setNome(presetEdicao.nome);
      setTempoFoco(presetEdicao.tempoFocoMin);
      setPausaCurta(presetEdicao.tempoPausaCurtaMin);
      setCiclos(presetEdicao.ciclosAntesPausaLonga);
      setPausaLonga(presetEdicao.tempoPausaLongaMin);
    }
    if (!presetEdicao) {
      setNome("");
      setTempoFoco(25);
      setPausaCurta(5);
      setCiclos(4);
      setPausaLonga(15);
    }
    setErros({});
  }, [aberto, presetEdicao]);

  if (!aberto) {
    return null;
  }

  const validarESubmeter = (evento: React.FormEvent) => {
    evento.preventDefault();
    const novosErros: Record<string, string> = {};

    const resNome = NomePreset.criar(nome);
    if (resNome.temFalha()) {
      novosErros.nome = resNome.obterErro();
    }

    const resFoco = MinutosFoco.criar(Number(tempoFoco));
    if (resFoco.temFalha()) {
      novosErros.tempoFocoMin = resFoco.obterErro();
    }

    const resPausaCurta = MinutosPausaCurta.criar(Number(pausaCurta));
    if (resPausaCurta.temFalha()) {
      novosErros.tempoPausaCurtaMin = resPausaCurta.obterErro();
    }

    const resCiclos = CiclosAntesPausaLonga.criar(Number(ciclos));
    if (resCiclos.temFalha()) {
      novosErros.ciclosAntesPausaLonga = resCiclos.obterErro();
    }

    const resPausaLonga = MinutosPausaLonga.criar(Number(pausaLonga));
    if (resPausaLonga.temFalha()) {
      novosErros.tempoPausaLongaMin = resPausaLonga.obterErro();
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    onSalvar({
      nome: resNome.obterValor().obterValor(),
      tempoFocoMin: resFoco.obterValor().obterValor(),
      tempoPausaCurtaMin: resPausaCurta.obterValor().obterValor(),
      ciclosAntesPausaLonga: resCiclos.obterValor().obterValor(),
      tempoPausaLongaMin: resPausaLonga.obterValor().obterValor(),
    });
  };

  let tituloModal = "Novo Temporizador";
  if (presetEdicao) {
    tituloModal = "Editar Temporizador";
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-preset"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
        <h2 id="titulo-modal-preset" className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {tituloModal}
        </h2>

        <form onSubmit={validarESubmeter} className="mt-4 space-y-4">
          <div>
            <label htmlFor="input-nome-preset" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nome do temporizador (1 a 40 caracteres)
            </label>
            <input
              ref={inputNomeRef}
              id="input-nome-preset"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              aria-invalid={Boolean(erros.nome)}
              aria-describedby={erros.nome ? "erro-nome-preset" : undefined}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ex: Estudo Intenso"
              required
            />
            {erros.nome && (
              <span id="erro-nome-preset" role="alert" className="mt-1 block text-xs font-medium text-rose-600 dark:text-rose-400">
                {erros.nome}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-tempo-foco" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tempo de foco (1 a 120 min)
              </label>
              <input
                id="input-tempo-foco"
                type="number"
                min="1"
                max="120"
                value={tempoFoco}
                onChange={(e) => setTempoFoco(Number(e.target.value))}
                aria-invalid={Boolean(erros.tempoFocoMin)}
                aria-describedby={erros.tempoFocoMin ? "erro-tempo-foco" : undefined}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              {erros.tempoFocoMin && (
                <span id="erro-tempo-foco" role="alert" className="mt-1 block text-xs font-medium text-rose-600 dark:text-rose-400">
                  {erros.tempoFocoMin}
                </span>
              )}
            </div>
            <div>
              <label htmlFor="input-pausa-curta" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tempo de pausa curta (1 a 60 min)
              </label>
              <input
                id="input-pausa-curta"
                type="number"
                min="1"
                max="60"
                value={pausaCurta}
                onChange={(e) => setPausaCurta(Number(e.target.value))}
                aria-invalid={Boolean(erros.tempoPausaCurtaMin)}
                aria-describedby={erros.tempoPausaCurtaMin ? "erro-pausa-curta" : undefined}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              {erros.tempoPausaCurtaMin && (
                <span id="erro-pausa-curta" role="alert" className="mt-1 block text-xs font-medium text-rose-600 dark:text-rose-400">
                  {erros.tempoPausaCurtaMin}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-ciclos" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Ciclos antes da pausa longa (1 a 12)
              </label>
              <input
                id="input-ciclos"
                type="number"
                min="1"
                max="12"
                value={ciclos}
                onChange={(e) => setCiclos(Number(e.target.value))}
                aria-invalid={Boolean(erros.ciclosAntesPausaLonga)}
                aria-describedby={erros.ciclosAntesPausaLonga ? "erro-ciclos" : undefined}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              {erros.ciclosAntesPausaLonga && (
                <span id="erro-ciclos" role="alert" className="mt-1 block text-xs font-medium text-rose-600 dark:text-rose-400">
                  {erros.ciclosAntesPausaLonga}
                </span>
              )}
            </div>
            <div>
              <label htmlFor="input-pausa-longa" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tempo de pausa longa (1 a 60 min)
              </label>
              <input
                id="input-pausa-longa"
                type="number"
                min="1"
                max="60"
                value={pausaLonga}
                onChange={(e) => setPausaLonga(Number(e.target.value))}
                aria-invalid={Boolean(erros.tempoPausaLongaMin)}
                aria-describedby={erros.tempoPausaLongaMin ? "erro-pausa-longa" : undefined}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              {erros.tempoPausaLongaMin && (
                <span id="erro-pausa-longa" role="alert" className="mt-1 block text-xs font-medium text-rose-600 dark:text-rose-400">
                  {erros.tempoPausaLongaMin}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancelar}
              aria-label="Cancelar edição"
              title="Cancelar e fechar formulário"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              aria-label="Salvar temporizador"
              title="Salvar alterações do temporizador"
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
