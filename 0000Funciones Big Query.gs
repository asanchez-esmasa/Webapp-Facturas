/**Funciones para rescatar los datos de contrato menor y nota de gasto, rescatanto los datos de big query */

function recoger_datos_cm_bq(){
  const projectId = 'datos-transversales';
  const datasetId = 'DATOS_BBDD_Contratacion';
  const tableId = 'tabla_BBDD_ContratoMenor';

//El query trae todos los datos de la tabla
  const query = `
    SELECT * EXCEPT (id_key)
    FROM \`${projectId}.${datasetId}.${tableId}\`
    WHERE Etapa = 5 AND \`Activa_No Activa\` = 'true'
  `;

  // 🧾 Construcción del request para BigQuery
  const request = {
    query: query,
    useLegacySql: false  // Usamos SQL estándar
  };

  // 🚀 Ejecutamos la consulta
  const queryResults = BigQuery.Jobs.query(request, projectId);

  // ⚠️ Comprobamos si hubo errores en la ejecución
  if (queryResults.errors) {
    Logger.log("❌ Error en la consulta: %s", JSON.stringify(queryResults.errors, null, 2));
    return [];
  }
  /*var ss = SpreadsheetApp.openById("1Dvq-iBs_Yy0SX-qCdSogh16j2GDnLB__MyFGTXxF7C4")
  var hoja_pega = ss.getSheetByName("Datos bq")
  hoja_pega.clearContents()*/


  // 📊 Extraer los nombres de columnas
  const headers = queryResults.schema.fields.map(field => field.name);

  // 📊 Convertir los resultados en un array 2D
  const data = queryResults.rows.map(row => row.f.map(cell => cell.v));

  // Opcional: incluir cabecera como primera fila
  const result = [headers, ...data];
  //hoja_pega.getRange(1,1,result.length,result[0].length).setValues(result)

  return result;

}

/**Trae los datos de nota de gasto */
function recoger_datos_ng_bq(){
  const projectId = 'datos-transversales';
  const datasetId = 'DATOS_BBDD_Contratacion';
  const tableId = 'tabla_BBDD_NotaDeGasto';

//El query trae todos los datos de la tabla
  const query = `
    SELECT * EXCEPT (id_key)
    FROM \`${projectId}.${datasetId}.${tableId}\`
  `;

  // 🧾 Construcción del request para BigQuery
  const request = {
    query: query,
    useLegacySql: false  // Usamos SQL estándar
  };

  // 🚀 Ejecutamos la consulta
  const queryResults = BigQuery.Jobs.query(request, projectId);

  // ⚠️ Comprobamos si hubo errores en la ejecución
  if (queryResults.errors) {
    Logger.log("❌ Error en la consulta: %s", JSON.stringify(queryResults.errors, null, 2));
    return [];
  }


  // 📊 Extraer los nombres de columnas
  const headers = queryResults.schema.fields.map(field => field.name);

  // 📊 Convertir los resultados en un array 2D
  const data = queryResults.rows.map(row => row.f.map(cell => cell.v));

  // Opcional: incluir cabecera como primera fila
  const result = [headers, ...data];

  return result;

}

/** Meses de margen para seguir pudiendo subir facturas después de que termine un contrato de licitación */
const MESES_MARGEN_FACTURAS_LICITACION = 3;

/**
 * Consulta las licitaciones disponibles para subir facturas directamente desde BigQuery,
 * cruzando con la tabla de usuarios para obtener el email del responsable.
 * Los contratos en estado 'Finalizado' siguen disponibles durante MESES_MARGEN_FACTURAS_LICITACION
 * meses después de su fecha de fin real.
 * @return {Array<Object>} Lista de objetos con los datos procesados.
 */
function recoger_datos_licitaciones_bq() {
  const projectId = 'datos-transversales';
  const datasetId = 'DATOS_BBDD_Contratacion';
  const tableId = 'tabla_BBDD_Licitaciones';

  // Se usa l.* para leer las fechas de fin (vencimiento, prórrogas, finalización anticipada)
  // sin depender de que existan todas las columnas de prórrogas en la tabla.
  const sql = `
    SELECT
      l.*,
      COALESCE(u.Email, l.responsable_contrato) AS responsable_final
    FROM \`${projectId}.${datasetId}.${tableId}\` AS l
    LEFT JOIN \`${projectId}.${datasetId}.tabla_BBDD_Usuarios\` AS u
      ON l.responsable_contrato = u.Nombre
    WHERE l.estado NOT IN ('VENCIDA', 'PRO VENCIDA')
      AND l.estado IS NOT NULL
      AND l.estado != ''
  `;

  const request = {
    query: sql,
    useLegacySql: false
  };

  try {
    const queryResults = BigQuery.Jobs.query(request, projectId);
    const rows = queryResults.rows;
    const data = [];
    const hoy = Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyy-MM-dd');

    if (rows) {
      // Obtenemos los nombres de las columnas para mapear el objeto dinámicamente
      const fields = queryResults.schema.fields.map(f => f.name);

      for (let i = 0; i < rows.length; i++) {
        const bqRow = rows[i].f;
        const record = {};
        for (let j = 0; j < bqRow.length; j++) {
          record[fields[j]] = bqRow[j].v;
        }

        // Borrado lógico de la app de contratación
        if (esVerdaderoBQ_(record.eliminado)) continue;

        if (record.estado === 'Finalizado') {
          const fechaFin = fechaFinRealLicitacion_(record);
          const fechaLimite = fechaFin ? sumarMesesISO_(fechaFin, MESES_MARGEN_FACTURAS_LICITACION) : null;
          if (!fechaLimite || hoy > fechaLimite) continue;
          Logger.log(`Licitación ${record.id_expediente} finalizada el ${fechaFin}: disponible hasta el ${fechaLimite}`);
        }

        data.push({
          id_expediente: record.id_expediente,
          objeto_contrato: record.objeto_contrato,
          contratista: record.contratista,
          nif_contratista: record.nif_contratista,
          email_contratista: record.email_contratista,
          responsable_final: record.responsable_final
        });
      }
    }
    return data;
  } catch (err) {
    Logger.log("❌ Error crítico al ejecutar la consulta en BigQuery: " + err.message);
    throw err;
  }
}

/**
 * Fecha de fin real de un contrato (yyyy-MM-dd), con el mismo criterio que la app de contratación:
 * fecha de finalización anticipada si existe; si no, el final de la última prórroga no rechazada
 * (hasta num_prorrogas); si no, la fecha de vencimiento.
 */
function fechaFinRealLicitacion_(exp) {
  const finalizacion = fechaISOBQ_(exp.fecha_finalizacion_contrato);
  if (finalizacion) return finalizacion;

  let fechaFin = fechaISOBQ_(exp.fecha_vencimiento);
  const numProrrogas = parseInt(exp.num_prorrogas, 10);
  const limite = isNaN(numProrrogas) ? 4 : Math.min(numProrrogas, 4);
  for (let k = 1; k <= limite; k++) {
    if (esVerdaderoBQ_(exp['p' + k + '_rechazada'])) break;
    const finProrroga = fechaISOBQ_(exp['final_prorroga' + k]);
    if (!finProrroga) break;
    fechaFin = finProrroga;
  }
  return fechaFin;
}

/** Normaliza una fecha devuelta por BigQuery (DATE 'yyyy-MM-dd' o TIMESTAMP en segundos) a 'yyyy-MM-dd'. */
function fechaISOBQ_(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const s = String(valor).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  if (/^\d+(\.\d+)?(E\d+)?$/i.test(s)) return Utilities.formatDate(new Date(parseFloat(s) * 1000), 'Europe/Madrid', 'yyyy-MM-dd');
  return null;
}

/** Suma meses a una fecha 'yyyy-MM-dd'. Si el día no existe en el mes destino, usa el último día (31/01 + 1 mes = 28/02). */
function sumarMesesISO_(fechaISO, meses) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const destino = new Date(Date.UTC(anio, mes - 1 + meses, 1));
  const ultimoDia = new Date(Date.UTC(destino.getUTCFullYear(), destino.getUTCMonth() + 1, 0)).getUTCDate();
  destino.setUTCDate(Math.min(dia, ultimoDia));
  return destino.toISOString().substring(0, 10);
}

function esVerdaderoBQ_(valor) {
  return valor === true || String(valor).toLowerCase() === 'true';
}
