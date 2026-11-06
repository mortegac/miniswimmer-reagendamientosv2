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
  iso: string;       // 2026-11-15
  label: string;     // Sábado 15 Nov · 10:30 - 11:15
  scheduleId: string;
};

// Próximas ocurrencias de los horarios del curso, máximo 15 días hacia adelante
function buildDateOptions(schedules: any[]): DateOption[] {
  const opts: DateOption[] = [];
  const start = new Date();
  for (let i = 1; i <= 15; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = d.getDay();
    for (const sch of schedules) {
      if (WEEKDAY[normalizeDay(sch.day)] !== dow) continue;
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      opts.push({
        iso,
        scheduleId: sch.id,
        label: `${DAY_NAME[dow]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${sch.startHour} - ${sch.endHour}`,
      });
    }
  }
  return opts.sort((a, b) => (a.iso + a.label > b.iso + b.label ? 1 : -1));
}

const STEPS = ["Sede", "Curso", "Fecha"];

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

  const locationList = useMemo(
    () => Object.values(locations).sort((a: any, b: any) => (a.name > b.name ? 1 : -1)),
    [locations]
  );

  const pickLocation = async (loc: any) => {
    setSelLocation(loc);
    setSelCourse(null);
    setSelDate(null);
    setError("");
    setLoading(true);
    try {
      setCourses(await fetchCoursesByLocation(loc.id));
      setStep(2);
    } catch {
      setError("No se pudieron cargar los cursos");
    } finally {
      setLoading(false);
    }
  };

  const pickCourse = async (course: any) => {
    setSelCourse(course);
    setSelDate(null);
    setError("");
    setLoading(true);
    try {
      const schedules = await fetchSchedulesByCourse(course.id);
      const opts = buildDateOptions(schedules);
      setDateOptions(opts);
      setStep(3);
      if (opts.length === 0) setError("Este curso no tiene fechas disponibles en los próximos 15 días");
    } catch {
      setError("No se pudieron cargar los horarios");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="flex flex-col h-full">
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
        <div className="space-y-2 overflow-y-auto">
          {locationList.map((loc: any) => (
            <button key={loc.id} type="button" onClick={() => pickLocation(loc)} className={optionClass(selLocation?.id === loc.id)}>
              <p className="text-slate-700 font-medium text-sm">{loc.name}</p>
              {loc.address && <p className="text-slate-400 text-xs mt-0.5">{loc.address}</p>}
            </button>
          ))}
        </div>
      )}

      {!loading && step === 2 && (
        <div className="space-y-2 overflow-y-auto">
          {courses.length === 0 && <p className="text-slate-400 text-sm">Esta sede no tiene cursos activos</p>}
          {courses.map((c: any) => (
            <button key={c.id} type="button" onClick={() => pickCourse(c)} className={optionClass(selCourse?.id === c.id)}>
              <p className="text-slate-700 font-medium text-sm">{c.title}</p>
              {c.description && <p className="text-slate-400 text-xs mt-0.5">{c.description}</p>}
            </button>
          ))}
        </div>
      )}

      {!loading && step === 3 && (
        <div className="space-y-2 overflow-y-auto">
          {dateOptions.map((opt) => (
            <button
              key={`${opt.iso}-${opt.scheduleId}-${opt.label}`}
              type="button"
              onClick={() => setSelDate(opt)}
              className={optionClass(selDate?.iso === opt.iso && selDate?.scheduleId === opt.scheduleId && selDate?.label === opt.label)}
            >
              <p className="text-slate-700 font-medium text-sm">{opt.label}</p>
            </button>
          ))}
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
