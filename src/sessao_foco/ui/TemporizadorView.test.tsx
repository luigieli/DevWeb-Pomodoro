import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TemporizadorView } from "./TemporizadorView";
import { SessaoAtivaDto } from "../dominio/SessaoAtiva";

describe("TemporizadorView", () => {
  const sessaoEmExecucao: SessaoAtivaDto = {
    id: "s-1",
    presetId: "p-1",
    snapshotPreset: {
      tempoFocoMin: 25,
      tempoPausaCurtaMin: 5,
      ciclosAntesPausaLonga: 4,
      tempoPausaLongaMin: 15,
    },
    faseAtual: "foco",
    cicloAtual: 2,
    status: "emAndamento",
    inicioFaseEm: 1000,
    fimFasePrevistoEm: 1000 + 1500000,
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
  };

  it("deve renderizar botao Iniciar quando estado for ocioso", () => {
    render(
      <TemporizadorView
        estadoMaquina="ocioso"
        sessao={null}
        tempoRestanteSegundos={25 * 60}
        onIniciar={vi.fn()}
        onPausar={vi.fn()}
        onRetomar={vi.fn()}
        onPularFase={vi.fn()}
        onReiniciarCiclos={vi.fn()}
        onEncerrar={vi.fn()}
        onDescartar={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /Iniciar Sessão/i })).toBeInTheDocument();
    const displayTimer = screen.getByRole("timer");
    expect(displayTimer).toBeInTheDocument();
    expect(displayTimer).toHaveTextContent("25:00");
    expect(displayTimer).toHaveClass("font-mono", "tabular-nums");
  });

  it("deve exibir contagem regressiva, fase e ciclo quando em execucao", () => {
    render(
      <TemporizadorView
        estadoMaquina="emExecucao"
        sessao={sessaoEmExecucao}
        tempoRestanteSegundos={24 * 60 + 30}
        onIniciar={vi.fn()}
        onPausar={vi.fn()}
        onRetomar={vi.fn()}
        onPularFase={vi.fn()}
        onReiniciarCiclos={vi.fn()}
        onEncerrar={vi.fn()}
        onDescartar={vi.fn()}
      />
    );
    expect(screen.getByText("24:30")).toBeInTheDocument();
    expect(screen.getByText(/Fase: Foco/i)).toBeInTheDocument();
    expect(screen.getByText(/Ciclo 2 de 4/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pausar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pular Fase/i })).toBeInTheDocument();
  });

  it("deve acionar onPausar ao clicar no botao de pausa", () => {
    const onPausar = vi.fn();
    render(
      <TemporizadorView
        estadoMaquina="emExecucao"
        sessao={sessaoEmExecucao}
        tempoRestanteSegundos={100}
        onIniciar={vi.fn()}
        onPausar={onPausar}
        onRetomar={vi.fn()}
        onPularFase={vi.fn()}
        onReiniciarCiclos={vi.fn()}
        onEncerrar={vi.fn()}
        onDescartar={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Pausar/i }));
    expect(onPausar).toHaveBeenCalledTimes(1);
  });
});
