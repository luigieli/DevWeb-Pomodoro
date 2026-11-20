import React, { useEffect, useRef } from "react";

interface PropriedadesDialogoConfirmacao {
  readonly aberto: boolean;
  readonly titulo: string;
  readonly mensagem: string;
  readonly textoConfirmar?: string;
  readonly textoCancelar?: string;
  readonly onConfirmar: () => void;
  readonly onCancelar: () => void;
}

export const DialogoConfirmacao: React.FC<PropriedadesDialogoConfirmacao> = ({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}) => {
  const botaoCancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) {
      return;
    }
    const frameId = requestAnimationFrame(() => {
      botaoCancelarRef.current?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, [aberto]);

  if (!aberto) {
    return null;
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialogo-titulo"
      aria-describedby="dialogo-mensagem"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800">
        <h2 id="dialogo-titulo" className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {titulo}
        </h2>
        <p id="dialogo-mensagem" className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {mensagem}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={botaoCancelarRef}
            type="button"
            onClick={onCancelar}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};
