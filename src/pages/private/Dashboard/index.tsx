import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import LoadingIcon from "@/components/Base/LoadingIcon";
import { Slideover } from "@/components/Base/Headless";
import { Logo } from "../../public/Return/components/Logo";

import { useAppSelector, useAppDispatch } from "@/stores/hooks";
import { selectParentsAuth, loadDashboard, logout } from "@/stores/ParentsAuth/slice";
import { RescheduleWizard } from "./RescheduleWizard";

const DAYS: Record<string, string> = {
  monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves",
  friday: "Viernes", saturday: "Sábado", sunday: "Domingo",
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", jueves: "Jueves",
  viernes: "Viernes", sabado: "Sábado", domingo: "Domingo",
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
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!authorized || !parent) {
      navigate("/", { replace: true });
      return;
    }
    dispatch(loadDashboard(parent.id));
  }, []);

  const closeSlideover = () => setSelectedSession(null);

  // Reagendamiento exitoso: cerrar ventana y refrescar sesiones
  const handleRescheduled = () => {
    closeSlideover();
    if (parent) dispatch(loadDashboard(parent.id));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const isLoading = status === "loading";

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

        {!isLoading && relationships.length > 0 && (
          <div className="box mt-6 p-5 sm:p-6">
            {/* Tabs: un alumno por tab */}
            <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
              {relationships.map((rel: any, i: number) => {
                const st = rel?.student;
                if (!st) return null;
                const active = i === activeTab;
                return (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className={`px-4 py-2.5 text-sm font-medium capitalize whitespace-nowrap border-b-2 -mb-px transition-colors ${
                      active
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {st.name} {st.lastName}
                  </button>
                );
              })}
            </div>

            {[relationships[Math.min(activeTab, relationships.length - 1)]].map((rel: any) => {
              const student = rel?.student;
              if (!student) return null;
              const enrollments = student?.enrollments?.items || [];
              return (
                <div key={rel.id} className="mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lucide icon="User" className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium capitalize text-slate-700">
                        {student.name} {student.lastName}
                      </h2>
                      <p className="text-slate-400 text-sm">{RELATION_LABEL[rel.relationType] ?? rel.relationType}</p>
                    </div>
                  </div>

                  {enrollments.every((e: any) => (e?.sessionDetails?.items || []).filter(isUpcoming).length === 0) && (
                    <p className="text-slate-400 mt-3">Sin sesiones próximas</p>
                  )}

                  {enrollments.map((enr: any) => {
                  const sessions = (enr?.sessionDetails?.items || []).filter(isUpcoming);
                  if (sessions.length === 0) return null;
                  return (
                    <div key={enr.id} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[...sessions]
                        .sort((a: any, b: any) => (a.date > b.date ? 1 : -1))
                        .map((s: any) => {
                          const isRecovered = s.status === "RECOVERED";
                          return (
                            <div
                              key={s.id}
                              className={`rounded-xl border p-4 ${
                                isRecovered
                                  ? "bg-slate-100 border-slate-200 opacity-75"
                                  : "bg-white border-slate-200/80 shadow-[0px_3px_5px_#0000000b]"
                              }`}
                            >
                              <p className={`font-medium text-sm truncate ${isRecovered ? "text-slate-500" : "text-slate-700"}`}>
                                {s.course?.title || enr.course?.title || "Curso"}
                              </p>
                              <p className="text-slate-400 text-xs mt-0.5 capitalize">
                                {(DAYS[s.schedule?.day?.toLowerCase()] || s.schedule?.day || "—")} · {s.schedule?.startHour || "—"} hrs
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <Lucide icon="Calendar" className={`w-4 h-4 shrink-0 ${isRecovered ? "text-slate-400" : "text-primary"}`} />
                                <span className={`text-sm font-medium whitespace-nowrap ${isRecovered ? "text-slate-400" : "text-slate-600"}`}>
                                  {formatShortDate(s.date)}
                                </span>
                                <span className={`ml-auto text-[11px] rounded-md px-2 py-0.5 whitespace-nowrap border ${
                                  isRecovered
                                    ? "bg-slate-200 border-slate-300 text-slate-500"
                                    : "bg-slate-100 border-slate-200 text-slate-500"
                                }`}>
                                  {STATUS_LABEL[s.status] || s.status}
                                </span>
                              </div>
                              {isRecovered ? (
                                <div className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-400 rounded-full font-medium text-sm px-5 py-2.5 cursor-not-allowed select-none">
                                  <Lucide icon="Lock" className="w-3.5 h-3.5" />
                                  Reagendada
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSession({ ...s, studentName: `${student.name} ${student.lastName}` })}
                                  className="mt-4 w-full bg-primary/80 hover:bg-primary transition-colors text-white rounded-full font-medium text-sm px-5 py-2.5"
                                >
                                  Reagendar
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && relationships.length === 0 && !errorMessage && (
          <div className="rounded-xl bg-white/10 ring-1 ring-white/15 p-8 mt-6 text-center text-white/70">
            No encontramos estudiantes asociados a tu cuenta
          </div>
        )}
      </div>

      {/* Slideover: wizard de reagendamiento (incluye el resumen de la sesión en el paso 1) */}
      <Slideover open={!!selectedSession} onClose={closeSlideover}>
        <Slideover.Panel className="w-96">
          <Slideover.Title className="p-5">
            <h2 className="mr-auto text-base font-medium">Reagendar sesión</h2>
          </Slideover.Title>
          <Slideover.Description className="p-5 flex flex-col h-[calc(100%-65px)] overflow-y-auto">
            {selectedSession && (
              <RescheduleWizard
                session={selectedSession}
                locations={locations}
                onDone={handleRescheduled}
                onCancel={closeSlideover}
              />
            )}
          </Slideover.Description>
        </Slideover.Panel>
      </Slideover>
    </div>
  );
}

export default Dashboard;
