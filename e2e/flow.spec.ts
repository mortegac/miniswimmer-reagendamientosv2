import { test, expect } from "@playwright/test";
import { execSync } from "child_process";

const PARENT_EMAIL = "valentina.concha.ramirez@gmail.com";
const TABLE = "v2ParentsAuthorization-u5x5i3ucwvc43j4peic26jnrlq-NONE";
const PROFILE = "MINISWIMMER-05FEB2026";

// Obtiene el código PENDING más reciente del apoderado directamente de DynamoDB
function latestPendingCode(): string {
  const out = execSync(
    `aws dynamodb scan --table-name ${TABLE} ` +
      `--filter-expression "userId = :u AND #s = :p" ` +
      `--expression-attribute-names '{"#s":"status"}' ` +
      `--expression-attribute-values '{":u":{"S":"${PARENT_EMAIL}"},":p":{"S":"PENDING"}}' ` +
      `--profile ${PROFILE} --output json`
  ).toString();
  const items = JSON.parse(out).Items as any[];
  if (!items.length) throw new Error("No PENDING code found");
  items.sort((a, b) => (a.createdAt.S < b.createdAt.S ? 1 : -1));
  return items[0].code.S;
}

test("flujo completo: email → código → dashboard → slideover de sesión", async ({ page }) => {
  // Interceptar EmailJS para no enviar email real durante el test
  await page.route("**/api.emailjs.com/**", (route) =>
    route.fulfill({ status: 200, body: "OK" })
  );

  // Paso 1: ingresar email del apoderado
  await page.goto("/");
  await expect(page.getByText("Reagendamientos")).toBeVisible();
  await page.locator("#email").fill(PARENT_EMAIL);
  await page.getByRole("button", { name: "Enviar código" }).click();

  // Paso 2: pantalla de código
  await expect(page.getByText("código de 8 dígitos", { exact: false })).toBeVisible({ timeout: 15000 });

  // Leer el código generado desde DynamoDB (simula leer el email)
  const code = latestPendingCode();
  expect(code).toMatch(/^\d{8}$/);

  await page.locator("#code").fill(code);
  await page.getByRole("button", { name: "Ingresar" }).click();

  // Paso 3: dashboard privado
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  await expect(page.getByText("Sistema de Reagendamiento")).toBeVisible();
  await expect(page.getByText("Gonzalez Concha", { exact: false }).first()).toBeVisible({ timeout: 15000 });

  // Paso 4: seleccionar una sesión → wizard directo con resumen en el paso 1
  await page.getByRole("button", { name: "Reagendar" }).first().click();
  const panel = page.locator('[role="dialog"]');
  await expect(page.getByText("Reagendar sesión")).toBeVisible();
  await expect(panel.getByText("Fecha")).toBeVisible();
  await expect(panel.getByText("Horario")).toBeVisible();

  // Paso 1: sede
  await panel.locator("button.w-full.text-left").first().click();
  // Paso 2: curso (esperar carga de opciones)
  const courseBtn = panel.locator("button.w-full.text-left").first();
  await courseBtn.waitFor({ timeout: 20000 });
  await courseBtn.click();
  // Paso 3: fechas (máx 15 días)
  await expect(panel.getByRole("button", { name: "Finalizar" })).toBeVisible({ timeout: 20000 });

  // Cancelar cierra la ventana
  await panel.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByText("Reagendar sesión")).not.toBeVisible();
});
