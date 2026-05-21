import pako from "pako";
import type { PDFPage } from "pdf-lib";
import { PDFName } from "pdf-lib";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { decodePDFRawStream } = require("pdf-lib/cjs/core/streams/decode") as {
  decodePDFRawStream: (s: { dict: unknown; contents: Uint8Array }) => { decode: () => Uint8Array };
};

function decodeExoticStream(stream: {
  contents: Uint8Array;
  dict: { lookup: (n: ReturnType<typeof PDFName.of>) => unknown };
}): Uint8Array {
  if (
    "getUnencodedContents" in stream &&
    typeof (stream as { getUnencodedContents?: () => Uint8Array }).getUnencodedContents === "function"
  ) {
    return (stream as { getUnencodedContents: () => Uint8Array }).getUnencodedContents();
  }
  return decodePDFRawStream({ dict: stream.dict, contents: stream.contents }).decode();
}
import {
  getTextFromOperands,
  parseContentStream,
  serializeOperations,
  type PdfOperation,
} from "./content-stream-parse";
import { IDENTITY_MATRIX, multiplyMatrix, textOriginUserSpace, type Matrix } from "./matrix";
import { rectsIntersect, type BBox } from "./intersect";
import type { RedactionRect, TextSpan } from "./types";

/** pdf-lib internals (stable across browser + Node bundles). */
type PdfInternals = {
  node: { Contents: () => unknown; set: (name: ReturnType<typeof PDFName.of>, value: unknown) => void };
  doc: {
    context: {
      lookup: (ref: unknown, ctor?: unknown) => unknown;
      flateStream: (bytes: Uint8Array) => unknown;
      register: (obj: unknown) => unknown;
    };
  };
};

type PdfArrayLike = { size: () => number; lookup: (i: number) => unknown };

function asInternals(page: PDFPage): PdfInternals {
  return page as unknown as PdfInternals;
}

/** Prevent pdf-lib draw* from re-attaching a stale pre-redaction stream. */
export function invalidatePdfLibContentCache(page: PDFPage): void {
  const p = page as unknown as { contentStream?: unknown; contentStreamRef?: unknown };
  delete p.contentStream;
  delete p.contentStreamRef;
}

function isPdfRef(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  const r = obj as { tag?: string; objectNumber?: number };
  return r.tag === "Ref" && typeof r.objectNumber === "number";
}

function resolve(ctx: PdfInternals["doc"]["context"], obj: unknown): unknown {
  if (!obj) return obj;
  if (isPdfRef(obj)) return ctx.lookup(obj);
  return obj;
}

function isContentStream(obj: unknown): obj is { getUnencodedContents: () => Uint8Array } {
  return (
    !!obj &&
    typeof obj === "object" &&
    typeof (obj as { getUnencodedContents?: unknown }).getUnencodedContents === "function"
  );
}

function isRawStream(obj: unknown): obj is { contents: Uint8Array; dict: { lookup: (n: ReturnType<typeof PDFName.of>) => unknown } } {
  return (
    !!obj &&
    typeof obj === "object" &&
    (obj as { contents?: unknown }).contents instanceof Uint8Array &&
    typeof (obj as { dict?: { lookup?: unknown } }).dict?.lookup === "function"
  );
}

function isPdfArray(obj: unknown): obj is PdfArrayLike {
  return (
    !!obj &&
    typeof obj === "object" &&
    typeof (obj as { size?: unknown }).size === "function" &&
    typeof (obj as { lookup?: unknown }).lookup === "function"
  );
}

const EXOTIC_FILTERS = new Set([
  "ASCII85Decode",
  "ASCIIHexDecode",
  "LZWDecode",
  "RunLengthDecode",
  "CCITTFaxDecode",
  "JBIG2Decode",
]);

function filterNamesFromDict(dict: { lookup: (n: ReturnType<typeof PDFName.of>) => unknown }): string[] {
  const filter = dict.lookup(PDFName.of("Filter"));
  if (!filter) return [];
  const names: string[] = [];
  const push = (f: unknown) => {
    if (f && typeof f === "object" && "asString" in f) {
      names.push((f as { asString: () => string }).asString().replace(/^\//, ""));
    }
  };
  if (typeof (filter as { size?: () => number }).size === "function") {
    const arr = filter as PdfArrayLike;
    for (let i = 0; i < arr.size(); i++) push(arr.lookup(i));
  } else {
    push(filter);
  }
  return names;
}

function streamNeedsExoticDecode(dict: { lookup: (n: ReturnType<typeof PDFName.of>) => unknown }): boolean {
  const names = filterNamesFromDict(dict);
  if (!names.length) return false;
  return names.some((n) => EXOTIC_FILTERS.has(n));
}

function decodeStreamBytes(stream: unknown): Uint8Array {
  if (isContentStream(stream)) {
    return stream.getUnencodedContents();
  }
  if (isRawStream(stream)) {
    if (streamNeedsExoticDecode(stream.dict)) {
      return decodeExoticStream(stream);
    }
    const names = filterNamesFromDict(stream.dict);
    if (names.length === 0 || names[names.length - 1] === "FlateDecode") {
      try {
        return pako.inflate(stream.contents);
      } catch {
        throw new Error("Failed to decompress page content (FlateDecode)");
      }
    }
    return decodeExoticStream(stream);
  }
  throw new Error(`Unsupported PDF content stream type: ${(stream as object)?.constructor?.name ?? typeof stream}`);
}

/** True when page content uses non-Flate encodings (e.g. Canva ASCII85) — needs flatten if stream edit is unsafe. */
export function pageUsesExoticContentFilters(page: PDFPage): boolean {
  const internals = asInternals(page);
  const ctx = internals.doc.context;
  const contents = resolve(ctx, internals.node.Contents());
  if (!contents) return false;

  const check = (obj: unknown): boolean => {
    const stream = resolve(ctx, obj);
    if (!stream || typeof stream !== "object") return false;
    const dict = (stream as { dict?: { lookup: (n: ReturnType<typeof PDFName.of>) => unknown } }).dict;
    if (dict?.lookup && streamNeedsExoticDecode(dict)) return true;
    return false;
  };

  if (isPdfArray(contents)) {
    for (let i = 0; i < contents.size(); i++) {
      if (check(contents.lookup(i))) return true;
    }
    return false;
  }
  return check(contents);
}

function getPageContentBytes(page: PdfInternals): Uint8Array {
  const ctx = page.doc.context;
  const contents = resolve(ctx, page.node.Contents());
  if (!contents) return new Uint8Array(0);

  if (isPdfArray(contents)) {
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < contents.size(); i++) {
      const stream = resolve(ctx, contents.lookup(i));
      chunks.push(decodeStreamBytes(stream));
      chunks.push(new Uint8Array([0x0a]));
    }
    const total = chunks.reduce((s, c) => s + c.length, 0);
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.length;
    }
    return merged;
  }

  return decodeStreamBytes(resolve(ctx, contents));
}

function setPageContentBytes(page: PdfInternals, bytes: Uint8Array): void {
  const stream = page.doc.context.flateStream(bytes);
  const ref = page.doc.context.register(stream);
  page.node.set(PDFName.of("Contents"), ref);
}

function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function textMatchesMarkedSpan(opText: string, spanText: string): boolean {
  const a = normalizeText(opText);
  const b = normalizeText(spanText);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 2 && b.includes(a)) return true;
  if (b.length >= 2 && a.includes(b)) return true;
  return false;
}

interface TextState {
  ctm: Matrix;
  tlm: Matrix;
  fontSize: number;
  ctmStack: Matrix[];
}

function createTextState(): TextState {
  return { ctm: [...IDENTITY_MATRIX], tlm: [...IDENTITY_MATRIX], fontSize: 12, ctmStack: [] };
}

function estimateTextBBox(state: TextState, text: string): BBox {
  const [x, y] = textOriginUserSpace(state.ctm, state.tlm);
  const w = Math.max(text.length * state.fontSize * 0.45, state.fontSize);
  const h = state.fontSize * 1.2;
  return { x, y: y - h * 0.25, width: w, height: h };
}

function updateStateForOp(state: TextState, op: PdfOperation): void {
  const nums = op.operands.filter((o) => o.type === "number").map((o) => o.value as number);

  switch (op.operator) {
    case "q":
      state.ctmStack.push([...state.ctm]);
      break;
    case "Q":
      state.ctm = state.ctmStack.pop() ?? [...IDENTITY_MATRIX];
      break;
    case "cm":
      if (nums.length >= 6) {
        state.ctm = multiplyMatrix(state.ctm, [
          nums[0], nums[1], nums[2], nums[3], nums[4], nums[5],
        ]);
      }
      break;
    case "BT":
      state.tlm = [...IDENTITY_MATRIX];
      break;
    case "Tm":
      if (nums.length >= 6) {
        state.tlm = [nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]];
      }
      break;
    case "Td":
    case "TD":
      if (nums.length >= 2) {
        state.tlm = multiplyMatrix(state.tlm, [1, 0, 0, 1, nums[0], nums[1]]);
      }
      break;
    case "Tf":
      if (nums.length >= 1) state.fontSize = nums[nums.length - 1];
      break;
    case "'":
    case '"':
      state.tlm = multiplyMatrix(state.tlm, [1, 0, 0, 1, 0, -(nums[0] ?? state.fontSize)]);
      break;
    default:
      break;
  }
}

const SPAN_BBOX_PAD = 8;
const REDACTION_BBOX_PAD = 6;
const ORIGIN_IN_BOX_PAD = 4;

function textOriginInsideRedaction(
  state: TextState,
  redactions: RedactionRect[],
  pad = ORIGIN_IN_BOX_PAD
): boolean {
  const [x, y] = textOriginUserSpace(state.ctm, state.tlm);
  return redactions.some(
    (r) =>
      x >= r.x - pad &&
      x <= r.x + r.width + pad &&
      y >= r.y - pad &&
      y <= r.y + r.height + pad
  );
}

function shouldRemoveTextOp(
  op: PdfOperation,
  state: TextState,
  redactions: RedactionRect[],
  markedSpans: TextSpan[]
): boolean {
  const text = getTextFromOperands(op);
  if (!text?.trim()) return false;

  if (textOriginInsideRedaction(state, redactions)) return true;

  const bbox = estimateTextBBox(state, text);

  for (const span of markedSpans) {
    if (textMatchesMarkedSpan(text, span.text)) return true;
    const spanBox: BBox = { x: span.x, y: span.y, width: span.width, height: span.height };
    if (rectsIntersect(bbox, spanBox, SPAN_BBOX_PAD)) return true;
  }

  return redactions.some((r) => rectsIntersect(bbox, r, REDACTION_BBOX_PAD));
}

function filterContentStream(
  bytes: Uint8Array,
  redactions: RedactionRect[],
  markedSpans: TextSpan[]
): Uint8Array {
  if (!bytes.length) return bytes;

  let ops;
  try {
    ops = parseContentStream(bytes);
  } catch (err) {
    throw new Error(
      `Could not parse PDF content stream: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const state = createTextState();
  const kept: PdfOperation[] = [];
  let removed = 0;
  let totalTextOps = 0;

  for (const op of ops) {
    if (["Tj", "TJ", "'", '"'].includes(op.operator)) totalTextOps++;
    const isTextShow = ["Tj", "TJ", "'", '"'].includes(op.operator);
    if (isTextShow && shouldRemoveTextOp(op, state, redactions, markedSpans)) {
      removed++;
      updateStateForOp(state, op);
      continue;
    }
    kept.push(op);
    updateStateForOp(state, op);
  }

  if (ops.length > 0 && kept.length === 0) {
    console.warn("Content stream would be empty after redaction; keeping original page content.");
    return bytes;
  }

  if (totalTextOps > 2 && removed >= totalTextOps * 0.85) {
    console.warn("Too many text operators removed; keeping original page content.");
    return bytes;
  }

  const out = serializeOperations(kept, bytes);
  if (out.length === 0 && bytes.length > 0) {
    console.warn("Serialized content stream empty; keeping original page content.");
    return bytes;
  }
  return out;
}

/** Remove text operators inside redaction boxes; leaves layout and images intact. */
export async function redactPageContents(
  page: PDFPage,
  markedSpans: TextSpan[],
  redactions: RedactionRect[]
): Promise<void> {
  const internals = asInternals(page);
  const bytes = getPageContentBytes(internals);
  if (!bytes.length) return;
  setPageContentBytes(internals, filterContentStream(bytes, redactions, markedSpans));
  invalidatePdfLibContentCache(page);
}
