import { NextRequest, NextResponse } from "next/server";
import https from "node:https";

const OVR_URL = "https://www.members.ovr.org/public/template/standings.php";

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" }, rejectUnauthorized: false }, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("Request timed out")); });
  });
}

export interface OVRTeam {
  rank: number;
  teamCode: string;
  teamName: string;
  tournaments: number;
  totalPoints: number;
  avgPoints: number;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "–")
    .replace(/&#8211;/g, "–")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseOVRTable(html: string): OVRTeam[] {
  const teams: OVRTeam[] = [];

  // OVR table structure (10 cols): code | name | champ-rank | T | total | avg | all-rank | T | total | avg
  // We use the "OVR Champ Rank" (col 2) for seeding, which is what's shown on tournament pages.
  const COL = { code: 0, name: 1, rank: 2, t: 3, total: 4, avg: 5 };

  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    if (/<th/i.test(rowHtml)) continue; // skip header rows

    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let tdMatch: RegExpExecArray | null;
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      cells.push(stripTags(tdMatch[1]));
    }

    if (cells.length < 6) continue;

    const rank = parseInt(cells[COL.rank]) || 0;
    const teamCode = cells[COL.code].replace(/\s+/g, "");
    const teamName = cells[COL.name];
    const tournaments = parseInt(cells[COL.t]) || 0;
    const totalPoints = parseFloat(cells[COL.total]) || 0;
    const avgPoints = parseFloat(cells[COL.avg]) || 0;

    if (!teamName || !teamCode || rank === 0) continue;

    teams.push({ rank, teamCode, teamName, tournaments, totalPoints, avgPoints });
  }

  return teams.sort((a, b) => a.rank - b.rank);
}

export async function GET(req: NextRequest) {
  const div = req.nextUrl.searchParams.get("div");
  if (!div || !/^[GB]\d{1,2}[A-Z]$/.test(div)) {
    return NextResponse.json({ error: "Invalid div param (e.g. G17N)" }, { status: 400 });
  }

  try {
    const html = await httpsGet(`${OVR_URL}?div=${div}`);
    const teams = parseOVRTable(html);
    return NextResponse.json({ div, teams, fetchedAt: new Date().toISOString() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ovr-rankings]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
