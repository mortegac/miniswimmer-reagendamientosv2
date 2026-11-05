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
            <span className="text-slate-500 hidden sm:inline">{parent?.name}</span>
            <Button variant="outline-secondary" rounded onClick={handleLogout} className="px-4 py-2">
              Salir
            </Button>
          </div>
        </div>

        <h1 className="text-2xl font-medium mt-6">Sesiones activas</h1>
        <p className="text-slate-500">Selecciona una sesión para ver el detalle</p>

        {isLoading && (
          <div className="flex justify-center py-20">
            <LoadingIcon color="#7E4996" icon="oval" className="w-10 h-10" />
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
              <div key={rel.id} className="box p-6 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lucide icon="User" className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium capitalize">
                      {student.name} {student.lastName}
                    </h2>
                    <p className="text-slate-400 text-sm capitalize">{rel.relationType?.toLowerCase()}</p>
                  </div>
                </div>

                {enrollments.length === 0 && (
                  <p className="text-slate-400 mt-4">Sin matrículas vigentes</p>
                )}

                {enrollments.map((enr: any) => {
                  const sessions = enr?.sessionDetails?.items || [];
                  if (sessions.length === 0) return null;
                  return (
                    <div key={enr.id} className="mt-4 border-t border-dashed pt-4">
                      <p className="font-medium text-primary">{enr.course?.title || "Curso"}</p>
                      <p className="text-slate-400 text-sm">{enr.scheduleName}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {[...sessions]
                          .sort((a: any, b: any) => (a.date > b.date ? 1 : -1))
                          .map((s: any) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSelectedSession({ ...s, studentName: `${student.name} ${student.lastName}` })}
                              className="flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-primary/5 hover:border-primary transition-colors text-left"
                            >
                              <span className="flex items-center gap-2">
                                <Lucide icon="Calendar" className="w-4 h-4 text-primary" />
                                <span className="capitalize">{formatDate(s.date)}</span>
                              </span>
                              <span className="text-slate-400 text-sm">
                                Sesión {s.sessionNumber ?? "—"}/{s.totalSessions ?? "—"}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

        {!isLoading && relationships.length === 0 && !errorMessage && (
          <div className="box p-8 mt-6 text-center text-slate-400">
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
