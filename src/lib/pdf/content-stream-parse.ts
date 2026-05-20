/**
 * Lightweight PDF content-stream lexer/parser (postfix operators).
 * Preserves original byte ranges so re-serialization does not corrupt strings/fonts.
 */

export type PdfToken =
  | { type: "number"; value: number }
  | { type: "string"; value: string }
  | { type: "hex"; value: string }
  | { type: "name"; value: string }
  | { type: "array"; raw: string }
  | { type: "dict"; raw: string };

export interface PdfOperation {
  operands: PdfToken[];
  operator: string;
  /** Byte range in the original decompressed content stream (inclusive start, exclusive end). */
  sourceStart: number;
  sourceEnd: number;
}

const SHOW_TEXT_OPS = new Set(["Tj", "TJ", "'", '"']);

const KNOWN_OPERATORS = new Set([
  "q", "Q", "cm", "w", "J", "j", "M", "d", "ri", "i", "gs",
  "m", "l", "c", "v", "y", "h", "re", "S", "s", "f", "F", "f*", "B", "B*", "b", "b*", "n",
  "W", "W*", "BT", "ET", "Tc", "Tw", "Tz", "TL", "Tf", "Tr", "Ts",
  "Td", "TD", "Tm", "T*", "Tj", "TJ", "'", '"',
  "BI", "ID", "EI", "Do", "sh", "CS", "cs", "SC", "SCN", "sc", "scn",
  "RG", "G", "K", "rg", "g", "k",
  "BMC", "BDC", "EMC", "DP", "MP",
]);

function isWhitespace(b: number): boolean {
  return b === 0x20 || b === 0x09 || b === 0x0a || b === 0x0c || b === 0x0d || b === 0x00;
}

function decodePdfString(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

export class ContentStreamLexer {
  private pos = 0;

  constructor(private readonly bytes: Uint8Array) {}

  get position(): number {
    return this.pos;
  }

  get eof(): boolean {
    return this.pos >= this.bytes.length;
  }

  skipWhitespaceAndComments(): void {
    while (!this.eof) {
      const b = this.peek();
      if (isWhitespace(b)) {
        this.next();
        continue;
      }
      if (b === 0x25) {
        while (!this.eof && this.peek() !== 0x0a) this.next();
        continue;
      }
      break;
    }
  }

  private peek(offset = 0): number {
    return this.bytes[this.pos + offset] ?? -1;
  }

  private next(): number {
    return this.bytes[this.pos++] ?? -1;
  }

  readToken(): PdfToken | null {
    this.skipWhitespaceAndComments();
    if (this.eof) return null;

    const b = this.peek();

    if (b === 0x28) {
      return { type: "string", value: this.readLiteralString() };
    }
    if (b === 0x3c) {
      if (this.peek(1) === 0x3c) {
        return { type: "dict", raw: this.readBalancedRaw(0x3c, 0x3e, true) };
      }
      return { type: "hex", value: this.readHexString() };
    }
    if (b === 0x5b) {
      return { type: "array", raw: this.readBalancedRaw(0x5b, 0x5d) };
    }
    if (b === 0x2f) {
      this.next();
      return { type: "name", value: this.readName() };
    }
    if (b === 0x2b || b === 0x2d || (b >= 0x30 && b <= 0x39) || b === 0x2e) {
      return { type: "number", value: this.readNumber() };
    }

    const word = this.readWord();
    if (!word) return null;
    if (word.startsWith("/")) return { type: "name", value: word.slice(1) };
    const num = Number(word);
    if (!Number.isNaN(num) && /^[-+]?[\d.]/.test(word)) {
      return { type: "number", value: num };
    }
    return { type: "name", value: word };
  }

  private readLiteralString(): string {
    this.next();
    let depth = 1;
    const parts: number[] = [];
    while (!this.eof && depth > 0) {
      const b = this.next();
      if (b === 0x28) depth++;
      else if (b === 0x29) {
        depth--;
        if (depth === 0) break;
      } else if (b === 0x5c) {
        const e = this.next();
        if (e === 0x6e) parts.push(0x0a);
        else if (e === 0x72) parts.push(0x0d);
        else if (e === 0x74) parts.push(0x09);
        else if (e === 0x62) parts.push(0x08);
        else if (e === 0x66) parts.push(0x0c);
        else if (e >= 0x30 && e <= 0x37) {
          let oct = e - 0x30;
          for (let i = 0; i < 2 && this.peek() >= 0x30 && this.peek() <= 0x37; i++) {
            oct = oct * 8 + (this.next() - 0x30);
          }
          parts.push(oct);
        } else parts.push(e);
        continue;
      }
      parts.push(b);
    }
    return decodePdfString(Uint8Array.from(parts));
  }

  private readHexString(): string {
    this.next();
    const parts: number[] = [];
    while (!this.eof) {
      const b = this.peek();
      if (b === 0x3e) {
        this.next();
        break;
      }
      if (isWhitespace(b)) {
        this.next();
        continue;
      }
      const hi = this.hexNibble(this.next());
      let lo = hi;
      if (!isWhitespace(this.peek()) && this.peek() !== 0x3e) {
        lo = this.hexNibble(this.next());
      }
      parts.push((hi << 4) | lo);
    }
    return decodePdfString(Uint8Array.from(parts));
  }

  private hexNibble(b: number): number {
    if (b >= 0x30 && b <= 0x39) return b - 0x30;
    if (b >= 0x41 && b <= 0x46) return b - 0x41 + 10;
    if (b >= 0x61 && b <= 0x66) return b - 0x61 + 10;
    return 0;
  }

  private readBalancedRaw(open: number, close: number, doubleOpen = false): string {
    if (doubleOpen) this.next();
    else this.next();
    let depth = 1;
    const start = this.pos - (doubleOpen ? 2 : 1);
    while (!this.eof && depth > 0) {
      const b = this.next();
      if (b === open) depth++;
      if (b === close) depth--;
    }
    return decodePdfString(this.bytes.slice(start, this.pos));
  }

  private readNumber(): number {
    const start = this.pos;
    while (!this.eof) {
      const b = this.peek();
      if (
        (b >= 0x30 && b <= 0x39) ||
        b === 0x2e ||
        b === 0x2b ||
        b === 0x2d
      ) {
        this.next();
      } else break;
    }
    return Number(decodePdfString(this.bytes.slice(start, this.pos)));
  }

  private readName(): string {
    const parts: number[] = [];
    while (!this.eof) {
      const b = this.peek();
      if (isWhitespace(b) || isDelimiter(b)) break;
      parts.push(this.next());
    }
    return decodePdfString(Uint8Array.from(parts));
  }

  private readWord(): string {
    const start = this.pos;
    while (!this.eof && !isWhitespace(this.peek()) && !isDelimiter(this.peek())) {
      this.next();
    }
    return decodePdfString(this.bytes.slice(start, this.pos));
  }
}

function isDelimiter(b: number): boolean {
  return (
    b === 0x28 ||
    b === 0x29 ||
    b === 0x3c ||
    b === 0x3e ||
    b === 0x5b ||
    b === 0x5d ||
    b === 0x7b ||
    b === 0x7d ||
    b === 0x2f ||
    b === 0x25
  );
}

export function parseContentStream(bytes: Uint8Array): PdfOperation[] {
  const lexer = new ContentStreamLexer(bytes);
  const ops: PdfOperation[] = [];
  let operands: PdfToken[] = [];

  lexer.skipWhitespaceAndComments();
  let opStart = lexer.position;

  const flush = (operator: string, sourceEnd: number) => {
    ops.push({
      operands: [...operands],
      operator,
      sourceStart: opStart,
      sourceEnd,
    });
    operands = [];
    lexer.skipWhitespaceAndComments();
    opStart = lexer.position;
  };

  while (true) {
    const beforeToken = lexer.position;
    const token = lexer.readToken();
    if (!token) break;

    if (token.type === "name" && (KNOWN_OPERATORS.has(token.value) || SHOW_TEXT_OPS.has(token.value))) {
      flush(token.value, lexer.position);
    } else {
      if (operands.length === 0 && beforeToken === opStart) {
        opStart = beforeToken;
      }
      operands.push(token);
    }
  }

  return ops;
}

/** Rebuild stream from original bytes (no string re-encoding). */
export function serializeOperations(ops: PdfOperation[], sourceBytes: Uint8Array): Uint8Array {
  if (!ops.length) return new Uint8Array(0);

  // Only copy kept operator byte ranges — gaps can contain removed text operators.
  let total = ops.length > 0 ? ops.length - 1 : 0;
  for (const op of ops) {
    total += op.sourceEnd - op.sourceStart;
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (let i = 0; i < ops.length; i++) {
    const chunk = sourceBytes.subarray(ops[i].sourceStart, ops[i].sourceEnd);
    out.set(chunk, offset);
    offset += chunk.length;
    if (i + 1 < ops.length) {
      out[offset++] = 0x0a;
    }
  }
  return out;
}

export function getTextFromOperands(op: PdfOperation): string | null {
  if (op.operator === "Tj" || op.operator === "'" || op.operator === '"') {
    const s = op.operands[0];
    if (s?.type === "string" || s?.type === "hex") return s.value;
  }
  if (op.operator === "TJ" && op.operands[0]?.type === "array") {
    const raw = op.operands[0].raw;
    const matches = raw.match(/\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f\s]+>/g);
    return matches ? matches.map(decodeTokenFragment).join("") : null;
  }
  return null;
}

function decodeTokenFragment(fragment: string): string {
  if (fragment.startsWith("(")) {
    const lexer = new ContentStreamLexer(
      Uint8Array.from(fragment, (c) => c.charCodeAt(0))
    );
    const t = lexer.readToken();
    return t?.type === "string" ? t.value : fragment;
  }
  return fragment;
}
