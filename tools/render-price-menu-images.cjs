"use strict";

const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const WIDTH = 1400;
const MARGIN = 72;
const CONTENT = WIDTH - MARGIN * 2;
const COLORS = {
  navy: "#101f2b",
  navySoft: "#eaf0f4",
  gold: "#dfbd5f",
  goldSoft: "#fff7df",
  ink: "#17242d",
  muted: "#53636d",
  line: "#cbd3d8",
  white: "#ffffff",
  canvas: "#f4f2ec",
};
const FONT = "'Noto Sans CJK JP','Hiragino Sans','Yu Gothic',sans-serif";

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function text(x, y, value, size, weight = 400, fill = COLORS.ink, anchor = "start") {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${escapeXml(value)}</text>`;
}

function table(x, y, width, rows, columns, headerLabels, widths) {
  const headerHeight = 66;
  const rowHeight = 74;
  const totalHeight = headerHeight + rowHeight * rows.length;
  let svg = `<rect x="${x}" y="${y}" width="${width}" height="${totalHeight}" rx="8" fill="${COLORS.white}" stroke="${COLORS.line}" stroke-width="2"/>`;
  svg += `<path d="M${x + 8} ${y}h${width - 16}a8 8 0 0 1 8 8v${headerHeight - 8}H${x}V${y + 8}a8 8 0 0 1 8-8z" fill="${COLORS.navy}"/>`;
  let cx = x;
  headerLabels.forEach((label, index) => {
    const colWidth = width * widths[index];
    svg += text(cx + 22, y + 43, label, 23, 700, COLORS.white);
    cx += colWidth;
    if (index < headerLabels.length - 1) {
      svg += `<line x1="${cx}" y1="${y}" x2="${cx}" y2="${y + totalHeight}" stroke="${COLORS.line}" stroke-width="2"/>`;
    }
  });
  rows.forEach((row, rowIndex) => {
    const rowY = y + headerHeight + rowHeight * rowIndex;
    if (rowIndex % 2 === 1) {
      svg += `<rect x="${x}" y="${rowY}" width="${width}" height="${rowHeight}" fill="#f8fafb"/>`;
    }
    svg += `<line x1="${x}" y1="${rowY}" x2="${x + width}" y2="${rowY}" stroke="${COLORS.line}" stroke-width="2"/>`;
    let cellX = x;
    columns.forEach((key, colIndex) => {
      const value = row[key];
      const isPrice = key === "price";
      svg += text(
        cellX + 22,
        rowY + 48,
        value,
        isPrice ? 29 : 27,
        isPrice ? 700 : colIndex === 0 ? 700 : 400,
        isPrice ? "#7b5707" : COLORS.ink,
      );
      cellX += width * widths[colIndex];
    });
  });
  let dividerX = x;
  widths.slice(0, -1).forEach((ratio) => {
    dividerX += width * ratio;
    svg += `<line x1="${dividerX}" y1="${y}" x2="${dividerX}" y2="${y + totalHeight}" stroke="${COLORS.line}" stroke-width="2"/>`;
  });
  return { svg, height: totalHeight };
}

function buildMenu({ title, mainRows }) {
  let y = 0;
  const parts = [];
  const mainTableHeight = 66 + 74 * mainRows.length;
  const feeTableHeight = 66 + 74 * 5;
  const height = 190 + 74 + mainTableHeight + 88 + 112 + feeTableHeight + 190;

  parts.push(`<rect width="${WIDTH}" height="${height}" fill="${COLORS.canvas}"/>`);
  parts.push(`<rect width="${WIDTH}" height="190" fill="${COLORS.navy}"/>`);
  parts.push(`<rect x="${MARGIN}" y="148" width="150" height="8" fill="${COLORS.gold}"/>`);
  parts.push(text(MARGIN, 86, title, 54, 700, COLORS.white));
  parts.push(text(MARGIN, 132, "税込の作業料金と、許可業者による処分費の目安", 25, 400, "#dfe7ec"));
  y = 226;
  parts.push(text(MARGIN, y, "片付け・整理作業料金", 34, 700));
  y += 36;
  const main = table(
    MARGIN,
    y,
    CONTENT,
    mainRows,
    ["label", "price"],
    ["間取り・区分", "作業料金目安（税込）"],
    [0.5, 0.5],
  );
  parts.push(main.svg);
  y += main.height + 72;
  parts.push(`<rect x="${MARGIN}" y="${y - 14}" width="${CONTENT}" height="${112 + feeTableHeight + 42}" rx="12" fill="${COLORS.goldSoft}" stroke="#d9bd6a" stroke-width="2"/>`);
  parts.push(text(MARGIN + 28, y + 30, "許可業者による収集運搬・処分費の目安", 32, 700));
  parts.push(text(MARGIN + 28, y + 70, "作業料金とは別に、実際の量と種類に応じた費用がかかります。", 23, 400, COLORS.muted));
  y += 94;
  const fees = table(
    MARGIN + 28,
    y,
    CONTENT - 56,
    [
      { label: "少量", volume: "約1㎥まで", price: "2～3万円" },
      { label: "軽トラック相当", volume: "約2㎥", price: "3～5万円" },
      { label: "2トントラック相当", volume: "約3～5㎥", price: "5～10万円" },
      { label: "4トントラック相当", volume: "約8㎥", price: "11～15万円" },
      { label: "一軒家・複数台", volume: "8㎥以上", price: "現地見積もり" },
    ],
    ["label", "volume", "price"],
    ["ごみの量", "容量の目安", "税込料金の目安"],
    [0.37, 0.25, 0.38],
  );
  parts.push(fees.svg);
  y += fees.height + 74;
  parts.push(`<line x1="${MARGIN}" y1="${y - 28}" x2="${WIDTH - MARGIN}" y2="${y - 28}" stroke="${COLORS.gold}" stroke-width="3"/>`);
  parts.push(text(MARGIN, y + 4, "※ 表示価格は税込の目安です。収集運搬・処分費は別途お見積もりです。", 22, 600, COLORS.ink));
  parts.push(text(MARGIN, y + 42, "※ 廃棄物の収集運搬・処分は袋井市の許可業者が行います。", 22, 400, COLORS.muted));
  parts.push(text(MARGIN, y + 80, "※ 家電リサイクル品、金庫、ピアノなどは別途費用となる場合があります。", 22, 400, COLORS.muted));
  parts.push(text(MARGIN, y + 118, "※ 正式金額は現地確認後にご案内します。", 22, 400, COLORS.muted));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}">${parts.join("")}</svg>`;
}

async function render(filename, data) {
  const svg = buildMenu(data);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, quality: 100 }).toFile(path.join(ROOT, "assets", filename));
}

Promise.all([
  render("menu-estate-clearance.png", {
    title: "遺品整理　料金目安",
    mainRows: [
      { label: "1R～1K", price: "3～8万円" },
      { label: "1DK", price: "5～12万円" },
      { label: "1LDK", price: "7～20万円" },
      { label: "2DK", price: "9～25万円" },
      { label: "2LDK", price: "12～30万円" },
      { label: "3DK", price: "15～40万円" },
      { label: "3LDK", price: "17～50万円" },
      { label: "4DK以上", price: "22～60万円" },
    ],
  }),
  render("menu-hoarding-cleanup.png", {
    title: "ゴミ屋敷の片付け　料金目安",
    mainRows: [
      { label: "1K～1DK", price: "5～10万円" },
      { label: "1LDK～2DK", price: "8～18万円" },
      { label: "2LDK～3DK", price: "15～25万円" },
      { label: "3LDK～4DK", price: "20～35万円" },
      { label: "4LDK以上", price: "30～50万円" },
    ],
  }),
]).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
