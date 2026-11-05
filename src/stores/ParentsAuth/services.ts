import { generateClient } from "aws-amplify/api";
import emailjs, { init } from "emailjs-com";

import { getParentUser, parentsAuthorizationsByCode, relationshipsByUserId, listLocations } from "./queries";
import { createParentsAuthorization, updateParentsAuthorization } from "./mutations";

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

export const sendCodeEmail = async (params: { email: string; name: string; code: string }) => {
  const appUrl = window.location.origin;
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

  return emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_email: params.email,
    to_name: params.name,
    reply_to: "hola@miniswimmer.cl",
    from_name: "MiniSwimmer",
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
