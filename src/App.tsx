import React, { useState, useEffect, useMemo } from "react";
import { useMachine } from "@xstate/react";
import { ArmazenamentoLocal } from "./compartilhado/infraestrutura/persistencia/ArmazenamentoLocal";
import { EmissorAlertaSonoro } from "./compartilhado/infraestrutura/audio/EmissorAlertaSonoro";
import { DialogoConfirmacao } from "./compartilhado/ui/dialogos/DialogoConfirmacao";
import { TimestampMs } from "./compartilhado/dominio/TimestampMs";
import { IdentificadorId } from "./compartilhado/dominio/IdentificadorId";

import { RepositorioPresets } from "./presets/persistencia/RepositorioPresets";
import { Preset, PresetDto } from "./presets/dominio/Preset";
import { ListaPresets } from "./presets/dominio/ListaPresets";
import {
  NomePreset,
  MinutosFoco,
  MinutosPausaCurta,
  CiclosAntesPausaLonga,
  MinutosPausaLonga,
} from "./presets/dominio/ValoresPreset";
import { ListaPresetsView } from "./presets/ui/ListaPresetsView";
import { FormularioPreset, DadosFormularioPreset } from "./presets/ui/FormularioPreset";

import { RepositorioTarefas } from "./tarefas/persistencia/RepositorioTarefas";
import { Tarefa, TarefaDto } from "./tarefas/dominio/Tarefa";
import { ListaTarefas } from "./tarefas/dominio/ListaTarefas";
import {
  TituloTarefa,
  EstadoTarefa,
  PrioridadeTarefa,
} from "./tarefas/dominio/ValoresTarefa";
import { PainelTarefasView } from "./tarefas/ui/PainelTarefasView";
import { FormularioTarefa, DadosFormularioTarefa } from "./tarefas/ui/FormularioTarefa";

import { RepositorioSessaoAtiva } from "./sessao_foco/persistencia/RepositorioSessaoAtiva";
import { maquinaSessaoFoco } from "./sessao_foco/maquina/maquinaSessaoFoco";
import { TemporizadorView } from "./sessao_foco/ui/TemporizadorView";
import { SessaoAtivaDto } from "./sessao_foco/dominio/SessaoAtiva";
import { SunIcon, MoonIcon, EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type TipoTema = "light" | "dark" | "high-contrast";

export const App: React.FC = () => {
  const armazenamento = useMemo(() => new ArmazenamentoLocal(), []);
  const emissorAudio = useMemo(() => new EmissorAlertaSonoro(), []);
  const repositorioPresets = useMemo(() => new RepositorioPresets(armazenamento), [armazenamento]);
  const repositorioTarefas = useMemo(() => new RepositorioTarefas(armazenamento), [armazenamento]);
  const repositorioSessao = useMemo(() => new RepositorioSessaoAtiva(armazenamento), [armazenamento]);

  // Presets State
  const [listaPresets, setListaPresets] = useState<ListaPresets>(() => repositorioPresets.carregar());
  const [idPresetSelecionado, setIdPresetSelecionado] = useState<string>(() => {
    const primeiro = listaPresets.paraArray()[0];
    if (primeiro) {
      return primeiro.obterId().obterValor();
    }
    return "";
  });
  const [modalPresetAberto, setModalPresetAberto] = useState(false);
  const [presetEmEdicao, setPresetEmEdicao] = useState<PresetDto | null>(null);
  const [presetParaExcluir, setPresetParaExcluir] = useState<PresetDto | null>(null);

  // Tarefas State
  const [listaTarefas, setListaTarefas] = useState<ListaTarefas>(() => repositorioTarefas.carregar());
  const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<TarefaDto | null>(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<TarefaDto | null>(null);

  // Máquina XState fornecida com ação de áudio
  const [estadoMaquina, send] = useMachine(
    maquinaSessaoFoco.provide({
      actions: {
        tocarAlertaSonoro: () => {
          emissorAudio.tocarAlertaFimDeFase();
        },
      },
    })
  );

  // Sessão Retomada (RF-12, RF-13, UC10, UC11)
  const [sessaoFoiRetomada, setSessaoFoiRetomada] = useState(false);

  // Tema (Claro, Escuro e Alto Contraste)
  const [tema, setTema] = useState<TipoTema>(() => {
    const temaSalvo = localStorage.getItem("tema_preferido") as TipoTema | null;
    if (temaSalvo === "light" || temaSalvo === "dark" || temaSalvo === "high-contrast") {
      return temaSalvo;
    }
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      if (window.matchMedia("(prefers-contrast: more)").matches) {
        return "high-contrast";
      }
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.remove("dark", "high-contrast");

    if (tema === "dark") {
      raiz.classList.add("dark");
    } else if (tema === "high-contrast") {
      raiz.classList.add("high-contrast", "dark");
    }
    localStorage.setItem("tema_preferido", tema);
  }, [tema]);

  // Erro de Persistência (RNF-06)
  const [erroPersistencia, setErroPersistencia] = useState<string | null>(null);
  const reportarPersistencia = (resultado: { temFalha: () => boolean; obterErro: () => string }) => {
    if (resultado.temFalha()) {
      setErroPersistencia(resultado.obterErro());
    }
  };

  // Restaurar sessão persistida na montagem (RF-12, UC10)
  useEffect(() => {
    const sessaoPersistida = repositorioSessao.carregar(TimestampMs.deNumero(Date.now()));
    if (sessaoPersistida) {
      send({ type: "CARREGAR_PERSISTIDA", sessao: sessaoPersistida });
      setIdPresetSelecionado(sessaoPersistida.obterIdentidade().presetId);
      setSessaoFoiRetomada(true);
    }
  }, [repositorioSessao, send]);

  // Sincronizar sessão ativa no LocalStorage
  useEffect(() => {
    const sessao = estadoMaquina.context.sessao;
    if (sessao) {
      const res = repositorioSessao.salvar(sessao);
      reportarPersistencia(res);
      return;
    }
    repositorioSessao.limpar();
  }, [estadoMaquina.context.sessao, repositorioSessao]);

  // Ticker de tempo
  const [agoraMs, setAgoraMs] = useState(Date.now());
  useEffect(() => {
    const intervalo = setInterval(() => {
      const agora = Date.now();
      setAgoraMs(agora);
      if (estadoMaquina.matches("emExecucao")) {
        send({ type: "VERIFICAR_TICK", agora });
      }
    }, 500);

    return () => clearInterval(intervalo);
  }, [estadoMaquina, send]);

  // Preset ativo atual
  const presetAtivo = useMemo(() => {
    const presets = listaPresets.paraArray();
    const encontrado = presets.find((p) => p.obterId().obterValor() === idPresetSelecionado);
    if (encontrado) {
      return encontrado.paraDto();
    }
    const primeiro = presets[0];
    if (primeiro) {
      return primeiro.paraDto();
    }
    return null;
  }, [listaPresets, idPresetSelecionado]);

  // ID do preset em uso por sessão ativa (RN-01)
  const idPresetSessaoAtiva = useMemo(() => {
    if (estadoMaquina.matches("ocioso")) {
      return null;
    }
    const sessao = estadoMaquina.context.sessao;
    if (sessao) {
      return sessao.paraDto().presetId;
    }
    return null;
  }, [estadoMaquina]);

  // Cálculo dos segundos restantes
  const tempoRestanteSegundos = useMemo(() => {
    const sessao = estadoMaquina.context.sessao;
    if (!sessao) {
      let minutosPadrao = 25;
      if (presetAtivo) {
        minutosPadrao = presetAtivo.tempoFocoMin;
      }
      return minutosPadrao * 60;
    }
    const dto = sessao.paraDto();
    if (dto.status === "pausada") {
      let msRestantes = 0;
      if (dto.tempoRestanteAoPausarMs) {
        msRestantes = dto.tempoRestanteAoPausarMs;
      }
      return Math.round(msRestantes / 1000);
    }
    const diferencaMs = Math.max(0, dto.fimFasePrevistoEm - agoraMs);
    return Math.round(diferencaMs / 1000);
  }, [estadoMaquina.context.sessao, presetAtivo, agoraMs]);

  // Troca de Preset (RN-02: ao selecionar outro preset, encerra a sessão ativa)
  const handleSelecionarPreset = (id: string) => {
    if (id === idPresetSelecionado) {
      return;
    }
    if (!estadoMaquina.matches("ocioso")) {
      send({ type: "ENCERRAR" });
    }
    setIdPresetSelecionado(id);
  };

  // Preset CRUD Handlers
  const handleSalvarPreset = (dados: DadosFormularioPreset) => {
    const agora = TimestampMs.deNumero(Date.now());
    if (presetEmEdicao) {
      const presetExistente = listaPresets.obterPorId(
        IdentificadorId.deString(presetEmEdicao.id).obterValor()
      );
      if (presetExistente) {
        const atualizado = presetExistente.atualizar({
          nome: NomePreset.criar(dados.nome).obterValor(),
          tempoFocoMin: MinutosFoco.criar(dados.tempoFocoMin).obterValor(),
          tempoPausaCurtaMin: MinutosPausaCurta.criar(dados.tempoPausaCurtaMin).obterValor(),
          ciclosAntesPausaLonga: CiclosAntesPausaLonga.criar(dados.ciclosAntesPausaLonga).obterValor(),
          tempoPausaLongaMin: MinutosPausaLonga.criar(dados.tempoPausaLongaMin).obterValor(),
          atualizadoEm: agora,
        });
        const novaLista = listaPresets.atualizar(atualizado);
        setListaPresets(novaLista);
        const res = repositorioPresets.salvar(novaLista);
        reportarPersistencia(res);
      }
    } else {
      const novo = Preset.criar({
        id: IdentificadorId.gerarNovo(),
        nome: NomePreset.criar(dados.nome).obterValor(),
        tempoFocoMin: MinutosFoco.criar(dados.tempoFocoMin).obterValor(),
        tempoPausaCurtaMin: MinutosPausaCurta.criar(dados.tempoPausaCurtaMin).obterValor(),
        ciclosAntesPausaLonga: CiclosAntesPausaLonga.criar(dados.ciclosAntesPausaLonga).obterValor(),
        tempoPausaLongaMin: MinutosPausaLonga.criar(dados.tempoPausaLongaMin).obterValor(),
        criadoEm: agora,
        atualizadoEm: agora,
      });
      const novaLista = listaPresets.adicionar(novo);
      setListaPresets(novaLista);
      const res = repositorioPresets.salvar(novaLista);
      reportarPersistencia(res);
      setIdPresetSelecionado(novo.obterId().obterValor());
    }
    setModalPresetAberto(false);
    setPresetEmEdicao(null);
  };

  const handleConfirmarExclusaoPreset = () => {
    if (!presetParaExcluir) {
      return;
    }
    const id = IdentificadorId.deString(presetParaExcluir.id).obterValor();
    const novaLista = listaPresets.remover(id);
    setListaPresets(novaLista);
    const res = repositorioPresets.salvar(novaLista);
    reportarPersistencia(res);
    const primeiro = novaLista.paraArray()[0];
    if (primeiro) {
      setIdPresetSelecionado(primeiro.obterId().obterValor());
    }
    setPresetParaExcluir(null);
  };

  // Tarefa CRUD Handlers
  const handleSalvarTarefa = (dados: DadosFormularioTarefa) => {
    const agora = TimestampMs.deNumero(Date.now());
    if (tarefaEmEdicao) {
      const tarefaExistente = listaTarefas.obterPorId(
        IdentificadorId.deString(tarefaEmEdicao.id).obterValor()
      );
      if (tarefaExistente) {
        const atualizada = tarefaExistente.atualizar({
          titulo: TituloTarefa.criar(dados.titulo).obterValor(),
          estado: EstadoTarefa.criar(dados.estado).obterValor(),
          prioridade: PrioridadeTarefa.criar(dados.prioridade).obterValor(),
          atualizadoEm: agora,
        });
        const novaLista = listaTarefas.atualizar(atualizada);
        setListaTarefas(novaLista);
        const res = repositorioTarefas.salvar(novaLista);
        reportarPersistencia(res);
      }
    } else {
      const nova = Tarefa.criar({
        id: IdentificadorId.gerarNovo(),
        titulo: TituloTarefa.criar(dados.titulo).obterValor(),
        estado: EstadoTarefa.criar(dados.estado).obterValor(),
        prioridade: PrioridadeTarefa.criar(dados.prioridade).obterValor(),
        criadoEm: agora,
        atualizadoEm: agora,
      });
      const novaLista = listaTarefas.adicionar(nova);
      setListaTarefas(novaLista);
      const res = repositorioTarefas.salvar(novaLista);
      reportarPersistencia(res);
    }
    setModalTarefaAberto(false);
    setTarefaEmEdicao(null);
  };

  const handleConfirmarExclusaoTarefa = () => {
    if (!tarefaParaExcluir) {
      return;
    }
    const id = IdentificadorId.deString(tarefaParaExcluir.id).obterValor();
    const novaLista = listaTarefas.remover(id);
    setListaTarefas(novaLista);
    const res = repositorioTarefas.salvar(novaLista);
    reportarPersistencia(res);
    setTarefaParaExcluir(null);
  };

  const obterEstadoVisual = (): "ocioso" | "emExecucao" | "pausado" | "concluido" => {
    if (estadoMaquina.matches("emExecucao")) {
      return "emExecucao";
    }
    if (estadoMaquina.matches("pausado")) {
      return "pausado";
    }
    if (estadoMaquina.matches("concluido")) {
      return "concluido";
    }
    return "ocioso";
  };
  const estadoVisual = obterEstadoVisual();

  const obterChaveModalPreset = (): string => {
    if (presetEmEdicao) {
      return presetEmEdicao.id;
    }
    return "novo-preset";
  };

  const obterChaveModalTarefa = (): string => {
    if (tarefaEmEdicao) {
      return tarefaEmEdicao.id;
    }
    return "nova-tarefa";
  };

  let sessaoDtoParaView: SessaoAtivaDto | null = null;
  if (estadoMaquina.context.sessao) {
    sessaoDtoParaView = estadoMaquina.context.sessao.paraDto();
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Temporizador de Foco (Pomodoro)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Aplicação de gestão de ciclos de estudo com persistência local e painel de tarefas.
          </p>
        </div>
        <div
          role="group"
          aria-label="Preferências de tema e acessibilidade visual"
          className="flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
        >
          <button
            type="button"
            onClick={() => setTema("light")}
            aria-pressed={tema === "light"}
            aria-label="Ativar modo claro"
            title="Ativar modo claro"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              tema === "light"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <SunIcon className="h-4 w-4" aria-hidden="true" />
            <span>Claro</span>
          </button>

          <button
            type="button"
            onClick={() => setTema("dark")}
            aria-pressed={tema === "dark"}
            aria-label="Ativar modo escuro"
            title="Ativar modo escuro"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              tema === "dark"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MoonIcon className="h-4 w-4" aria-hidden="true" />
            <span>Escuro</span>
          </button>

          <button
            type="button"
            onClick={() => setTema("high-contrast")}
            aria-pressed={tema === "high-contrast"}
            aria-label="Ativar modo alto contraste"
            title="Ativar modo alto contraste (WCAG AAA)"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              tema === "high-contrast"
                ? "bg-yellow-400 text-black shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <EyeIcon className="h-4 w-4" aria-hidden="true" />
            <span>Alto Contraste</span>
          </button>
        </div>
      </header>

      {erroPersistencia && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <span>{erroPersistencia}</span>
          <button
            type="button"
            aria-label="Fechar alerta de erro de persistência"
            title="Fechar alerta"
            onClick={() => setErroPersistencia(null)}
            className="ml-4 rounded p-1 font-bold text-rose-700 hover:text-rose-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Painel Esquerdo / Central: Temporizador e Presets */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <TemporizadorView
            estadoMaquina={estadoVisual}
            sessao={sessaoDtoParaView}
            tempoRestanteSegundos={tempoRestanteSegundos}
            sessaoFoiRetomada={sessaoFoiRetomada}
            onPersonalizarTempos={() => {
              if (presetAtivo) {
                setPresetEmEdicao(presetAtivo);
                setModalPresetAberto(true);
              }
            }}
            onIniciar={() => {
              emissorAudio.desbloquearNoGestoDoUsuario();
              setSessaoFoiRetomada(false);
              if (presetAtivo) {
                send({ type: "INICIAR", preset: presetAtivo, agora: Date.now() });
              }
            }}
            onPausar={() => send({ type: "PAUSAR", agora: Date.now() })}
            onRetomar={() => send({ type: "RETOMAR", agora: Date.now() })}
            onPularFase={() => send({ type: "PULAR_FASE", agora: Date.now() })}
            onReiniciarCiclos={() => send({ type: "REINICIAR_CICLOS", agora: Date.now() })}
            onEncerrar={() => {
              setSessaoFoiRetomada(false);
              send({ type: "ENCERRAR" });
            }}
            onDescartar={() => {
              setSessaoFoiRetomada(false);
              send({ type: "DESCARTAR" });
            }}
          />

          <ListaPresetsView
            presets={listaPresets.paraArray().map((p) => p.paraDto())}
            idPresetSelecionado={idPresetSelecionado}
            idPresetSessaoAtiva={idPresetSessaoAtiva}
            onSelecionarPreset={handleSelecionarPreset}
            onNovoPreset={() => {
              setPresetEmEdicao(null);
              setModalPresetAberto(true);
            }}
            onEditarPreset={(preset) => {
              setPresetEmEdicao(preset);
              setModalPresetAberto(true);
            }}
            onExcluirPreset={(preset) => setPresetParaExcluir(preset)}
          />
        </div>

        {/* Painel Lateral Direito: Tarefas (RF-18, RNF-05) */}
        <div className="lg:col-span-1">
          <PainelTarefasView
            tarefas={listaTarefas.paraArrayOrdenado().map((t) => t.paraDto())}
            onNovaTarefa={() => {
              setTarefaEmEdicao(null);
              setModalTarefaAberto(true);
            }}
            onEditarTarefa={(tarefa) => {
              setTarefaEmEdicao(tarefa);
              setModalTarefaAberto(true);
            }}
            onExcluirTarefa={(tarefa) => setTarefaParaExcluir(tarefa)}
          />
        </div>
      </main>

      {/* Modais de Preset */}
      <FormularioPreset
        key={obterChaveModalPreset()}
        aberto={modalPresetAberto}
        presetEdicao={presetEmEdicao}
        onSalvar={handleSalvarPreset}
        onCancelar={() => {
          setModalPresetAberto(false);
          setPresetEmEdicao(null);
        }}
      />

      <DialogoConfirmacao
        aberto={presetParaExcluir !== null}
        titulo="Excluir Temporizador?"
        mensagem={`Tem certeza que deseja excluir o temporizador "${presetParaExcluir?.nome}"?`}
        textoConfirmar="Sim, Excluir"
        onConfirmar={handleConfirmarExclusaoPreset}
        onCancelar={() => setPresetParaExcluir(null)}
      />

      {/* Modais de Tarefa */}
      <FormularioTarefa
        key={obterChaveModalTarefa()}
        aberto={modalTarefaAberto}
        tarefaEdicao={tarefaEmEdicao}
        onSalvar={handleSalvarTarefa}
        onCancelar={() => {
          setModalTarefaAberto(false);
          setTarefaEmEdicao(null);
        }}
      />

      <DialogoConfirmacao
        aberto={tarefaParaExcluir !== null}
        titulo="Excluir Tarefa?"
        mensagem={`Tem certeza que deseja excluir a tarefa "${tarefaParaExcluir?.titulo}"?`}
        textoConfirmar="Sim, Excluir"
        onConfirmar={handleConfirmarExclusaoTarefa}
        onCancelar={() => setTarefaParaExcluir(null)}
      />
    </div>
  );
};

export default App;
