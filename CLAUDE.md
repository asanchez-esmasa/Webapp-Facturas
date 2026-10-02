# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Google Apps Script web app ("WebApp Facturas 2510 - BigQuery") used by ESMASA (esmasalcorcon.com) to manage supplier invoices (facturas) and delivery notes (albaranes): request signature, sign (stamps the PDF), reject, attach albaranes, post to accounting (contabilizar → Sage) and mark as paid. Code, comments and UI are in Spanish.

The source of truth is the Apps Script project `1ykD8Okr6AKzqU7-MN7uzVELFtdGSvFe8Hbw7LXk1wbVXpJE_y6MedJxK` (https://script.google.com/home/projects/1ykD8Okr6AKzqU7-MN7uzVELFtdGSvFe8Hbw7LXk1wbVXpJE_y6MedJxK/edit). The files here are a flat export of it (`.gs` = server, `.html` = templates/client JS/CSS, `appsscript.json` = manifest).

## Development

There is no build, lint or test tooling. Code only runs inside Apps Script:
- Sync with [clasp](https://github.com/google/clasp) (`clasp clone <scriptId>`, `clasp push`, `clasp pull`) or paste into the online editor.
- Server functions are tested by running them from the Apps Script editor and reading `Logger.log` / Stackdriver output (`exceptionLogging: STACKDRIVER`).
- The web app runs as the deploying user (`executeAs: USER_DEPLOYING`) with domain-only access; changes go live only after a new deployment version.
- Advanced services required: Drive v3, Gmail v1, BigQuery v2. JDBC is also used (Sage).

## Architecture

**Global namespace.** All `.gs` files share one global scope, loaded in file order (numeric prefixes `0000`/`000`/`00` control order). Several functions are **defined twice** (e.g. `guardarDatoTabla`, `actualizarDatosEnHoja`, `actualizarDatosEnHojaManteniendoHistorialFila11[Rechazados]`, `generarEstructuraAlbaranes`, `pagarAManoGS`, `actualizarFacturaAPagada`, `desvincularAlbaranDeFacturaGS`, `recorrerListaAlbaranesFactura`): the first is the legacy Google Sheets version and the later one is the BigQuery version, which wins. Edit the last definition; grep before adding a function name.

**Entry point & auth** (`00ACCESOAPP_ doget.gs`): `doGet` looks up the active user's email in BigQuery `datos-transversales.DATOS_BBDD_Contratacion.tabla_BBDD_Usuarios` (email at index 2, user type at index 5). Types `AD`, `UE`, `UA` are allowed; anyone else gets `AccesoDenegado.html`. `renderizarPagina` evaluates `Facturas.html` with the user JSON injected as template vars.

**Page composition.** `Facturas.html` is a shell that pulls in the other HTML files through `include(filename)` (`000FUNCIONESGLOBALES.gs`). Naming: `000IMPORTACIONES*` = CDN libs (jQuery, Materialize, DataTables, moment, pdfmake), `0GLOBAL*` = shared CSS/JS, `1Componente*` = navbar/footer/image viewer, `2Modal*` = modal and button actions, `3TablasFacturasJS` = DataTables setup, `FacturasJS`/`ObtenerDatosJS`/`Variables` = page logic and client constants.

**Data loading is client-side and async.** `doGet` sends almost no data; on `$(document).ready` `ObtenerDatosJS.html` makes parallel `google.script.run` calls through the `ejecutarServidor(fnName, ...args)` Promise wrapper. `obtenerDatos(arr)` dispatches by array length: 2 items `[spreadsheetId, sheetName]` → `obtenerDatosTabla` (Sheets), 3 items `[project, dataset, table]` → `obtenerDatosTablaBQ` (BigQuery). The same tuple convention is used across server helpers.

**Storage.**
- BigQuery (main store): project `datos-transversales`, dataset `DATOS_BBDD_Contabilidad`, tables `tabla_BBDD_Facturas`, `tabla_BBDD_Albaranes`, `tabla_BBDD_Historial_Albaranes`. Contratos menores, notas de gasto, licitaciones and users come from `DATOS_BBDD_Contratacion` (`0000Funciones Big Query.gs`, `0000BIBLIOTECAS_...gs`).
- Legacy Google Sheets (`idLibroFacturas`, sheets `Facturas` / `Facturas Enviadas a SAGE`, `Expedientes_pedidos`) are still referenced in places.
- Constants are duplicated: server in `000VARIABLES.gs`, client in `Variables.html`. Keep them in sync.

**BigQuery writes.** Use `esperarJobBQ_(projectId, jobId)` to wait for a job (it throws on `errorResult`) and `literalCadenaBQ_(valor)` for any value interpolated into SQL (or query parameters, as in `ejecutarQueryBQConLogs`). Write helpers throw on failure. Every `google.script.run` call that writes must have `.withFailureHandler(manejarErrorServidor('…'))` (`0GLOBALJS.html`), or the loader hangs on error.

**Invoice lifecycle** (`00FACTURAS.gs`, class `Factura`): states `Pendiente de revisión` → `Firmado` / `Rechazado` → contabilizada → `Pagada`. Each change goes through `actualizarDatosEnHojaManteniendoHistorialFila11*`, which updates the BigQuery row and appends to a history column. Gmail notifications are built by the `generarCuerpo*` functions.

**PDF signing.** `App_PDF_Firma_ESMASA.gs` (`firmapdf`) stamps signatures onto the invoice PDF in Drive using `PDFApp.gs`, a bundled copy of the third-party library tanaikech/PDFApp. Don't edit `PDFApp.gs`.

**Sage integration** (`0000BIBLIOTECAS_CAMBIAR_SI_SE_MODIFICA.gs`): JDBC to SQL Server (`dat()` / `conecta()` / `post_array()`) for supplier accounting codes (cuenta 4) and expense accounts (cuenta 6). If the accounting system changes, these functions are what needs replacing. `expedientes_disponibles_objeto()` builds the expedientes object (licitaciones come from `recoger_datos_licitaciones_bq()` in `0000Funciones Big Query.gs`: contracts in `Finalizado` stay available for `MESES_MARGEN_FACTURAS_LICITACION` months after their real end date, computed like the contratación app does in `recalcularEstadoLicitacionPorFechas`), which is cached in CacheService in 90 KB chunks (`obtenerExpedientesDisponibles_gs`; clear with `limpiarCacheExpedientes_gs`).

**Permissions besides the user type** (from `README.gs`):
- `usuariosConCuenta6` (hardcoded in `ObtenerDatosJS.html`): only these users load cuenta-6 accounts, so only they can open "inspeccionar" to contabilizar. The README's stated ideal is to move this to BigQuery or a new user type.
- `usuariosConExpedientes` in `000VARIABLES.gs`.
