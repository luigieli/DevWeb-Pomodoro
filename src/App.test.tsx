import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

describe("App Integrado (Pomodoro + Presets + Tarefas)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve carregar a tela principal com preset padrao, temporizador e painel de tarefas", () => {
    render(<App />);

    expect(screen.getByText("Pomodoro Padrão")).toBeInTheDocument();
    expect(screen.getByText("25:00")).toBeInTheDocument();
    expect(screen.getByText("Tarefas de Estudo")).toBeInTheDocument();
  });

  it("deve iniciar sessao de foco e atualizar status do preset em uso (RN-01)", () => {
    render(<App />);

    const botaoIniciar = screen.getByRole("button", { name: /Iniciar Sessão/i });
    fireEvent.click(botaoIniciar);

    // O preset padrão agora está em uso por sessão ativa
    const botaoEditarPadrao = screen.getByTestId("editar-preset-padrao-pomodoro");
    expect(botaoEditarPadrao).toBeDisabled();

    // Temporizador exibe botões de pausa e pular fase
    expect(screen.getByRole("button", { name: /Pausar/i })).toBeInTheDocument();
  });

  it("deve permitir adicionar uma nova tarefa com valores padrao (RN-12)", () => {
    render(<App />);

    const botaoNovaTarefa = screen.getByRole("button", { name: /\+ Adicionar/i });
    fireEvent.click(botaoNovaTarefa);

    const inputTitulo = screen.getByLabelText(/Título da tarefa/i);
    fireEvent.change(inputTitulo, { target: { value: "Estudar TypeScript estrito" } });

    const botaoSalvar = screen.getByRole("button", { name: /Salvar/i });
    fireEvent.click(botaoSalvar);

    expect(screen.getByText("Estudar TypeScript estrito")).toBeInTheDocument();
  });

  it("ao editar uma tarefa apos criar outra, deve abrir com os dados da tarefa selecionada e nao da ultima criada", () => {
    render(<App />);

    // 1. Criar Tarefa 1
    fireEvent.click(screen.getByRole("button", { name: /\+ Adicionar/i }));
    fireEvent.change(screen.getByLabelText(/Título da tarefa/i), {
      target: { value: "Primeira Tarefa" },
    });
    fireEvent.change(screen.getByLabelText(/Estado da tarefa/i), {
      target: { value: "aFazer" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    // 2. Criar Tarefa 2
    fireEvent.click(screen.getByRole("button", { name: /\+ Adicionar/i }));
    fireEvent.change(screen.getByLabelText(/Título da tarefa/i), {
      target: { value: "Segunda Tarefa" },
    });
    fireEvent.change(screen.getByLabelText(/Estado da tarefa/i), {
      target: { value: "concluida" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    // Ambas estão na tela
    expect(screen.getByText("Primeira Tarefa")).toBeInTheDocument();
    expect(screen.getByText("Segunda Tarefa")).toBeInTheDocument();

    // 3. Clicar no botão de editar da "Primeira Tarefa"
    const botoesEditar = screen.getAllByTitle("Editar Tarefa");
    // Primeira tarefa (aFazer vem antes de concluida pela RN-10 se tiver mesma prioridade)
    fireEvent.click(botoesEditar[0]);

    // O modal deve estar com "Primeira Tarefa" e "aFazer", NÃO "Segunda Tarefa" ou "concluida"!
    const inputTitulo = screen.getByLabelText(/Título da tarefa/i) as HTMLInputElement;
    const selectEstado = screen.getByLabelText(/Estado da tarefa/i) as HTMLSelectElement;

    expect(inputTitulo.value).toBe("Primeira Tarefa");
    expect(selectEstado.value).toBe("aFazer");

    // Salvar alteração da Primeira Tarefa
    fireEvent.change(inputTitulo, { target: { value: "Primeira Tarefa Atualizada" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    expect(screen.getByText("Primeira Tarefa Atualizada")).toBeInTheDocument();
    expect(screen.getByText("Segunda Tarefa")).toBeInTheDocument();
  });

  it("ao clicar novamente no preset já ativo com sessão em andamento, não deve encerrar a sessão (RN-02)", () => {
    render(<App />);

    // Iniciar sessão com o preset padrão
    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sessão/i }));
    expect(screen.getByRole("button", { name: /Pausar/i })).toBeInTheDocument();

    // Clicar novamente no card do preset padrão
    const botaoPreset = screen.getByText("Pomodoro Padrão");
    fireEvent.click(botaoPreset);

    // A sessão deve continuar em andamento
    expect(screen.getByRole("button", { name: /Pausar/i })).toBeInTheDocument();
  });

  it("deve restaurar sessão automaticamente do localStorage com aviso de retomada e permitir descarte (RF-12, RF-13, UC10, UC11)", () => {
    const agora = Date.now();
    const sessaoMock = {
      id: "sessao-retomada-1",
      presetId: "preset-padrao-pomodoro",
      snapshotPreset: {
        tempoFocoMin: 25,
        tempoPausaCurtaMin: 5,
        ciclosAntesPausaLonga: 4,
        tempoPausaLongaMin: 15,
      },
      status: "emAndamento",
      faseAtual: "foco",
      cicloAtual: 1,
      inicioFaseEm: agora - 60000,
      fimFasePrevistoEm: agora + 24 * 60000,
      pausadaEm: null,
      tempoRestanteAoPausarMs: null,
      criadaEm: agora - 60000,
      atualizadaEm: agora - 60000,
    };
    localStorage.setItem("pomodoro.sessaoAtiva", JSON.stringify(sessaoMock));

    render(<App />);

    // Deve exibir indicação de sessão restaurada
    expect(screen.getByText("Sessão restaurada da sua última visita.")).toBeInTheDocument();

    // Descartar sessão retomada
    const botaoDescartar = screen.getAllByRole("button", { name: /Descartar/i })[0];
    fireEvent.click(botaoDescartar);

    // Confirmar descarte no diálogo
    const botaoConfirmarDescarte = screen.getByRole("button", { name: "Sim, Descartar" });
    fireEvent.click(botaoConfirmarDescarte);

    // Sessão deve voltar ao estado ocioso
    expect(screen.getByRole("button", { name: /Iniciar Sessão/i })).toBeInTheDocument();
  });

  it("deve alternar entre modo claro, escuro e alto contraste salvando no localStorage", () => {
    render(<App />);

    const botaoClaro = screen.getByRole("button", { name: /Ativar modo claro/i });
    const botaoEscuro = screen.getByRole("button", { name: /Ativar modo escuro/i });
    const botaoAltoContraste = screen.getByRole("button", { name: /Ativar modo alto contraste/i });

    expect(botaoClaro).toBeInTheDocument();
    expect(botaoEscuro).toBeInTheDocument();
    expect(botaoAltoContraste).toBeInTheDocument();

    // Início no claro por padrão
    expect(botaoClaro).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(false);

    // Clicar para ativar modo escuro
    fireEvent.click(botaoEscuro);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(false);
    expect(localStorage.getItem("tema_preferido")).toBe("dark");
    expect(botaoEscuro).toHaveAttribute("aria-pressed", "true");

    // Clicar para ativar modo alto contraste
    fireEvent.click(botaoAltoContraste);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("tema_preferido")).toBe("high-contrast");
    expect(botaoAltoContraste).toHaveAttribute("aria-pressed", "true");

    // Voltar para o claro
    fireEvent.click(botaoClaro);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(false);
    expect(localStorage.getItem("tema_preferido")).toBe("light");
    expect(botaoClaro).toHaveAttribute("aria-pressed", "true");
  });

  it("deve conter legendas acessíveis, atributos aria-label e títulos nos botões principais", () => {
    render(<App />);

    const botaoIniciar = screen.getByRole("button", { name: "Iniciar sessão de foco" });
    expect(botaoIniciar).toHaveAttribute("title", "Iniciar cronômetro para o ciclo atual");

    const botaoNovoPreset = screen.getByRole("button", { name: "+ Novo Temporizador personalizado" });
    expect(botaoNovoPreset).toHaveAttribute("title", "Adicionar uma nova configuração de tempos");

    const botaoNovaTarefa = screen.getByRole("button", { name: "+ Adicionar nova tarefa de estudo" });
    expect(botaoNovaTarefa).toHaveAttribute("title", "Criar nova tarefa para a lista");
  });
});
