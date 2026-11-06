import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
const PARENT_EMAIL = "mortegac@gmail.com";
test("tabs: alumno con sesiones primero y cambio al click", async ({ page }) => {
  await page.route("**/api.emailjs.com/**", r => r.fulfill({ status: 200, body: "OK" }));
  await page.goto("/");
  await page.locator("#email").fill(PARENT_EMAIL);
  await page.getByRole("button", { name: "Enviar código" }).click();
  await page.getByText("código de 8 dígitos", { exact: false }).waitFor({ timeout: 15000 });
  const out = execSync(`aws dynamodb scan --table-name v2ParentsAuthorization-u5x5i3ucwvc43j4peic26jnrlq-NONE --filter-expression "userId = :u AND #s = :p" --expression-attribute-names '{"#s":"status"}' --expression-attribute-values '{":u":{"S":"${PARENT_EMAIL}"},":p":{"S":"PENDING"}}' --profile MINISWIMMER-05FEB2026 --output json`).toString();
  const items = JSON.parse(out).Items.sort((a:any,b:any)=>a.createdAt.S<b.createdAt.S?1:-1);
  await page.locator("#code").fill(items[0].code.S);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL(/dashboard/);
  await expect(page.getByText("Sistema de Reagendamiento")).toBeVisible();

  // Primer tab = alumno CON sesiones (Alma) y su contenido visible por defecto
  const tabs = page.locator("div.border-b button");
  await expect(tabs.first()).toContainText("Alma", { timeout: 15000 });
  await expect(page.getByRole("button", { name: "Reagendar" }).first()).toBeVisible();

  // Click en otro tab → contenido cambia a "Sin sesiones próximas" y el estilo activo se mueve
  await tabs.nth(1).click();
  await expect(page.getByText("Sin sesiones próximas")).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("button", { name: "Reagendar" })).toHaveCount(0);
  await expect(tabs.nth(1)).toHaveClass(/border-primary/);
  await expect(tabs.first()).not.toHaveClass(/border-primary/);
  await page.screenshot({ path: "/tmp/tab2-shot.png" });

  // Volver al primero
  await tabs.first().click();
  await expect(page.getByRole("button", { name: "Reagendar" }).first()).toBeVisible();
});
