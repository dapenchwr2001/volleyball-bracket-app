"use client";

import { BracketTeam, BracketDivision } from "@/lib/types";

const DIV_META: Record<BracketDivision, { accent: string; light: string; emoji: string }> = {
  Gold:   { accent: "#D97706", light: "#FFFBEB", emoji: "🥇" },
  Silver: { accent: "#4B5563", light: "#F9FAFB", emoji: "🥈" },
  Bronze: { accent: "#B45309", light: "#FFF7ED", emoji: "🥉" },
  Iron:   { accent: "#2563EB", light: "#EFF6FF", emoji: "⚙️" },
  Wood:   { accent: "#15803D", light: "#F0FDF4", emoji: "🪵" },
};

/* ─── SVG sub-components (return <g> → must be inside <svg>) ─── */

function TeamSlot({
  x, y, w, h, seed, name, italic,
}: {
  x: number; y: number; w: number; h: number;
  seed?: number; name?: string; italic?: boolean;
}) {
  const seedW = 22;
  const textX = seed !== undefined ? x + seedW + 4 : x + 8;
  const raw = name ?? "TBD";
  const label = raw.length > 19 ? raw.slice(0, 18) + "…" : raw;

  return (
    <g>
      {seed !== undefined && (
        <text x={x + 6} y={y + 22} fontSize="12" fontWeight="bold" fill="#374151">
          {seed}.
        </text>
      )}
      <text
        x={textX} y={y + 22}
        fontSize="12"
        fontWeight={italic ? "400" : "700"}
        fill={italic ? "#9CA3AF" : "#111827"}
        fontStyle={italic ? "italic" : "normal"}
      >
        {label}
      </text>
      {/* score underline */}
      <text x={x + 8} y={y + 37} fontSize="8" fill="#C8C8C8">score</text>
      <line x1={x + 36} y1={y + 37} x2={x + w - 8} y2={y + 37} stroke="#E5E7EB" strokeWidth="1" />
    </g>
  );
}

function MatchBox({
  x, y, w, slotH, accent, top, bot, highlight, label,
}: {
  x: number; y: number; w: number; slotH: number; accent: string;
  top?: { seed?: number; name?: string; italic?: boolean };
  bot?: { seed?: number; name?: string; italic?: boolean };
  highlight?: boolean;
  label?: string;
}) {
  const h = slotH * 2;
  return (
    <g>
      {/* soft shadow */}
      <rect x={x + 2} y={y + 2} width={w} height={h} fill="#00000014" rx="5" />
      {/* box */}
      <rect
        x={x} y={y} width={w} height={h}
        fill={highlight ? `${accent}18` : "white"}
        stroke={accent}
        strokeWidth={highlight ? "2.2" : "1.5"}
        rx="5"
      />
      {/* slot divider */}
      <line
        x1={x + 2} y1={y + slotH}
        x2={x + w - 2} y2={y + slotH}
        stroke={accent} strokeWidth="0.8" opacity="0.3" strokeDasharray="4 3"
      />
      {label && (
        <text x={x + w - 6} y={y - 5} textAnchor="end" fontSize="8" fill="#B0B0B0">
          {label}
        </text>
      )}
      <TeamSlot x={x} y={y} w={w} h={slotH} {...(top ?? {})} />
      <TeamSlot x={x} y={y + slotH} w={w} h={slotH} {...(bot ?? {})} />
    </g>
  );
}

function ChampionBox({
  x, y, w, h, accent, light,
}: {
  x: number; y: number; w: number; h: number; accent: string; light: string;
}) {
  return (
    <g>
      <rect x={x + 3} y={y + 3} width={w} height={h} fill={`${accent}22`} rx="9" />
      <rect x={x} y={y} width={w} height={h} fill={light} stroke={accent} strokeWidth="2.5" rx="9" />
      <text
        x={x + w / 2} y={y + 17}
        textAnchor="middle" fontSize="9" fontWeight="bold" fill={accent}
        letterSpacing="2"
      >
        ★ CHAMPION ★
      </text>
      <line x1={x + 16} y1={y + 33} x2={x + w - 16} y2={y + 33} stroke={accent} strokeWidth="1.8" />
      <text x={x + 16} y={y + 52} fontSize="8" fill="#C8C8C8">score</text>
      <line x1={x + 44} y1={y + 52} x2={x + w - 16} y2={y + 52} stroke="#E5E7EB" strokeWidth="1" />
      <text
        x={x + w / 2} y={y + h - 7}
        textAnchor="middle" fontSize="7" fill={`${accent}70`}
      >
        (write winner name)
      </text>
    </g>
  );
}

/* ─── Main bracket SVG for 4-team format ─── */

function FourTeamSVG({ teams, division }: { teams: BracketTeam[]; division: BracketDivision }) {
  const { accent, light } = DIV_META[division];
  const T = teams;

  /* layout constants */
  const BW = 152, SH = 48, BH = SH * 2;
  const SF_X = 0, SF1_Y = 36;
  const GAP = 84;
  const SF2_Y = SF1_Y + BH + GAP;          // 36 + 96 + 84 = 216

  const SF1_MID = SF1_Y + SH;              // 84
  const SF2_MID = SF2_Y + SH;              // 264
  const F_MID = (SF1_MID + SF2_MID) / 2;  // 174

  const FIN_X = BW + 58;                   // 210
  const FIN_Y = F_MID - SH;               // 126
  const CX = BW + 26;                      // connector vertical x = 178

  const CHAMP_X = FIN_X + BW + 44;        // 406
  const CHAMP_W = 158, CHAMP_H = 72;
  const CHAMP_Y = F_MID - CHAMP_H / 2;    // 138

  const SVG_W = CHAMP_X + CHAMP_W + 6;    // 570
  const SVG_H = SF2_Y + BH + 10;          // 322

  /* 3rd place sub-SVG */
  const THIRD_W = BW + 50 + 158 + 6;
  const THIRD_MID = SH; // center of the 3rd-place match box

  return (
    <>
      {/* ── ROUND LABELS ── */}
      <svg
        viewBox={`0 0 ${SVG_W} 20`}
        style={{ width: "100%", display: "block" }}
        fontFamily="'Arial', sans-serif"
      >
        <text x={BW / 2} y={14} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#A0A0A0" letterSpacing="1">SEMIFINALS</text>
        <text x={FIN_X + BW / 2} y={14} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#A0A0A0" letterSpacing="1">FINALS</text>
        <text x={CHAMP_X + CHAMP_W / 2} y={14} textAnchor="middle" fontSize="9" fontWeight="bold" fill={accent} letterSpacing="1.5">CHAMPION</text>
      </svg>

      {/* ── MAIN BRACKET ── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ width: "100%", display: "block" }}
        fontFamily="'Arial', sans-serif"
        overflow="visible"
      >
        {/* connector SF1 → vertical → Finals */}
        <path
          d={`M${BW},${SF1_MID} H${CX} V${F_MID} H${FIN_X}`}
          fill="none" stroke="#D1D5DB" strokeWidth="1.8" strokeLinejoin="round"
        />
        {/* connector SF2 → vertical (meets above) */}
        <path
          d={`M${BW},${SF2_MID} H${CX} V${F_MID}`}
          fill="none" stroke="#D1D5DB" strokeWidth="1.8" strokeLinejoin="round"
        />
        {/* Finals → Champion dashed arrow */}
        <path
          d={`M${FIN_X + BW},${F_MID} H${CHAMP_X - 6}`}
          fill="none" stroke={accent} strokeWidth="2.2" strokeDasharray="6 3"
        />
        <polygon
          points={`${CHAMP_X},${F_MID} ${CHAMP_X - 9},${F_MID - 5} ${CHAMP_X - 9},${F_MID + 5}`}
          fill={accent}
        />

        {/* SF1: Seed 1 vs Seed 4 */}
        <MatchBox
          x={SF_X} y={SF1_Y} w={BW} slotH={SH} accent={accent}
          label="Match 1"
          top={{ seed: T[0]?.seed, name: T[0]?.team.name }}
          bot={{ seed: T[3]?.seed, name: T[3]?.team.name }}
        />

        {/* SF2: Seed 2 vs Seed 3 */}
        <MatchBox
          x={SF_X} y={SF2_Y} w={BW} slotH={SH} accent={accent}
          label="Match 2"
          top={{ seed: T[1]?.seed, name: T[1]?.team.name }}
          bot={{ seed: T[2]?.seed, name: T[2]?.team.name }}
        />

        {/* Finals */}
        <MatchBox
          x={FIN_X} y={FIN_Y} w={BW} slotH={SH} accent={accent}
          label="Finals"
          top={{ name: "Winner — Match 1", italic: true }}
          bot={{ name: "Winner — Match 2", italic: true }}
          highlight
        />

        {/* Champion box */}
        <ChampionBox x={CHAMP_X} y={CHAMP_Y} w={CHAMP_W} h={CHAMP_H} accent={accent} light={light} />
      </svg>

      {/* ── 3RD PLACE ── */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed #E5E7EB" }}>
        <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: "bold", color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "1.5px" }}>
          3rd Place Match — losers of both semifinals
        </p>
        <svg
          viewBox={`0 0 ${THIRD_W} ${BH}`}
          style={{ width: "100%", maxWidth: THIRD_W, display: "block" }}
          fontFamily="'Arial', sans-serif"
        >
          <MatchBox
            x={0} y={0} w={BW} slotH={SH} accent="#D97706"
            top={{ name: "Loser of Match 1", italic: true }}
            bot={{ name: "Loser of Match 2", italic: true }}
          />
          <path
            d={`M${BW},${THIRD_MID} H${BW + 40}`}
            fill="none" stroke="#D97706" strokeWidth="1.8" strokeDasharray="5 3"
          />
          <polygon
            points={`${BW + 40},${THIRD_MID} ${BW + 32},${THIRD_MID - 5} ${BW + 32},${THIRD_MID + 5}`}
            fill="#D97706"
          />
          {/* 3rd place box */}
          <rect x={BW + 3} y={3} width={3} height={BH - 6} fill="#00000014" rx="1" />
          <rect x={BW + 40} y={THIRD_MID - 34} width={158} height={68} fill="#FFFBEB" stroke="#D97706" strokeWidth="2" rx="7" />
          <text x={BW + 40 + 79} y={THIRD_MID - 20} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#B45309" letterSpacing="2">🥉 3RD PLACE</text>
          <line x1={BW + 56} y1={THIRD_MID - 2} x2={BW + 40 + 142} y2={THIRD_MID - 2} stroke="#D97706" strokeWidth="1.8" />
          <text x={BW + 56} y={THIRD_MID + 18} fontSize="8" fill="#C8C8C8">score</text>
          <line x1={BW + 84} y1={THIRD_MID + 18} x2={BW + 40 + 142} y2={THIRD_MID + 18} stroke="#E5E7EB" strokeWidth="1" />
          <text x={BW + 40 + 79} y={THIRD_MID + 30} textAnchor="middle" fontSize="7" fill="#D97706aa">(write winner name)</text>
        </svg>
      </div>
    </>
  );
}

/* ─── Seeding table ─── */
function SeedingTable({
  teams, poolNameById, accent,
}: {
  teams: BracketTeam[];
  poolNameById: Map<string, string>;
  accent: string;
}) {
  return (
    <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #F3F4F6" }}>
      <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: "bold", color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "1.5px" }}>
        Pool Seeding Reference
      </p>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
        <thead>
          <tr style={{ background: "#F9FAFB" }}>
            {["Seed", "Team", "Pool", "Pts", "Set ±"].map((h) => (
              <th
                key={h}
                style={{
                  border: "1px solid #E5E7EB",
                  padding: "4px 8px",
                  textAlign: h === "Team" ? "left" : "center",
                  color: "#374151",
                  fontWeight: 700,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map((bt, i) => (
            <tr key={bt.team.id} style={{ background: i % 2 === 0 ? "white" : "#F9FAFB" }}>
              <td style={{ border: "1px solid #E5E7EB", padding: "4px 8px", textAlign: "center", fontWeight: 700, color: accent }}>
                {bt.seed}
              </td>
              <td style={{ border: "1px solid #E5E7EB", padding: "4px 8px" }}>{bt.team.name}</td>
              <td style={{ border: "1px solid #E5E7EB", padding: "4px 8px", textAlign: "center", color: "#6B7280" }}>
                {poolNameById.get(bt.team.poolId) ?? bt.team.poolId}
              </td>
              <td style={{ border: "1px solid #E5E7EB", padding: "4px 8px", textAlign: "center", fontWeight: 700 }}>
                {bt.standing.fivbPoints}
              </td>
              <td style={{
                border: "1px solid #E5E7EB", padding: "4px 8px", textAlign: "center", fontWeight: 600,
                color: bt.standing.setDifference >= 0 ? "#15803D" : "#DC2626",
              }}>
                {bt.standing.setDifference > 0 ? "+" : ""}{bt.standing.setDifference}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Per-division print page ─── */

interface PrintBracketSheetProps {
  tournamentName: string;
  division: BracketDivision;
  teams: BracketTeam[];
  poolNameById: Map<string, string>;
  isLast: boolean;
}

export default function PrintBracketSheet({
  tournamentName, division, teams, poolNameById, isLast,
}: PrintBracketSheetProps) {
  const meta = DIV_META[division];
  const { accent, light } = meta;

  return (
    <div
      style={{
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        background: "white",
        padding: "18px 22px 14px",
        pageBreakAfter: isLast ? "auto" : "always",
        minHeight: "9in",
        boxSizing: "border-box",
      }}
    >
      {/* ── PAGE HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <p style={{ margin: 0, fontSize: 9, fontWeight: "bold", color: "#9CA3AF", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Volleyball Bracketeer
          </p>
          <h1 style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px", lineHeight: 1.15 }}>
            {tournamentName}
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#6B7280" }}>
            Fill in scores · Circle winners · Good luck!
          </p>
        </div>
        <div style={{
          background: light,
          border: `3px solid ${accent}`,
          borderRadius: 10,
          padding: "7px 18px",
          textAlign: "center",
          minWidth: 100,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>{meta.emoji}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: accent, marginTop: 3, letterSpacing: "1.5px" }}>
            {division.toUpperCase()}
          </div>
          <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 1, letterSpacing: "1px" }}>BRACKET</div>
        </div>
      </div>

      {/* accent bar */}
      <div style={{
        height: 5, marginBottom: 12,
        background: `linear-gradient(90deg, ${accent} 0%, ${light} 100%)`,
        borderRadius: 3,
      }} />

      {/* ── BRACKET CONTENT ── */}
      {teams.length >= 2 && teams.length <= 4 ? (
        <FourTeamSVG teams={teams} division={division} />
      ) : (
        <div style={{ color: "#6B7280", fontSize: 13, padding: "20px 0" }}>
          Bracket format not yet supported for {teams.length} teams.
        </div>
      )}

      {/* ── SEEDING TABLE ── */}
      <SeedingTable teams={teams} poolNameById={poolNameById} accent={accent} />

      {/* ── FOOTER ── */}
      <div style={{ marginTop: 14, textAlign: "center", fontSize: 8, color: "#D1D5DB" }}>
        🏐 Volleyball Bracketeer &nbsp;·&nbsp; Print, fill in by hand, and good luck out there!
      </div>
    </div>
  );
}
