import pako from "pako";
import type { PDFPage } from "pdf-lib";
import { PDFName } from "pdf-lib";
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

function getFilterName(dict: { lookup: (n: ReturnType<typeof PDFName.of>) => unknown }): string | null {
  const filter = dict.lookup(PDFName.of("Filter"));
  if (filter && typeof filter === "object" && "asString" in filter) {
    return (filter as { asString: () => string }).asString().replace(/^\//, "");
  }
  return null;
}

function decodeStreamBytes(stream: unknown): Uint8Array {
  if (isContentStream(stream)) {
    return stream.getUnencodedContents();
  }
  if (isRawStream(stream)) {
    let data = stream.contents;
    const filter = getFilterName(stream.dict);
    if (filter === "FlateDecode") {
      try {
        data = pako.inflate(data);
      } catch {
        throw new Error("Failed to decompress page content (FlateDecode)");
      }
    }
    return data;
  }
  throw new Error(`Unsupported PDF content stream type: ${(stream as object)?.constructor?.name ?? typeof stream}`);
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

const SPAN_BBOX_PAD = 4;
const REDACTION_BBOX_PAD = 2;

function shouldRemoveTextOp(
  op: PdfOperation,
  state: TextState,
  redactions: RedactionRect[],
  markedSpans: TextSpan[]
): boolean {
  const text = getTextFromOperands(op);
  if (!text?.trim()) return false;

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

  for (const op of ops) {
    const isTextShow = ["Tj", "TJ", "'", '"'].includes(op.operator);
    if (isTextShow && shouldRemoveTextOp(op, state, redactions, markedSpans)) {
      removed++;
      updateStateForOp(state, op);
      continue;
    }
    kept.push(op);
    updateStateForOp(state, op);
  }

  if (removed === 0 && (markedSpans.length > 0 || redactions.length > 0)) {
    throw new Error(
      "Redaction boxes did not match any text in the PDF content stream. Try drawing a slightly larger box."
    );
  }

  return serializeOperations(kept, bytes);
}

/**
 * Strip text operators inside redaction boxes; keeps vectors/images intact.
 * Does not draw black rectangles in the file — preview boxes stay in the editor only.
 */
export async function redactPageContents(
  page: PDFPage,
  markedSpans: TextSpan[],
  redactions: RedactionRect[]
): Promise<void> {
  const internals = asInternals(page);
  const bytes = getPageContentBytes(internals);
  if (!bytes.length) return;
  const filtered = filterContentStream(bytes, redactions, markedSpans);
  setPageContentBytes(internals, filtered);
  invalidatePdfLibContentCache(page);
}
