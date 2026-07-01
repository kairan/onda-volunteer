import { createContext, useContext, useState, type ReactNode } from "react";

export type Campus = {
  id: string;
  name: string;
  city: string;
  timezone: string;
};

export type TimezoneOption = {
  /** Canonical IANA zone stored on the campus */
  value: string;
  /** Human label with the principal city + equivalent cities in parentheses */
  label: string;
  /** UTC offset in minutes (standard time) — used for sorting */
  offset: number;
  /** Grouping bucket for the dropdown */
  region: string;
};

/**
 * Timezones grouped by shared offset & rules.
 * Cities that share the exact same zone (e.g. São Paulo = Brasília) are merged
 * onto a single principal IANA identifier, and the equivalents appear in the label.
 */
export const TIMEZONES: TimezoneOption[] = [
  // ── Brasil ──────────────────────────────────────────────────────────────
  { value: "America/Noronha", label: "Fernando de Noronha (UTC−02:00)", offset: -120, region: "Brasil" },
  {
    value: "America/Sao_Paulo",
    label: "Brasília / São Paulo / Rio / BH / Curitiba / Porto Alegre / Salvador / Recife / Fortaleza / Belém (UTC−03:00)",
    offset: -180,
    region: "Brasil",
  },
  { value: "America/Manaus", label: "Manaus / Cuiabá / Campo Grande / Porto Velho / Boa Vista (UTC−04:00)", offset: -240, region: "Brasil" },
  { value: "America/Rio_Branco", label: "Rio Branco / Eirunepé (UTC−05:00)", offset: -300, region: "Brasil" },

  // ── Américas ────────────────────────────────────────────────────────────
  { value: "America/Halifax", label: "Halifax / Atlantic Time (UTC−04:00)", offset: -240, region: "Américas" },
  { value: "America/New_York", label: "New York / Toronto / Miami / Washington · Eastern (UTC−05:00)", offset: -300, region: "Américas" },
  { value: "America/Chicago", label: "Chicago / Dallas / Houston / Mexico City · Central (UTC−06:00)", offset: -360, region: "Américas" },
  { value: "America/Denver", label: "Denver / Phoenix / Calgary · Mountain (UTC−07:00)", offset: -420, region: "Américas" },
  { value: "America/Los_Angeles", label: "Los Angeles / San Francisco / Vancouver / Seattle · Pacific (UTC−08:00)", offset: -480, region: "Américas" },
  { value: "America/Anchorage", label: "Anchorage · Alaska (UTC−09:00)", offset: -540, region: "Américas" },
  { value: "Pacific/Honolulu", label: "Honolulu · Hawaii (UTC−10:00)", offset: -600, region: "Américas" },
  { value: "America/Bogota", label: "Bogotá / Lima / Quito (UTC−05:00)", offset: -300, region: "Américas" },
  { value: "America/Caracas", label: "Caracas (UTC−04:00)", offset: -240, region: "Américas" },
  { value: "America/La_Paz", label: "La Paz / Santo Domingo / San Juan (UTC−04:00)", offset: -240, region: "Américas" },
  { value: "America/Santiago", label: "Santiago (UTC−04:00)", offset: -240, region: "Américas" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires / Montevideo / Asunción (UTC−03:00)", offset: -180, region: "Américas" },

  // ── Europa & África ─────────────────────────────────────────────────────
  { value: "Atlantic/Azores", label: "Azores (UTC−01:00)", offset: -60, region: "Europa & África" },
  { value: "Europe/London", label: "London / Lisboa / Dublin / Casablanca (UTC±00:00)", offset: 0, region: "Europa & África" },
  { value: "Europe/Paris", label: "Paris / Madrid / Berlin / Roma / Amsterdam / Bruxelas (UTC+01:00)", offset: 60, region: "Europa & África" },
  { value: "Africa/Lagos", label: "Lagos / Luanda / Kinshasa (UTC+01:00)", offset: 60, region: "Europa & África" },
  { value: "Europe/Athens", label: "Athens / Bucareste / Helsinki / Istambul (UTC+02:00)", offset: 120, region: "Europa & África" },
  { value: "Africa/Johannesburg", label: "Johannesburg / Maputo / Cairo (UTC+02:00)", offset: 120, region: "Europa & África" },
  { value: "Europe/Moscow", label: "Moscow / Nairóbi / Riyadh (UTC+03:00)", offset: 180, region: "Europa & África" },

  // ── Ásia & Oceania ──────────────────────────────────────────────────────
  { value: "Asia/Dubai", label: "Dubai / Abu Dhabi / Baku (UTC+04:00)", offset: 240, region: "Ásia & Oceania" },
  { value: "Asia/Karachi", label: "Karachi / Tashkent (UTC+05:00)", offset: 300, region: "Ásia & Oceania" },
  { value: "Asia/Kolkata", label: "Kolkata / Mumbai / Nova Delhi / Colombo (UTC+05:30)", offset: 330, region: "Ásia & Oceania" },
  { value: "Asia/Dhaka", label: "Dhaka / Almaty (UTC+06:00)", offset: 360, region: "Ásia & Oceania" },
  { value: "Asia/Bangkok", label: "Bangkok / Jacarta / Hanói (UTC+07:00)", offset: 420, region: "Ásia & Oceania" },
  { value: "Asia/Shanghai", label: "Shanghai / Pequim / Hong Kong / Singapura / Taipei / Manila / Perth (UTC+08:00)", offset: 480, region: "Ásia & Oceania" },
  { value: "Asia/Tokyo", label: "Tokyo / Seoul (UTC+09:00)", offset: 540, region: "Ásia & Oceania" },
  { value: "Australia/Sydney", label: "Sydney / Melbourne / Brisbane (UTC+10:00)", offset: 600, region: "Ásia & Oceania" },
  { value: "Pacific/Auckland", label: "Auckland / Wellington / Fiji (UTC+12:00)", offset: 720, region: "Ásia & Oceania" },

  // ── UTC ─────────────────────────────────────────────────────────────────
  { value: "UTC", label: "UTC (Tempo Universal Coordenado)", offset: 0, region: "UTC" },
];

export const TIMEZONE_REGIONS = ["Brasil", "Américas", "Europa & África", "Ásia & Oceania", "UTC"] as const;

/** Map any equivalent IANA alias to the canonical value stored in campus.timezone */
const TIMEZONE_ALIASES: Record<string, string> = {
  "America/Bahia": "America/Sao_Paulo",
  "America/Fortaleza": "America/Sao_Paulo",
  "America/Recife": "America/Sao_Paulo",
  "America/Belem": "America/Sao_Paulo",
  "America/Maceio": "America/Sao_Paulo",
  "America/Araguaina": "America/Sao_Paulo",
  "America/Cuiaba": "America/Manaus",
  "America/Campo_Grande": "America/Manaus",
  "America/Porto_Velho": "America/Manaus",
  "America/Boa_Vista": "America/Manaus",
  "America/Mexico_City": "America/Chicago",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "Europe/Lisbon": "Europe/London",
  "Europe/Madrid": "Europe/Paris",
  "Europe/Berlin": "Europe/Paris",
  "Africa/Luanda": "Africa/Lagos",
  "Africa/Maputo": "Africa/Johannesburg",
};

export function canonicalTimezone(tz: string): string {
  if (TIMEZONES.some((t) => t.value === tz)) return tz;
  return TIMEZONE_ALIASES[tz] ?? "America/Sao_Paulo";
}

const INITIAL: Campus[] = [
  { id: "sede", name: "Onda · Sede", city: "São Paulo, SP", timezone: "America/Sao_Paulo" },
  { id: "zona-sul", name: "Onda · Zona Sul", city: "São Paulo, SP", timezone: "America/Sao_Paulo" },
  { id: "campinas", name: "Onda · Campinas", city: "Campinas, SP", timezone: "America/Sao_Paulo" },
  { id: "rio", name: "Onda · Rio", city: "Rio de Janeiro, RJ", timezone: "America/Sao_Paulo" },
  { id: "bh", name: "Onda · BH", city: "Belo Horizonte, MG", timezone: "America/Sao_Paulo" },
];

type CampusContextValue = {
  campus: Campus;
  setCampusId: (id: string) => void;
  campuses: Campus[];
  addCampus: (data: Omit<Campus, "id">) => void;
  updateCampus: (id: string, data: Partial<Omit<Campus, "id">>) => void;
  removeCampus: (id: string) => void;
};

const CampusContext = createContext<CampusContextValue | undefined>(undefined);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [campuses, setCampuses] = useState<Campus[]>(INITIAL);
  const [campusId, setCampusId] = useState<string>(INITIAL[0].id);
  const campus = campuses.find((c) => c.id === campusId) ?? campuses[0];

  const addCampus: CampusContextValue["addCampus"] = (data) => {
    const id =
      data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 6);
    setCampuses((cs) => [...cs, { id, ...data, timezone: canonicalTimezone(data.timezone) }]);
  };
  const updateCampus: CampusContextValue["updateCampus"] = (id, data) => {
    setCampuses((cs) =>
      cs.map((c) =>
        c.id === id ? { ...c, ...data, timezone: data.timezone ? canonicalTimezone(data.timezone) : c.timezone } : c,
      ),
    );
  };
  const removeCampus: CampusContextValue["removeCampus"] = (id) => {
    setCampuses((cs) => {
      const next = cs.filter((c) => c.id !== id);
      if (id === campusId && next.length) setCampusId(next[0].id);
      return next;
    });
  };

  return (
    <CampusContext.Provider value={{ campus, setCampusId, campuses, addCampus, updateCampus, removeCampus }}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error("useCampus must be used within CampusProvider");
  return ctx;
}
