import { describe, it, expect } from "vitest";
import { getType, formatFieldName, getTypeScriptName, formatForArrayLabel } from "../../src/util";

describe("getType — scalar mappings", () => {
  it("maps string to string", () => {
    expect(getType("string")).toBe("string");
  });

  it("maps every integer/float width to number", () => {
    for (const t of ["uint8", "uint16", "uint32", "uint64", "int8", "int16", "int32", "int64", "double", "float"]) {
      expect(getType(t)).toBe("number");
    }
  });

  it("maps bool to boolean", () => {
    expect(getType("bool")).toBe("boolean");
  });

  it("maps a bare object to Record<string, unknown>", () => {
    expect(getType("object")).toBe("Record<string, unknown>");
  });

  it("maps the empty type to void", () => {
    expect(getType("")).toBe("void");
  });
});

describe("getType — named types and namespacing", () => {
  it("returns the type name as-is without a namespace", () => {
    expect(getType("LolChampSelectSession")).toBe("LolChampSelectSession");
  });

  it("qualifies a named type with the namespace", () => {
    expect(getType("LolChampSelectSession", "LCUTypes")).toBe("LCUTypes.LolChampSelectSession");
  });
});

describe("getType — vector and map element types", () => {
  // Regression for the comma-operator bug: previously the recursive getType() result was discarded
  // and the namespace alone was emitted (e.g. "undefined[]" / "LCUTypes[]").
  it("maps a vector to elementType[]", () => {
    expect(getType({ type: "vector", elementType: "string" })).toBe("string[]");
  });

  it("namespaces a vector's named element type", () => {
    expect(getType({ type: "vector", elementType: "LolThing" }, "LCUTypes")).toBe("LCUTypes.LolThing[]");
  });

  it("maps a map to Record<string | number, elementType>", () => {
    expect(getType({ type: "map", elementType: "int32" })).toBe("Record<string | number, number>");
  });
});

describe("formatFieldName", () => {
  it("leaves a plain identifier unquoted", () => {
    expect(formatFieldName("summonerId")).toBe("summonerId");
  });

  it("quotes names containing a hyphen", () => {
    expect(formatFieldName("plugin-name")).toBe('"plugin-name"');
  });

  it("quotes names containing a digit", () => {
    expect(formatFieldName("v2")).toBe('"v2"');
  });
});

describe("getTypeScriptName", () => {
  it("replaces hyphens with underscores", () => {
    expect(getTypeScriptName("lol-champ-select")).toBe("lol_champ_select");
  });

  it("passes through a plain name", () => {
    expect(getTypeScriptName("LolThing")).toBe("LolThing");
  });
});

describe("formatForArrayLabel", () => {
  it("converts kebab-case to camelCase", () => {
    expect(formatForArrayLabel("champ-select")).toBe("champSelect");
  });

  it("strips characters that are not valid in an identifier", () => {
    expect(formatForArrayLabel("v1+x")).toBe("vx");
  });
});
