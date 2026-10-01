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