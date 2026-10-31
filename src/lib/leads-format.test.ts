import { describe, expect, it } from "vitest";

import { ETAPAS, formatValor, isEtapa, parseValor } from "./leads-format";

describe("leads rules", () => {
  it("offers exactly the three stages Novo, Em Contato, Fechado", () => {
    expect([...ETAPAS]).toEqual(["Novo", "Em Contato", "Fechado"]);
  });

  it("reads values stored as '12.000 R$'", () => {
    expect(parseValor("12.000 R$")).toBe(12000);
    expect(parseValor("30.000 R$")).toBe(30000);
  });

  it("writes new values in the same '4.000 R$' format", () => {
    expect(formatValor(4000)).toBe("4.000 R$");
  });

  it("rejects stages outside the pipeline", () => {
    expect(isEtapa("Perdido")).toBe(false);
    expect(isEtapa("Em Contato")).toBe(true);
  });
});
