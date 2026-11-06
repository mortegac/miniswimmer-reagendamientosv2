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

Locator: locator('[role="dialog"]').getByText('Fecha')
Expected: visible
Error: strict mode violation: locator('[role="dialog"]').getByText('Fecha') resolved to 2 elements:
    1) <span class="text-slate-400 shrink-0">Fecha</span> aka getByText('Fecha').first()
    2) <span class="text-xs text-slate-400">Fecha</span> aka getByText('Fecha').nth(1)

Call log:
  - Expect "toBeVisible" locator('[role="dialog"]').getByText('Fecha') with timeout 5000ms
  - waiting for locator('[role="dialog"]').getByText('Fecha')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e6]:
    - generic [ref=e37]:
      - generic [ref=e38]: Valentina Concha Ramirez
      - button [ref=e39] [cursor=pointer]: Salir
    - heading [level=1] [ref=e40]: Sistema de Reagendamiento
    - paragraph [ref=e41]: Seleccione al Alumno para ver sus sesiones
    - generic [ref=e42]:
      - generic [ref=e43]:
        - button [ref=e44] [cursor=pointer]: Belen Gonzalez Concha
        - button [ref=e45] [cursor=pointer]: Rafael Gonzalez Concha
      - generic [ref=e46]:
        - generic [ref=e52]:
          - heading [level=2] [ref=e53]: Belen Gonzalez Concha
          - paragraph [ref=e54]: Madre
        - generic [ref=e55]:
          - generic [ref=e56]:
            - paragraph [ref=e57]: Bebes 2 a 23 Meses
            - paragraph [ref=e58]: Domingo · 10:00 hrs
            - generic [ref=e59]:
              - generic [ref=e62]: 15 Nov 2026
              - generic [ref=e63]: SESIÓN VIGENTE
            - button [ref=e64] [cursor=pointer]: Reagendar
          - generic [ref=e65]:
            - paragraph [ref=e66]: Bebes 2 a 23 Meses
            - paragraph [ref=e67]: Domingo · 10:00 hrs
            - generic [ref=e68]:
              - generic [ref=e71]: 22 Nov 2026
              - generic [ref=e72]: SESIÓN VIGENTE
            - button [ref=e73] [cursor=pointer]: Reagendar
          - generic [ref=e74]:
            - paragraph [ref=e75]: Bebes 2 a 23 Meses
            - paragraph [ref=e76]: Domingo · 10:00 hrs
            - generic [ref=e77]:
              - generic [ref=e80]: 29 Nov 2026
              - generic [ref=e81]: SESIÓN VIGENTE
            - button [ref=e82] [cursor=pointer]: Reagendar
          - generic [ref=e83]:
            - paragraph [ref=e84]: Bebes 2 a 23 Meses
            - paragraph [ref=e85]: Domingo · 10:00 hrs
            - generic [ref=e86]:
              - generic [ref=e89]: 6 Dic 2026
              - generic [ref=e90]: SESIÓN VIGENTE
            - button [ref=e91] [cursor=pointer]: Reagendar
          - generic [ref=e92]:
            - paragraph [ref=e93]: Bebes 2 a 23 Meses
            - paragraph [ref=e94]: Domingo · 10:00 hrs
            - generic [ref=e95]:
              - generic [ref=e98]: 13 Dic 2026
              - generic [ref=e99]: SESIÓN VIGENTE
            - button [ref=e100] [cursor=pointer]: Reagendar
          - generic [ref=e101]:
            - paragraph [ref=e102]: Bebes 2 a 23 Meses
            - paragraph [ref=e103]: Domingo · 10:00 hrs
            - generic [ref=e104]:
              - generic [ref=e107]: 20 Dic 2026
              - generic [ref=e108]: SESIÓN VIGENTE
            - button [ref=e109] [cursor=pointer]: Reagendar
          - generic [ref=e110]:
            - paragraph [ref=e111]: Bebes 2 a 23 Meses
            - paragraph [ref=e112]: Domingo · 10:00 hrs
            - generic [ref=e113]:
              - generic [ref=e116]: 27 Dic 2026
              - generic [ref=e117]: SESIÓN VIGENTE
            - button [ref=e118] [cursor=pointer]: Reagendar
          - generic [ref=e119]:
            - paragraph [ref=e120]: Bebes 2 a 23 Meses
            - paragraph [ref=e121]: Domingo · 10:00 hrs
            - generic [ref=e122]:
              - generic [ref=e125]: 3 Ene 2027
              - generic [ref=e126]: SESIÓN VIGENTE
            - button [ref=e127] [cursor=pointer]: Reagendar
          - generic [ref=e128]:
            - paragraph [ref=e129]: Bebes 2 a 23 Meses
            - paragraph [ref=e130]: Domingo · 10:00 hrs
            - generic [ref=e131]:
              - generic [ref=e134]: 17 Ene 2027
              - generic [ref=e135]: SESIÓN VIGENTE
            - button [ref=e136] [cursor=pointer]: Reagendar
          - generic [ref=e137]:
            - paragraph [ref=e138]: Bebes 2 a 23 Meses
            - paragraph [ref=e139]: Domingo · 10:00 hrs
            - generic [ref=e140]:
              - generic [ref=e143]: 31 Ene 2027
              - generic [ref=e144]: SESIÓN VIGENTE
            - button [ref=e145] [cursor=pointer]: Reagendar
          - generic [ref=e146]:
            - paragraph [ref=e147]: Bebes 2 a 23 Meses
            - paragraph [ref=e148]: Domingo · 10:00 hrs
            - generic [ref=e149]:
              - generic [ref=e152]: 7 Feb 2027
              - generic [ref=e153]: SESIÓN VIGENTE
            - button [ref=e154] [cursor=pointer]: Reagendar
  - generic:
    - generic:
      - generic:
        - dialog "Reagendar sesión":
          - generic [ref=e157]:
            - heading "Reagendar sesión" [level=2] [ref=e159]
            - generic [ref=e161]:
              - generic [ref=e162]:
                - generic [ref=e163]:
                  - generic [ref=e164]: Fecha
                  - generic [ref=e165]: domingo, 15 de noviembre de 2026
                - generic [ref=e166]:
                  - generic [ref=e167]: Sede
                  - generic [ref=e168]: VITACURA
                - generic [ref=e169]:
                  - generic [ref=e170]: Curso
                  - generic [ref=e171]: Bebes 2 a 23 Meses
                - generic [ref=e172]:
                  - generic [ref=e173]: Horario
                  - generic [ref=e174]: Domingo 10:00 - 10:30
              - generic [ref=e175]:
                - generic [ref=e176]:
                  - generic [ref=e177]: "1"
                  - generic [ref=e178]: Sede
                - generic [ref=e180]:
                  - generic [ref=e181]: "2"
                  - generic [ref=e182]: Curso
                - generic [ref=e184]:
                  - generic [ref=e185]: "3"
                  - generic [ref=e186]: Fecha
              - generic [ref=e187]:
                - generic [ref=e188]:
                  - paragraph [ref=e189]: CHILLAN
                  - button [active] [ref=e191] [cursor=pointer]:
                    - paragraph [ref=e192]: PISCINA CHILLAN
                    - paragraph [ref=e193]: Km 8 ruta N-55(Camino lo pinto)
                - generic [ref=e194]:
                  - paragraph [ref=e195]: RANCAGUA
                  - button [ref=e197] [cursor=pointer]:
                    - paragraph [ref=e198]: CLINICA LOS CANELOS
                    - paragraph [ref=e199]: Domingo Faustino Sarmiento 1137, Rancagua, Chile
                - generic [ref=e200]:
                  - paragraph [ref=e201]: STGO-ALTO
                  - generic [ref=e202]:
                    - button [ref=e203] [cursor=pointer]:
                      - paragraph [ref=e204]: MI CLUB
                      - paragraph [ref=e205]: "Valenzuela Puelma #8551, La Reina"
                    - button [ref=e206] [cursor=pointer]:
                      - paragraph [ref=e207]: SEDE PEÑALOLEN
                      - paragraph [ref=e208]: Camino de la tierra s/n, Peñalolen
                    - button [ref=e209] [cursor=pointer]:
                      - paragraph [ref=e210]: Santiago Centro | Aquatiempo
                      - paragraph [ref=e211]: Av. Ejercito Libertador 346, Santiago Centro
                    - button [ref=e212] [cursor=pointer]:
                      - paragraph [ref=e213]: VITACURA
                      - paragraph [ref=e214]: Georgia 1143, Vitacura
                    - button [ref=e215] [cursor=pointer]:
                      - paragraph [ref=e216]: ÑUÑOA-KIDS
                      - paragraph [ref=e217]: Pedro Aguirre Cerda 682, Ñuñoa
                    - button [ref=e218] [cursor=pointer]:
                      - paragraph [ref=e219]: Ñuñoa
                      - paragraph [ref=e220]: Dublé Almeyda 2191, Ñuñoa
                - generic [ref=e221]:
                  - paragraph [ref=e222]: VALPO-UNO
                  - button [ref=e224] [cursor=pointer]:
                    - paragraph [ref=e225]: VIñA-DEL-MAR
                    - paragraph [ref=e226]: "Los Carolinos #25, Miraflores bajo. Viña del Mar"
              - button "Cancelar" [ref=e229] [cursor=pointer]
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
  47 |   await expect(page.getByText("Sistema de Reagendamiento")).toBeVisible();
  48 |   await expect(page.getByText("Gonzalez Concha", { exact: false }).first()).toBeVisible({ timeout: 15000 });
  49 | 
  50 |   // Paso 4: seleccionar una sesión → wizard directo con resumen en el paso 1
  51 |   await page.getByRole("button", { name: "Reagendar" }).first().click();
  52 |   const panel = page.locator('[role="dialog"]');
  53 |   await expect(page.getByText("Reagendar sesión")).toBeVisible();
> 54 |   await expect(panel.getByText("Fecha")).toBeVisible();
     |                                          ^ Error: expect(locator).toBeVisible() failed
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