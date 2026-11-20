import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormularioTarefa } from "./FormularioTarefa";

describe("FormularioTarefa (RN-12, VR-06 a VR-08)", () => {
  it("deve iniciar com valores padrao de criacao (RN-12): backlog e prioridade media", () => {
    render(
      <FormularioTarefa
        aberto={true}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );
    const selectEstado = screen.getByLabelText(/Estado da tarefa/i) as HTMLSelectElement;
    const selectPrioridade = screen.getByLabelText(/Prioridade da tarefa/i) as HTMLSelectElement;

    expect(selectEstado.value).toBe("backlog");
    expect(selectPrioridade.value).toBe("media");
  });

  it("deve rejeitar submissão com título vazio (VR-06)", () => {
    const onSalvar = vi.fn();
    render(
      <FormularioTarefa
        aberto={true}
        onSalvar={onSalvar}
        onCancelar={vi.fn()}
      />
    );
    const inputTitulo = screen.getByLabelText(/Título da tarefa/i);
    fireEvent.change(inputTitulo, { target: { value: "   " } });

    const botaoSalvar = screen.getByRole("button", { name: /Salvar/i });
    fireEvent.click(botaoSalvar);

    expect(screen.getByText("Título da tarefa deve ter entre 1 e 100 caracteres.")).toBeInTheDocument();
    expect(onSalvar).not.toHaveBeenCalled();
  });

  it("deve salvar quando dados estiverem válidos", () => {
    const onSalvar = vi.fn();
    render(
      <FormularioTarefa
        aberto={true}
        onSalvar={onSalvar}
        onCancelar={vi.fn()}
      />
    );
    const inputTitulo = screen.getByLabelText(/Título da tarefa/i);
    fireEvent.change(inputTitulo, { target: { value: "Resolver lista de exercícios" } });

    const botaoSalvar = screen.getByRole("button", { name: /Salvar/i });
    fireEvent.click(botaoSalvar);

    expect(onSalvar).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "Resolver lista de exercícios",
        estado: "backlog",
        prioridade: "media",
      })
    );
  });

  it("deve sincronizar os campos ao receber nova tarefaEdicao ou ao alternar entre edicao e criacao", () => {
    const tarefa1 = {
      id: "t-1",
      titulo: "Tarefa Um",
      estado: "aFazer" as const,
      prioridade: "alta" as const,
      criadoEm: 1000,
      atualizadoEm: 1000,
    };
    const tarefa2 = {
      id: "t-2",
      titulo: "Tarefa Dois",
      estado: "concluida" as const,
      prioridade: "baixa" as const,
      criadoEm: 2000,
      atualizadoEm: 2000,
    };

    const { rerender } = render(
      <FormularioTarefa
        aberto={true}
        tarefaEdicao={tarefa1}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    const inputTitulo = screen.getByLabelText(/Título da tarefa/i) as HTMLInputElement;
    const selectEstado = screen.getByLabelText(/Estado da tarefa/i) as HTMLSelectElement;
    expect(inputTitulo.value).toBe("Tarefa Um");
    expect(selectEstado.value).toBe("aFazer");

    // Simulando usuário abrindo para editar a Tarefa Dois
    rerender(
      <FormularioTarefa
        aberto={true}
        tarefaEdicao={tarefa2}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    expect(inputTitulo.value).toBe("Tarefa Dois");
    expect(selectEstado.value).toBe("concluida");

    // Simulando usuário abrindo para criar nova tarefa (tarefaEdicao = null)
    rerender(
      <FormularioTarefa
        aberto={true}
        tarefaEdicao={null}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    expect(inputTitulo.value).toBe("");
    expect(selectEstado.value).toBe("backlog");
  });

  it("deve fechar modal ao pressionar tecla Escape", () => {
    const onCancelar = vi.fn();
    render(
      <FormularioTarefa
        aberto={true}
        onSalvar={vi.fn()}
        onCancelar={onCancelar}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancelar).toHaveBeenCalled();
  });

  it("deve focar o primeiro campo (título) automaticamente na abertura", async () => {
    render(
      <FormularioTarefa
        aberto={true}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    await new Promise((resolve) => requestAnimationFrame(resolve));
    const inputTitulo = screen.getByLabelText(/Título da tarefa/i);
    expect(document.activeElement).toBe(inputTitulo);
  });
});
