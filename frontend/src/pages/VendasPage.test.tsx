import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { VendasPage } from "./VendasPage";
import * as client from "../api/client";

vi.mock("../api/client");

describe("VendasPage", () => {
  it("lista as vendas retornadas pela API", async () => {
    vi.mocked(client.getVendas).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          numero_nota_fiscal: "00000001",
          data_hora: "2026-09-09T10:00:00Z",
          cliente: 1,
          cliente_nome: "Ana Souza",
          vendedor: 1,
          vendedor_nome: "João Silva",
          itens: [],
          valor_total: 20,
        },
      ],
    });

    render(
      <MemoryRouter>
        <VendasPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });
});