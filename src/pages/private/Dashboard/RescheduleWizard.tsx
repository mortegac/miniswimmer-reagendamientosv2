import { useState, useMemo } from "react";
import Lucide from "@/components/Base/Lucide";
import LoadingIcon from "@/components/Base/LoadingIcon";
import {
  fetchCoursesByLocation,
  fetchSchedulesByCourse,
  rescheduleSessionDetail,
} from "@/stores/ParentsAuth/services";

const WEEKDAY: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};
const DAY_NAME = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const normalizeDay = (d?: string) =>
  (d || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

type DateOption = {
  iso: string;        // 2026-11-15
  dateLabel: string;  // Sábado 15 Nov
  timeLabel: string;  // 10:30 - 11:15
  scheduleId: string;
};

// Próximas ocurrencias de los horarios del curso, máximo 20 días hacia adelante
function buildDateOptions(schedules: any[]): DateOption[] {
  const opts: DateOption[] = [];
  const start = new Date();
  for (let i = 1; i <= 20; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = d.getDay();
    for (const sch of schedules) {
      if (WEEKDAY[normalizeDay(sch.day)] !== dow) continue;
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      opts.push({
        iso,
        scheduleId: sch.id,
        dateLabel: `${DAY_NAME[dow]} ${d.getDate()} ${MONTHS[d.getMonth()]}`,
        timeLabel: `${sch.startHour} - ${sch.endHour}`,
      });
    }
  }
  return opts.sort((a, b) => (a.iso + a.timeLabel > b.iso + b.timeLabel ? 1 : -1));
}

// Comparación laxa de títulos de curso (ignora mayúsculas, acentos y símbolos)
const normTitle = (t?: string) =>
  (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// Rango etario del curso normalizado a meses ([inicio, fin])
const ageRangeMonths = (c: any): [number, number] => {
  const s = Number(c?.startingAge ?? 0);
  const e = Number(c?.endingAge ?? 100);
  if (c?.ageType === "MONTHS") return [s, e];
  if (c?.ageType === "YEARS") return [s * 12, e * 12];
  return [0, 1200]; // ALL: cualquier edad
};

const rangesOverlap = (a: [number, number], b: [number, number]) => a[0] <= b[1] && a[1] >= b[0];

// Cursos excluidos del reagendamiento
const isExcludedCourse = (title?: string) => {
  const t = (title || "").trim().toUpperCase();
  return t.includes("PERSONALIZADO") || t.startsWith("INTENSIVO");
};

const ageLabel = (c: any) => {
  if (!c?.ageType || c.ageType === "ALL") return "";
  const unit = c.ageType === "MONTHS" ? "meses" : "años";
  return `${c.startingAge} a ${c.endingAge} ${unit}`;
};

const STEPS = ["Sede", "Curso", "Fecha"];

const FULL_DAYS: Record<string, string> = {
  monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves",
  friday: "Viernes", saturday: "Sábado", sunday: "Domingo",
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", jueves: "Jueves",
  viernes: "Viernes", sabado: "Sábado", domingo: "Domingo",
};

const formatLongDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
};

const SESSION_STATUS: Record<string, string> = {
  ACTIVE: "SESIÓN VIGENTE",
  RECOVERED: "SESIÓN RECUPERADA",
  USED: "SESIÓN UTILIZADA",
};

interface Props {
  session: any;
  locations: Record<string, any>;
  onDone: () => void;
  onCancel: () => void;
}

export function RescheduleWizard({ session, locations, onDone, onCancel }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selLocation, setSelLocation] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selCourse, setSelCourse] = useState<any>(null);
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [selDate, setSelDate] = useState<DateOption | null>(null);
  const [saving, setSaving] = useState(false);

  // Solo sedes visibles y activas, agrupadas por "group"
  const locationGroups = useMemo(() => {
    const visible = Object.values(locations).filter(
      (l: any) => l.isActive === true && l.isVisible === true
    );
    const groups: Record<string, any[]> = {};
    for (const l of visible) (groups[l.group || "OTRAS"] ??= []).push(l);
    return Object.entries(groups)
      .map(([group, items]) => [group, items.sort((a: any, b: any) => (a.name > b.name ? 1 : -1))] as [string, any[]])
      .sort((a, b) => (a[0] > b[0] ? 1 : -1));
  }, [locations]);

  const pickLocation = async (loc: any) => {
    setSelLocation(loc);
    setSelCourse(null);
    setSelDate(null);
    setError("");
    setLoading(true);
    try {
      // Excluir cursos PERSONALIZADO / INTENSIVO*
      const all = (await fetchCoursesByLocation(loc.id)).filter((c: any) => !isExcludedCourse(c.title));
      // Solo el curso asociado a la sesión que se reagenda (por id o título equivalente)
      const target = normTitle(session?.course?.title);
      const matched = all.filter(
        (c: any) => c.id === session?.courseId || (target && normTitle(c.title) === target)
      );
      // Fallback: cursos cuyo rango etario se solapa con el del curso de la sesión
      const sessionRange = ageRangeMonths(session?.course);
      const ageCompatible = all.filter((c: any) => rangesOverlap(ageRangeMonths(c), sessionRange));
      const visible = matched.length > 0 ? matched : ageCompatible;
      // Pre-cargar los horarios de cada curso para mostrarlos en la card
      const withSchedules = await Promise.all(
        visible.map(async (c: any) => ({ ...c, schedules: await fetchSchedulesByCourse(c.id) }))
      );
      setCourses(withSchedules);
      setStep(2);
      if (matched.length === 0 && ageCompatible.length === 0)
        setError("Esta sede no tiene cursos compatibles con la edad del alumno");
    } catch {
      setError("No se pudieron cargar los cursos");
    } finally {
      setLoading(false);
    }
  };

  const pickCourse = (course: any) => {
    setSelCourse(course);
    setSelDate(null);
    setError("");
    const opts = buildDateOptions(course.schedules || []);
    setDateOptions(opts);
    setStep(3);
    if (opts.length === 0) setError("Este curso no tiene fechas disponibles en los próximos 20 días");
  };

  const finish = async () => {
    if (!selDate || !selLocation || !selCourse) return;
    setSaving(true);
    setError("");
    try {
      const [y, m, d] = selDate.iso.split("-");
      await rescheduleSessionDetail({
        id: session.id,
        date: `${selDate.iso}T00:00:00.000Z`,
        day: d,
        month: m,
        year: y,
        courseId: selCourse.id,
        scheduleId: selDate.scheduleId,
        locationId: selLocation.id,
      });
      onDone();
    } catch (e) {
      console.error("reschedule error", e);
      setError("No se pudo guardar el reagendamiento. Intenta nuevamente.");
      setSaving(false);
    }
  };

  const optionClass = (active: boolean) =>
    `w-full text-left px-4 py-3 rounded-xl border transition-colors ${
      active
        ? "border-primary bg-primary/5 ring-1 ring-primary"
        : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
    }`;

  const sessionLocation = locations[session?.locationId];

  return (
    <div className="flex flex-col h-full">
      {/* Resumen de la sesión a reagendar (visible en todos los pasos) */}
      {(
        <div className="divide-y divide-slate-100 text-sm border-b border-slate-100 mb-4 pb-2">
          {[
            ["Fecha", <span className="capitalize">{formatLongDate(session?.date)}</span>],
            ["Sede", sessionLocation?.name || session?.locationId],
            ["Curso", session?.course?.title || session?.courseId],
            ["Horario", session?.schedule
              ? `${FULL_DAYS[session.schedule.day?.toLowerCase()] || session.schedule.day} ${session.schedule.startHour} - ${session.schedule.endHour}`
              : "—"],
          ].map(([label, value]) => (
            <div key={label as string} className="py-2 flex items-start justify-between gap-4">
              <span className="text-slate-400 shrink-0">{label}</span>
              <span className="text-slate-700 font-medium text-right">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Indicador de pasos */}
      <div className="flex items-center gap-2 mb-5">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  done ? "bg-primary text-white" : active ? "bg-primary/15 text-primary ring-1 ring-primary" : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Lucide icon="Check" className="w-3.5 h-3.5" /> : n}
              </div>
              <span className={`text-xs ${active ? "text-primary font-medium" : "text-slate-400"}`}>{label}</span>
              {n < STEPS.length && <div className="w-5 h-px bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <LoadingIcon color="#7E4996" icon="oval" className="w-8 h-8" />
        </div>
      )}

      {!loading && step === 1 && (
        <div className="space-y-4 overflow-y-auto">
          {locationGroups.map(([group, items]) => (
            <div key={group}>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-2">{group}</p>
              <div className="space-y-2">
                {items.map((loc: any) => (
                  <button key={loc.id} type="button" onClick={() => pickLocation(loc)} className={optionClass(selLocation?.id === loc.id)}>
                    <p className="text-slate-700 font-medium text-sm">{loc.name}</p>
                    {loc.address && <p className="text-slate-400 text-xs mt-0.5">{loc.address}</p>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && step === 2 && (
        <div className="space-y-2 overflow-y-auto">
          {courses.length === 0 && <p className="text-slate-400 text-sm">Esta sede no tiene cursos activos</p>}
          {courses.map((c: any) => (
            <button key={c.id} type="button" onClick={() => pickCourse(c)} className={optionClass(selCourse?.id === c.id)}>
              <p className="text-slate-700 font-medium text-sm">{c.title}</p>
              {ageLabel(c) && <p className="text-slate-400 text-xs mt-0.5">{ageLabel(c)}</p>}
              {(c.schedules || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.schedules.map((sch: any) => (
                    <span key={sch.id} className="bg-slate-100 border border-slate-200 text-slate-500 text-[11px] rounded-full px-2.5 py-0.5 capitalize">
                      {sch.day} {sch.startHour} - {sch.endHour}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && step === 3 && (
        <div className="grid grid-cols-2 gap-2 overflow-y-auto content-start">
          {dateOptions.map((opt) => {
            const active = selDate?.iso === opt.iso && selDate?.scheduleId === opt.scheduleId && selDate?.timeLabel === opt.timeLabel;
            return (
              <button
                key={`${opt.iso}-${opt.scheduleId}-${opt.timeLabel}`}
                type="button"
                onClick={() => setSelDate(opt)}
                className={`flex flex-col items-center justify-center text-center px-3 py-4 rounded-xl border transition-colors ${
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                }`}
              >
                <p className="text-slate-700 font-semibold text-base leading-tight">{opt.dateLabel}</p>
                <p className="text-slate-400 text-xs mt-1">{opt.timeLabel}</p>
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      {/* Acciones */}
      <div className="mt-auto pt-5 space-y-2">
        {step === 3 && (
          <button
            type="button"
            disabled={!selDate || saving}
            onClick={finish}
            className="w-full bg-primary/80 hover:bg-primary disabled:opacity-40 transition-colors text-white rounded-full font-medium text-sm px-5 py-2.5"
          >
            {saving ? "Guardando…" : "Finalizar"}
          </button>
        )}
        <div className="flex gap-2">
          {step > 1 && (
            <button
              type="button"
              disabled={saving}
              onClick={() => { setError(""); setStep(step - 1); }}
              className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-full text-sm px-5 py-2.5"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-full text-sm px-5 py-2.5"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
