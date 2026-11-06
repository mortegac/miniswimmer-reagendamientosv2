import { generateClient } from "aws-amplify/api";
import emailjs, { init } from "emailjs-com";

import { getParentUser, parentsAuthorizationsByCode, relationshipsByUserId, listLocations, coursesByLocation, schedulesByCourse } from "./queries";
import { createParentsAuthorization, updateParentsAuthorization, updateSessionDetail } from "./mutations";

// Configuración EmailJS — template dedicado de reagendamientos (contenido en html_content)
const EMAILJS_SERVICE = "service_ucb8wga";
const EMAILJS_TEMPLATE = "template_eedooa7";
init("Csc41asZklkk5HTWk");

const client = generateClient();

export const fetchParentByEmail = async (email: string): Promise<any> => {
  const res: any = await client.graphql({
    query: getParentUser,
    variables: { id: email },
    authMode: "apiKey",
  });
  return res?.data?.getV2Users || null;
};

export const createAuthorizationCode = async (userId: string): Promise<any> => {
  const code = String(Math.floor(10000000 + Math.random() * 90000000)); // 8 dígitos
  const res: any = await client.graphql({
    query: createParentsAuthorization,
    variables: { input: { code, status: "PENDING", userId } },
    authMode: "apiKey",
  });
  return res?.data?.createV2ParentsAuthorization || null;
};

const APP_URL = "https://reagendar.miniswimmer.cl";

export const sendCodeEmail = async (params: { email: string; name: string; code: string }) => {
  const appUrl = `${APP_URL}/${params.code}`;
  const htmlContent = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #6821A1;">Hola ${params.name},</h2>
      <p style="color: #334155; font-size: 15px;">
        Recibimos una solicitud de acceso al portal de reagendamientos de MiniSwimmer.
      </p>
      <p style="color: #334155; font-size: 15px;">Tu código de acceso es:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; background: #6821A1; color: #ffffff; font-size: 28px; letter-spacing: 8px; padding: 14px 28px; border-radius: 10px; font-weight: bold;">
          ${params.code}
        </span>
      </div>
      <p style="color: #334155; font-size: 15px;">
        Ingresa el código en
        <a href="${appUrl}" style="color: #7E4996; font-weight: bold;">${appUrl}</a>
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
        Si no solicitaste este código, puedes ignorar este mensaje.
      </p>
    </div>`;

  // Variables del template template_eedooa7: from_email (destinatario), asunto, html_content
  return emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    from_email: params.email,
    asunto: "Tu código de acceso MiniSwimmer",
    html_content: htmlContent,
  });
};

export const validateCode = async (code: string): Promise<any> => {
  const res: any = await client.graphql({
    query: parentsAuthorizationsByCode,
    variables: { code, filter: { status: { eq: "PENDING" } } },
    authMode: "apiKey",
  });
  const item = res?.data?.parentsAuthorizationsByCode?.items?.[0] || null;
  if (!item) return null;
  await client.graphql({
    query: updateParentsAuthorization,
    variables: { input: { id: item.id, status: "AUTHORIZED" } },
    authMode: "apiKey",
  });
  return item;
};

export const fetchStudentsWithSessions = async (userId: string): Promise<any[]> => {
  const res: any = await client.graphql({
    query: relationshipsByUserId,
    variables: { userId, limit: 100 },
    authMode: "apiKey",
  });
  return res?.data?.relationshipsByUserId?.items || [];
};

export const fetchLocations = async (): Promise<Record<string, any>> => {
  const res: any = await client.graphql({
    query: listLocations,
    variables: { limit: 500 },
    authMode: "apiKey",
  });
  const map: Record<string, any> = {};
  for (const l of res?.data?.listV2Locations?.items || []) map[l.id] = l;
  return map;
};

// ─── Wizard de reagendamiento ───────────────────────────────────────────────

export const fetchCoursesByLocation = async (locationId: string): Promise<any[]> => {
  const res: any = await client.graphql({
    query: coursesByLocation,
    variables: { filter: { locationId: { eq: locationId }, isActive: { eq: true } }, limit: 500 },
    authMode: "apiKey",
  });
  return res?.data?.listV2Courses?.items || [];
};

export const fetchSchedulesByCourse = async (courseId: string): Promise<any[]> => {
  const res: any = await client.graphql({
    query: schedulesByCourse,
    variables: { courseSchedulesId: courseId, limit: 200 },
    authMode: "apiKey",
  });
  return (res?.data?.schedulesByCourse?.items || []).filter((s: any) => s.isActive);
};

export const rescheduleSessionDetail = async (input: {
  id: string;
  date: string;
  day: string;
  month: string;
  year: string;
  courseId: string;
  scheduleId: string;
  locationId: string;
}): Promise<any> => {
  const res: any = await client.graphql({
    query: updateSessionDetail,
    variables: {
      input: {
        id: input.id,
        date: input.date,
        day: input.day,
        month: input.month,
        year: input.year,
        courseId: input.courseId,
        scheduleId: input.scheduleId,
        locationId: input.locationId,
        locationIdUsed: input.locationId,
        status: "RECOVERED",
      },
    },
    authMode: "apiKey",
  });
  return res?.data?.updateV2SessionDetail || null;
};

// Email de confirmación de reagendamiento al apoderado
export const sendRescheduleEmail = async (params: {
  email: string;
  name: string;
  oldDate: string;   // fecha original formateada
  newDate: string;   // nueva fecha formateada (destacada)
  newTime: string;   // horario nuevo
  sede: string;
  curso: string;
}) => {
  const htmlContent = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #6821A1;">Hola ${params.name},</h2>
      <p style="color: #334155; font-size: 15px;">
        Tu clase fue reagendada correctamente. Estos son los detalles del cambio:
      </p>
      <p style="color: #94a3b8; font-size: 13px; margin-bottom: 4px;">Fecha original</p>
      <p style="color: #64748b; font-size: 15px; margin-top: 0; text-decoration: line-through;">${params.oldDate}</p>
      <div style="text-align: center; margin: 20px 0; background: #f5f0fa; border: 1px solid #6821A1; border-radius: 12px; padding: 18px;">
        <p style="color: #6821A1; font-size: 13px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px;">Nueva fecha</p>
        <p style="color: #6821A1; font-size: 24px; font-weight: bold; margin: 0;">${params.newDate}</p>
        <p style="color: #7E4996; font-size: 16px; margin: 6px 0 0;">${params.newTime} hrs</p>
      </div>
      <table style="width: 100%; font-size: 15px; color: #334155; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #94a3b8; width: 90px;">Sede</td><td style="padding: 6px 0; font-weight: bold;">${params.sede}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">Curso</td><td style="padding: 6px 0; font-weight: bold;">${params.curso}</td></tr>
        <tr><td style="padding: 6px 0; color: #94a3b8;">Horario</td><td style="padding: 6px 0; font-weight: bold;">${params.newTime} hrs</td></tr>
      </table>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 28px;">
        Si tienes dudas, responde este correo o escríbenos a hola@miniswimmer.cl
      </p>
    </div>`;

  return emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    from_email: params.email,
    asunto: "Clase reagendada | Miniswimmer",
    html_content: htmlContent,
  });
};
