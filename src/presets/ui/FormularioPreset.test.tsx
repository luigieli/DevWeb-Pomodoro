import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormularioPreset } from "./FormularioPreset";

describe("FormularioPreset", () => {
  it("deve renderizar campos com valores iniciais ou padrao", () => {
    render(
      <FormularioPreset
        aberto={true}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/Nome do temporizador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tempo de foco/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tempo de pausa curta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ciclos antes da pausa longa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tempo de pausa longa/i)).toBeInTheDocument();
  });

  it("deve exibir erro de validação e não salvar se o nome for vazio", () => {
    const onSalvar = vi.fn();
    render(
      <FormularioPreset
        aberto={true}
        onSalvar={onSalvar}
        onCancelar={vi.fn()}
      />
    );
    const inputNome = screen.getByLabelText(/Nome do temporizador/i);
    fireEvent.change(inputNome, { target: { value: "   " } });

    const botaoSalvar = screen.getByRole("button", { name: /Salvar/i });
    fireEvent.click(botaoSalvar);

    expect(screen.getByText("Nome do preset deve ter entre 1 e 40 caracteres.")).toBeInTheDocument();
    expect(onSalvar).not.toHaveBeenCalled();
  });

  it("deve salvar quando todos os campos estiverem válidos", () => {
    const onSalvar = vi.fn();
    render(
      <FormularioPreset
        aberto={true}
        onSalvar={onSalvar}
        onCancelar={vi.fn()}
      />
    );
    const inputNome = screen.getByLabelText(/Nome do temporizador/i);
    fireEvent.change(inputNome, { target: { value: "Foco Total" } });

    const botaoSalvar = screen.getByRole("button", { name: /Salvar/i });
    fireEvent.click(botaoSalvar);

    expect(onSalvar).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Foco Total",
        tempoFocoMin: 25,
        tempoPausaCurtaMin: 5,
        ciclosAntesPausaLonga: 4,
        tempoPausaLongaMin: 15,
      })
    );
  });

  it("deve sincronizar os campos ao receber novo presetEdicao ou ao alternar entre edicao e criacao", () => {
    const preset1 = {
      id: "p-1",
      nome: "Preset Um",
      tempoFocoMin: 25,
      tempoPausaCurtaMin: 5,
      ciclosAntesPausaLonga: 4,
      tempoPausaLongaMin: 15,
      criadoEm: 1000,
      atualizadoEm: 1000,
    };
    const preset2 = {
      id: "p-2",
      nome: "Preset Dois",
      tempoFocoMin: 50,
      tempoPausaCurtaMin: 10,
      ciclosAntesPausaLonga: 2,
      tempoPausaLongaMin: 20,
      criadoEm: 2000,
      atualizadoEm: 2000,
    };

    const { rerender } = render(
      <FormularioPreset
        aberto={true}
        presetEdicao={preset1}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    const inputNome = screen.getByLabelText(/Nome do temporizador/i) as HTMLInputElement;
    expect(inputNome.value).toBe("Preset Um");

    rerender(
      <FormularioPreset
        aberto={true}
        presetEdicao={preset2}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    expect(inputNome.value).toBe("Preset Dois");

    rerender(
      <FormularioPreset
        aberto={true}
        presetEdicao={null}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    expect(inputNome.value).toBe("");
  });

  it("deve fechar modal ao pressionar tecla Escape", () => {
    const onCancelar = vi.fn();
    render(
      <FormularioPreset
        aberto={true}
        onSalvar={vi.fn()}
        onCancelar={onCancelar}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancelar).toHaveBeenCalled();
  });

  it("deve exibir multiplos erros por campo simultaneamente", () => {
    render(
      <FormularioPreset
        aberto={true}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    const inputNome = screen.getByLabelText(/Nome do temporizador/i);
    fireEvent.change(inputNome, { target: { value: "   " } });

    const inputFoco = screen.getByLabelText(/Tempo de foco/i);
    fireEvent.change(inputFoco, { target: { value: "0" } });

    const form = screen.getByRole("dialog").querySelector("form")!;
    fireEvent.submit(form);

    expect(screen.getByText("Nome do preset deve ter entre 1 e 40 caracteres.")).toBeInTheDocument();
    expect(screen.getByText("Tempo de foco deve ser um inteiro entre 1 e 120 minutos.")).toBeInTheDocument();
  });

  it("deve focar o primeiro campo (nome) automaticamente na abertura", async () => {
    render(
      <FormularioPreset
        aberto={true}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    await new Promise((resolve) => requestAnimationFrame(resolve));
    const inputNome = screen.getByLabelText(/Nome do temporizador/i);
    expect(document.activeElement).toBe(inputNome);
  });
});
