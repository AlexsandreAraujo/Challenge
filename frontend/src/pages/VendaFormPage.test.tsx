import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { VendaFormPage } from "./VendaFormPage";
import * as client from "../api/client";

vi.mock("../api/client");

describe("VendaFormPage", () => {
  it("comeca com o botao Finalizar desabilitado", async () => {
    vi.mocked(client.getProdutos).mockResolvedValue([]);
    vi.mocked(client.getClientes).mockResolvedValue([]);
    vi.mocked(client.getVendedores).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <VendaFormPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole("button", { name: "Finalizar" })).toBeDisabled();
  });
});