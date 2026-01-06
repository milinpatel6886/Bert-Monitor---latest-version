const COLUMN_NAMES = [
  "Symbol Name",
  "Source",
  "Buy",
  "Sell",
  "High",
  "Low",
  "Time",
];
const DEFAULT_RATE = "--";

const normalizeValue = (value) => {
  const val = String(value ?? "").trim();
  return val === "" || val === "-" || val === DEFAULT_RATE ? DEFAULT_RATE : val;
};

export const InnerTextFormat = (item) => {
  const innerText = item.inner_text || "";
  const sourceName = item.name;
  const results = [];
  const symbolsFound = new Set();

  let match;

  // --- NEW PATTERN 8 JR Bullion ---

  const tabSeparatedRegex =
    /((?:GOLD|SILVER).*?)(?:\s*--)?\t(-{2}|\d+\.?\d*)\t(-{2}|\d+\.?\d*)/gi;

  while ((match = tabSeparatedRegex.exec(innerText)) !== null) {
    const symbol = match[1].trim().replace(/\s*--\s*$/, "");

    if (!symbolsFound.has(symbol)) {
      results.push({
        "Symbol Name": symbol,
        Source: sourceName,
        Buy: normalizeValue(match[2]),
        Sell: normalizeValue(match[3]),
        High: DEFAULT_RATE,
        Low: DEFAULT_RATE,
        Time: DEFAULT_RATE,
      });
      symbolsFound.add(symbol);
    }
  }

  // --- Pattern 1: Header/Summary format ---
  const headerRegex =
    /((?:GOLD|SILVER|INR)\s*(?:\(\$|\(₹\))?)\s*\n(\d+\.?\d*)\s*\n(?:L\s*:|)(\s*\d+\.?\d*)\s*[|/]\s*(?:H\s*:|)(\s*\d+\.?\d*)/gi;
  while ((match = headerRegex.exec(innerText)) !== null) {
    const symbol = match[1].trim();
    if (!symbolsFound.has(symbol)) {
      results.push({
        "Symbol Name": symbol,
        Source: sourceName,
        Buy: normalizeValue(match[2]),
        Sell: normalizeValue(match[2]),
        Low: normalizeValue(match[3]),
        High: normalizeValue(match[4]),
        Time: DEFAULT_RATE,
      });
      symbolsFound.add(symbol);
    }
  }

  // --- Pattern 2: ARIHANT-style multiline ---
  const arihantRegex =
    /((?:GOLD|SILVER).*?)(?:\t|\s+)(-|\d+\.?\d*)\s*\nL\s*:\s*(-|\d+\.?\d*)\s*\n(?:\t|\s+)(-|\d+\.?\d*)\s*\nH\s*:\s*(-|\d+\.?\d*)/gi;
  while ((match = arihantRegex.exec(innerText)) !== null) {
    const symbol = match[1].trim();
    if (!symbolsFound.has(symbol)) {
      results.push({
        "Symbol Name": symbol,
        Source: sourceName,
        Buy: normalizeValue(match[2]),
        Sell: normalizeValue(match[4]),
        Low: normalizeValue(match[3]),
        High: normalizeValue(match[5]),
        Time: DEFAULT_RATE,
      });
      symbolsFound.add(symbol);
    }
  }

  // --- Pattern 3: COSTING/CURRENT/INDIA format ---
  const costingRegex =
    /((?:COSTING|INDIA|GOLD|SILVER|Future|Current)\s*\n?\s*(?:GOLD|SILVER)\s*)\t?(\d+\.?\d*)\t(\d+\.?\d*)\t(\d+\.?\d*)\s*(?:\/|\s+)\s*(\d+\.?\d*)/gi;
  while ((match = costingRegex.exec(innerText)) !== null) {
    const symbol = match[1].trim().replace(/\n/g, " ");
    if (!symbolsFound.has(symbol)) {
      results.push({
        "Symbol Name": symbol,
        Source: sourceName,
        Buy: normalizeValue(match[2]),
        Sell: normalizeValue(match[3]),
        High: normalizeValue(match[4]),
        Low: normalizeValue(match[5]),
        Time: DEFAULT_RATE,
      });
      symbolsFound.add(symbol);
    }
  }

  // --- Pattern 4: AUGMONT style ---
  const augmontRegex =
    /((?:GOLD|SILVER).*?)\t(\d+\.?\d*)\s*\nHigh\s*-\s*(\d+\.?\d*)\s*\n\t(\d+\.?\d*)\s*\nLow\s*-\s*(\s*\d+\.?\d*)\s*\n\t(\d{2}:\d{2}:\d{2})/gi;
  while ((match = augmontRegex.exec(innerText)) !== null) {
    const symbol = match[1].trim();
    if (!symbolsFound.has(symbol)) {
      results.push({
        "Symbol Name": symbol,
        Source: sourceName,
        Buy: normalizeValue(match[4]),
        Sell: normalizeValue(match[2]),
        High: normalizeValue(match[3]),
        Low: normalizeValue(match[5]),
        Time: normalizeValue(match[6]),
      });
      symbolsFound.add(symbol);
    }
  }

  // --- Pattern 5: ARYA/KUBERAN (delivery) ---
  const deliveryRegex =
    /((?:GOLD|SILVER).*?)s*(-|\d+\.?\d*)\s*(-|\d+\.?\d*)\s*(\d{2}[-/]\d{2}[-/]\d{2,4})/gi;
  while ((match = deliveryRegex.exec(innerText)) !== null) {
    const symbol = match[1].trim();
    const rate1 = normalizeValue(match[2]);
    const rate2 = normalizeValue(match[3]);
    const date = normalizeValue(match[4]);
    let buy = sourceName === "ARYA BULLION" ? DEFAULT_RATE : rate1;
    let sell = sourceName === "ARYA BULLION" ? rate1 : rate2;

    if (!symbolsFound.has(symbol)) {
      results.push({
        "Symbol Name": symbol,
        Source: sourceName,
        Buy: buy,
        Sell: sell,
        High: DEFAULT_RATE,
        Low: DEFAULT_RATE,
        Time: date,
      });
      symbolsFound.add(symbol);
    }
  }

  // --- Pattern 6: Single price lines (fallback) ---
  const singlePriceRegex =
    /((?:GOLD|SILVER).*?)(?:\s*|\t)(\d+\.?\d{1,2})\s*$/gim;
  while ((match = singlePriceRegex.exec(innerText)) !== null) {
    const symbol = match[1].trim().replace(/\s*--\s*$/, "");
    const price = normalizeValue(match[2]);
    if (
      !symbolsFound.has(symbol) &&
      symbol.length > 5 &&
      (symbol.toUpperCase().includes("GOLD") ||
        symbol.toUpperCase().includes("SILVER"))
    ) {
      results.push({
        "Symbol Name": symbol,
        Source: sourceName,
        Buy: price,
        Sell: price,
        High: DEFAULT_RATE,
        Low: DEFAULT_RATE,
        Time: DEFAULT_RATE,
      });
      symbolsFound.add(symbol);
    }
  }

  // --- Pattern 7: JR Bullion style ---
  const bullionRegex =
    /([A-Z0-9+() ]*(?:GOLD|SILVER)[A-Z0-9+() ]*(?:RAIPUR|MUMBAI)[A-Z0-9+() ]*|[A-Z0-9+() ]*(?:RAIPUR|MUMBAI)[A-Z0-9+() ]*(?:GOLD|SILVER)[A-Z0-9+() ]*)\s*\n\s*(-{2}|\d+)\s+(-{2}|\d+)\s+H-\s*(\d+)\s+L-\s*(\d+)/gi;
  while ((match = bullionRegex.exec(innerText)) !== null) {
    const symbol = match[1].trim();
    if (!symbolsFound.has(symbol)) {
      results.push({
        "Symbol Name": symbol,
        Source: sourceName,
        Buy: normalizeValue(match[2]),
        Sell: normalizeValue(match[3]),
        High: normalizeValue(match[4]),
        Low: normalizeValue(match[5]),
        Time: DEFAULT_RATE,
      });
      symbolsFound.add(symbol);
    }
  }

  // Final column mapping and cleaning
  return results
    .map((row) => {
      const fullRow = {};
      for (const col of COLUMN_NAMES) {
        fullRow[col] = row[col] || DEFAULT_RATE;
      }
      return fullRow;
    })
    .filter((row) => row["Symbol Name"] !== DEFAULT_RATE);
};
