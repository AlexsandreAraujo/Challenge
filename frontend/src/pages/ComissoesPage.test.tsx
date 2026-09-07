import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComissoesPage } from "./ComissoesPage";

describe("ComissoesPage", () => {
  it("mostra a mensagem inicial antes de selecionar um período", () => {
    render(<ComissoesPage />);

    expect(
      screen.getByText(
        "Para visualizar o relatório, selecione um período nos campos acima."
      )
    ).toBeInTheDocument();
  });

  it("mostra o título do relatório", () => {
    render(<ComissoesPage />);

    expect(screen.getByText("Relatório de Comissões")).toBeInTheDocument();
  });
});