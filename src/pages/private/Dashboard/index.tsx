import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import LoadingIcon from "@/components/Base/LoadingIcon";
import { Slideover } from "@/components/Base/Headless";
import { Logo } from "../../public/Return/components/Logo";

import { useAppSelector, useAppDispatch } from "@/stores/hooks";
import { selectParentsAuth, loadDashboard, logout } from "@/stores/ParentsAuth/slice";

const DAYS: Record<string, string> = {
  monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves",
  friday: "Viernes", saturday: "Sábado", sunday: "Domingo",
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", jueves: "Jueves",
  viernes: "Viernes", sabado: "Sábado", domingo: "Domingo",
};

const formatDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
// "14 Nov 2026"
const formatShortDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ""} ${y}`;
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "SESIÓN VIGENTE",
  RECOVERED: "SESIÓN RECUPERADA",
  USED: "SESIÓN UTILIZADA",
};

// Diccionario de relaciones (enum v2RelationType)
const RELATION_LABEL: Record<string, string> = {
  FATHER: "Padre",
  MOTHER: "Madre",
  GRANDMOTHER: "Abuela",
  GRANDFATHER: "Abuelo",
  UNCLE: "Tío",
  AUNT: "Tía",
  COUSIN: "Primo/a",
  FAMILYS_FRIEND: "Amigo de la familia",
  OTHER: "Otro",
  NONE: "",
};

// Solo sesiones desde hoy hacia adelante
const todayISO = new Date().toISOString().slice(0, 10);
const isUpcoming = (s: any) => (s?.date || "").slice(0, 10) >= todayISO;

function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { parent, authorized, status, relationships, locations, errorMessage } =
    useAppSelector(selectParentsAuth);

  const [selectedSession, setSelectedSession] = useState<any>(null);

  useEffect(() => {
    if (!authorized || !parent) {
      navigate("/", { replace: true });
      return;
    }
    dispatch(loadDashboard(parent.id));
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const isLoading = status === "loading";
  const location = selectedSession ? locations[selectedSession.locationId] : null;

  return (
    <div className="grid grid-cols-12 gap-y-6 gap-x-6 mt-4">
      <div className="col-span-12 sm:col-span-10 sm:col-start-2 max-w-4xl w-full mx-auto px-4 sm:px-0">
        <div className="flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-white hidden sm:inline">{parent?.name}</span>
            <Button variant="outline-secondary" rounded onClick={handleLogout} className="px-4 py-2 text-white border-white/60 hover:bg-white/10">
              Salir
            </Button>
          </div>
        </div>

        <h1 className="text-2xl font-medium mt-6 text-white">Sesiones activas</h1>
        <p className="text-white/80">Selecciona una sesión para ver el detalle</p>

        {isLoading && (
          <div className="flex justify-center py-20">
            <LoadingIcon color="#FFFFFF" icon="oval" className="w-10 h-10" />
          </div>
        )}

        {errorMessage && !isLoading && (
          <p className="text-red-500 mt-6">{errorMessage}</p>
        )}

        {!isLoading &&
          relationships.map((rel: any) => {
            const student = rel?.student;
            if (!student) return null;
            const enrollments = student?.enrollments?.items || [];
            return (
              <div key={rel.id} className="mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                    <Lucide icon="User" className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium capitalize text-white">
                      {student.name} {student.lastName}
                    </h2>
                    <p className="text-white/60 text-sm">{RELATION_LABEL[rel.relationType] ?? rel.relationType}</p>
                  </div>
                </div>

                {enrollments.every((e: any) => (e?.sessionDetails?.items || []).filter(isUpcoming).length === 0) && (
                  <p className="text-white/50 mt-3">Sin sesiones próximas</p>
                )}

                {enrollments.map((enr: any) => {
                  const sessions = (enr?.sessionDetails?.items || []).filter(isUpcoming);
                  if (sessions.length === 0) return null;
                  return (
                    <div key={enr.id} className="mt-3 space-y-3">
                      {[...sessions]
                        .sort((a: any, b: any) => (a.date > b.date ? 1 : -1))
                        .map((s: any) => (
                          <div key={s.id} className="rounded-xl overflow-hidden shadow-lg shadow-black/10 ring-1 ring-white/15">
                            {/* Header: DÍA-HORA | CURSO */}
                            <div className="flex items-center justify-between gap-2 bg-slate-900/80 text-white px-4 py-2">
                              <span className="font-bold tracking-wider uppercase text-xs sm:text-sm whitespace-nowrap">
                                {(DAYS[s.schedule?.day?.toLowerCase()] || s.schedule?.day || "—")}-{s.schedule?.startHour || "—"}
                              </span>
                              <span className="font-bold tracking-wider uppercase text-xs sm:text-sm text-right truncate">
                                {s.course?.title || enr.course?.title || "Curso"}
                              </span>
                            </div>
                            {/* Body compacto: fecha + estado + acción */}
                            <div className="flex items-center justify-between gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5">
                              <div className="flex items-center gap-3 min-w-0">
                                <Lucide icon="Calendar" className="w-4 h-4 text-white/70 shrink-0" />
                                <span className="text-white font-medium whitespace-nowrap">{formatShortDate(s.date)}</span>
                                <span className="hidden sm:inline-block bg-white/15 text-white/90 text-[11px] font-medium tracking-wide rounded-full px-3 py-1">
                                  {STATUS_LABEL[s.status] || s.status}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedSession({ ...s, studentName: `${student.name} ${student.lastName}` })}
                                className="shrink-0 bg-white text-primary hover:bg-white/90 transition-colors rounded-full font-semibold tracking-wider uppercase text-xs px-5 py-2"
                              >
                                Reagendar
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            );
          })}

        {!isLoading && relationships.length === 0 && !errorMessage && (
          <div className="rounded-xl bg-white/10 ring-1 ring-white/15 p-8 mt-6 text-center text-white/70">
            No encontramos estudiantes asociados a tu cuenta
          </div>
        )}
      </div>

      {/* Slideover: detalle de la sesión seleccionada */}
      <Slideover open={!!selectedSession} onClose={() => setSelectedSession(null)}>
        <Slideover.Panel className="w-96">
          <Slideover.Title className="p-5">
            <h2 className="mr-auto text-base font-medium">Detalle de la sesión</h2>
          </Slideover.Title>
          <Slideover.Description className="p-5 space-y-5">
            {selectedSession && (
              <>
                <div>
                  <p className="text-slate-400 text-sm">Estudiante</p>
                  <p className="font-medium capitalize">{selectedSession.studentName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Fecha</p>
                  <p className="font-medium capitalize">{formatDate(selectedSession.date)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Sede</p>
                  <p className="font-medium">{location?.name || selectedSession.locationId}</p>
                  {location?.address && <p className="text-slate-400 text-sm">{location.address}</p>}
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Curso</p>
                  <p className="font-medium">{selectedSession.course?.title || selectedSession.courseId}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Horario</p>
                  <p className="font-medium">
                    {selectedSession.schedule
                      ? `${DAYS[selectedSession.schedule.day?.toLowerCase()] || selectedSession.schedule.day} ${selectedSession.schedule.startHour} - ${selectedSession.schedule.endHour}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Sesión</p>
                  <p className="font-medium">
                    {selectedSession.sessionNumber ?? "—"} de {selectedSession.totalSessions ?? "—"}
                  </p>
                </div>
                <Button
                  variant="outline-secondary"
                  rounded
                  className="w-full py-3"
                  onClick={() => setSelectedSession(null)}
                >
                  Cerrar
                </Button>
              </>
            )}
          </Slideover.Description>
        </Slideover.Panel>
      </Slideover>
    </div>
  );
}

export default Dashboard;
