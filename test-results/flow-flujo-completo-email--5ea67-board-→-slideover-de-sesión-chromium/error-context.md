# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flow.spec.ts >> flujo completo: email → código → dashboard → slideover de sesión
- Location: e2e/flow.spec.ts:23:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Sesiones activas')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Sesiones activas') with timeout 5000ms
  - waiting for getByText('Sesiones activas')

```

```yaml
- img
- text: Valentina Concha Ramirez
- button "Salir"
- heading "Sistema de Reagendamiento" [level=1]
- paragraph: Seleccione al Alumno para ver sus sesiones
- button "Belen Gonzalez Concha"
- button "Rafael Gonzalez Concha"
- img
- heading "Belen Gonzalez Concha" [level=2]
- paragraph: Madre
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 15 Nov 2026 SESIÓN VIGENTE
- button "Reagendar"
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 22 Nov 2026 SESIÓN VIGENTE
- button "Reagendar"
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 29 Nov 2026 SESIÓN VIGENTE
- button "Reagendar"
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 6 Dic 2026 SESIÓN VIGENTE
- button "Reagendar"
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 13 Dic 2026 SESIÓN VIGENTE
- button "Reagendar"
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 20 Dic 2026 SESIÓN VIGENTE
- button "Reagendar"
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 27 Dic 2026 SESIÓN VIGENTE
- button "Reagendar"
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 3 Ene 2027 SESIÓN VIGENTE
- button "Reagendar"
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 17 Ene 2027 SESIÓN VIGENTE
- button "Reagendar"
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 31 Ene 2027 SESIÓN VIGENTE
- button "Reagendar"
- paragraph: Bebes 2 a 23 Meses
- paragraph: Domingo · 10:00 hrs
- img
- text: 7 Feb 2027 SESIÓN VIGENTE
- button "Reagendar"
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { execSync } from "child_process";
  3  | 
  4  | const PARENT_EMAIL = "valentina.concha.ramirez@gmail.com";
  5  | const TABLE = "v2ParentsAuthorization-u5x5i3ucwvc43j4peic26jnrlq-NONE";
  6  | const PROFILE = "MINISWIMMER-05FEB2026";
  7  | 
  8  | // Obtiene el código PENDING más reciente del apoderado directamente de DynamoDB
  9  | function latestPendingCode(): string {
  10 |   const out = execSync(
  11 |     `aws dynamodb scan --table-name ${TABLE} ` +
  12 |       `--filter-expression "userId = :u AND #s = :p" ` +
  13 |       `--expression-attribute-names '{"#s":"status"}' ` +
  14 |       `--expression-attribute-values '{":u":{"S":"${PARENT_EMAIL}"},":p":{"S":"PENDING"}}' ` +
  15 |       `--profile ${PROFILE} --output json`
  16 |   ).toString();
  17 |   const items = JSON.parse(out).Items as any[];
  18 |   if (!items.length) throw new Error("No PENDING code found");
  19 |   items.sort((a, b) => (a.createdAt.S < b.createdAt.S ? 1 : -1));
  20 |   return items[0].code.S;
  21 | }
  22 | 
  23 | test("flujo completo: email → código → dashboard → slideover de sesión", async ({ page }) => {
  24 |   // Interceptar EmailJS para no enviar email real durante el test
  25 |   await page.route("**/api.emailjs.com/**", (route) =>
  26 |     route.fulfill({ status: 200, body: "OK" })
  27 |   );
  28 | 
  29 |   // Paso 1: ingresar email del apoderado
  30 |   await page.goto("/");
  31 |   await expect(page.getByText("Reagendamientos")).toBeVisible();
  32 |   await page.locator("#email").fill(PARENT_EMAIL);
  33 |   await page.getByRole("button", { name: "Enviar código" }).click();
  34 | 
  35 |   // Paso 2: pantalla de código
  36 |   await expect(page.getByText("código de 8 dígitos", { exact: false })).toBeVisible({ timeout: 15000 });
  37 | 
  38 |   // Leer el código generado desde DynamoDB (simula leer el email)
  39 |   const code = latestPendingCode();
  40 |   expect(code).toMatch(/^\d{8}$/);
  41 | 
  42 |   await page.locator("#code").fill(code);
  43 |   await page.getByRole("button", { name: "Ingresar" }).click();
  44 | 
  45 |   // Paso 3: dashboard privado
  46 |   await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
> 47 |   await expect(page.getByText("Sesiones activas")).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  48 |   await expect(page.getByText("Gonzalez Concha", { exact: false }).first()).toBeVisible({ timeout: 15000 });
  49 | 
  50 |   // Paso 4: seleccionar una sesión → wizard directo con resumen en el paso 1
  51 |   await page.getByRole("button", { name: "Reagendar" }).first().click();
  52 |   const panel = page.locator('[role="dialog"]');
  53 |   await expect(page.getByText("Reagendar sesión")).toBeVisible();
  54 |   await expect(panel.getByText("Fecha")).toBeVisible();
  55 |   await expect(panel.getByText("Horario")).toBeVisible();
  56 | 
  57 |   // Paso 1: sede
  58 |   await panel.locator("button.w-full.text-left").first().click();
  59 |   // Paso 2: curso (esperar carga de opciones)
  60 |   const courseBtn = panel.locator("button.w-full.text-left").first();
  61 |   await courseBtn.waitFor({ timeout: 20000 });
  62 |   await courseBtn.click();
  63 |   // Paso 3: fechas (máx 15 días)
  64 |   await expect(panel.getByRole("button", { name: "Finalizar" })).toBeVisible({ timeout: 20000 });
  65 | 
  66 |   // Cancelar cierra la ventana
  67 |   await panel.getByRole("button", { name: "Cancelar" }).click();
  68 |   await expect(page.getByText("Reagendar sesión")).not.toBeVisible();
  69 | });
  70 | 
```