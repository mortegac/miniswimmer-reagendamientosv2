import { generateClient } from "aws-amplify/api";
import emailjs, { init } from "emailjs-com";

import { getParentUser, parentsAuthorizationsByCode, relationshipsByUserId, listLocations } from "./queries";
import { createParentsAuthorization, updateParentsAuthorization } from "./mutations";

// Configuración EmailJS existente en el front admin
const EMAILJS_SERVICE = "service_ucb8wga";
const EMAILJS_TEMPLATE = "template_rbmzu0w";
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
  return emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_email: params.email,
    to_name: params.name,
    reply_to: "hola@miniswimmer.cl",
    from_name: "MiniSwimmer",
    to_code: params.code,
    to_link: appUrl,
    message: `Tu código de acceso es: ${params.code}. Ingresa en ${appUrl}`,
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
