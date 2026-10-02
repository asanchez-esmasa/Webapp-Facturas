/** BIBLIOTECA CONTABILIDAD  */
 
/**PRINCIPIO CONEXION DE DATOS */
function dat() {
  var BANK = "sqlserver"; // Conector de banco
  var HOST = "212.4.122.116"; // ip
  var PORT = "1433"; // Puerto de conexión 1433
  var BANCODEDADOS = "Sage" // Base de datos deseada
  var USER = "empleados"; // Usuario
  // La contraseña está en Configuración del proyecto → Propiedades del script → SAGE_DB_PASSWORD
  var PASSWORD = PropertiesService.getScriptProperties().getProperty('SAGE_DB_PASSWORD');
  if (!PASSWORD) {
    throw new Error("Falta la propiedad del script SAGE_DB_PASSWORD (contraseña de la base de datos de Sage).");
  }
  var url = "jdbc:" + BANK + "://" + HOST + ":" + PORT + ";databaseName=" + BANCODEDADOS
  var conecta = [url, USER, PASSWORD]
  var conn = Jdbc.getConnection(conecta[0], conecta[1], conecta[2]);
  Logger.log(conn)
  return (conn)
}

function conecta_ano(string_consulta, encabezado, conn) {
  var array_consulta = post_array(conn, string_consulta, encabezado)
  return (array_consulta)

}

function conecta(query, encabezado) {
  const conn = dat();
  return post_array(conn, query, encabezado);
}
// Recibe una conexión a la base de datos, una consulta SQL y un indicador de si incluir cabecera
// Devuelve un array con los resultados de la consulta
function post_array(conn, query, encabezado) {

  // Crea un objeto Statement a partir de la conexión, que permite ejecutar consultas SQL
  const stmt = conn.createStatement();

  // Ejecuta la consulta SQL y devuelve un ResultSet con los datos obtenidos
  const rs = stmt.executeQuery(query);

  // Obtiene metadatos del ResultSet, útiles para saber número de columnas, nombres, etc.
  const meta = rs.getMetaData();

  // Número de columnas que devuelve la consulta
  const colCount = meta.getColumnCount();

  // Inicializa el array de resultados
  // Si 'encabezado' es true, añadimos primero un array con los nombres de las columnas
  // Array.from crea un array de longitud colCount y asigna a cada posición el nombre de la columna
  const result = encabezado ? [Array.from({ length: colCount }, (_, i) => meta.getColumnName(i + 1))] : [];

  // Recorremos cada fila del ResultSet
  while (rs.next()) {
    // Creamos un array para la fila actual
    const row = new Array(colCount);

    // Recorremos cada columna de la fila y extraemos su valor como string
    for (let i = 0; i < colCount; i++) {
      row[i] = rs.getString(i + 1);
    }

    // Añadimos la fila al array de resultados
    result.push(row);
  }

  // Cerramos el ResultSet y el Statement para liberar recursos
  rs.close();
  stmt.close();

  // Devolvemos el array completo con los datos
  return result;
}

/**FIN CONEXION DE DATOS */
/** PRINCIPIO FUNCIONES DE CONTABILIDAD UTILIZADAS */

/** Cambiar el query por el siguiente:
 * "Select CodigoContable, RazonSocial from Proveedores where CifDni = '"+cif+"' and CodigoEmpresa = 1"
 */
function proveedores_codigo_contable_4_2(cif) {
  var string_consulta = "Select CodigoContable, RazonSocial from Proveedores where CifDni = '" + cif + "' and CodigoEmpresa = 1"
  var array_consulta = conecta(string_consulta, false)
  return array_consulta
}
function pruebaCIF_CUENTA(){
  var cif = "B84385657"
  console.log(proveedores_codigo_contable_4(cif))
}
function cuentas_contables_6() {
  const query = `
    SELECT '[' +
           STRING_AGG(
               '{ "AnaCodigoCuenta": "' + AnaCodigoCuenta +
               '", "Cuenta": "' + STRING_ESCAPE(ISNULL(Cuenta, ''), 'json') + '" }',
               ','
           ) WITHIN GROUP (ORDER BY AnaCodigoCuenta) +
           ']' AS json_result
    FROM AnaPlanCuentas
    WHERE 
      (
        LEFT(AnaCodigoCuenta, 2) NOT LIKE '%[^0-9]%'  -- solo si empieza con números
        AND CAST(LEFT(AnaCodigoCuenta, 2) AS INT) > 59
        AND CAST(LEFT(AnaCodigoCuenta, 2) AS INT) < 64
      )
      OR AnaCodigoCuenta LIKE '21%'
  `;
  return conectaJSON(query);
}




function conectaJSON(query) {
  const conn = dat();
  const stmt = conn.createStatement();
  const rs = stmt.executeQuery(query);

  let jsonStr = "[]";
  if (rs.next()) {
    jsonStr = rs.getString(1);
  }

  rs.close();
  stmt.close();
  conn.close();

  return JSON.parse(jsonStr);
}







/** FIN FUNCIONES DE CONTABILIDAD UTILIZADAS */

/** FIN BIBLIOTECA CONTABILIDAD */


/** BIBLIOTECA LISTADOS */

/**
 * Listado de expedientes disponibles para la webapp_Facturacion
 * Formato array de 3 dimensiones, CM, NG y Licitaciones,
 * en cada uno de los tres arrays, los datos de n_exp y los datos de la empresa en un objeto
 * Libro CM: "14ol9mX-ttBgpXcuP6a2vX4JA8PkefHdDU56ylCqcz20"
 * Libro NG: "78BDf6hIJA115e2ybgLxlilJCPKSC8-Xiy5duRItxk8"
 * Libro L nuevas: "1mwpfp5neYdALH6Ct4uBKp5AteJfSocJg37IlVm1B2Vs"
 * Libro Control contratacion: "1yVwkwAX3lPw6-aCjEN1oXOrfWEhSU9CAe0xz7zFbkAg"
 * 
 * Para acceder a todos los campos nº Expediente del objeto resultante
   var infoCM = objetoControlGS[0].cm;
    var infoLI = objetoControlGS[0].li;
    var infoNG = objetoControlGS[0].ng;
* var datosCombinados = { ...infoCM, ...infoLI, ...infoNG };
* 
* Añadir en el proveedor el numero de cuenta 410

*/

/** FALTA EL MAIL DEL PROVEEDOR  */


function expedientes_disponibles_objeto() {
  var id_lv = "1yVwkwAX3lPw6-aCjEN1oXOrfWEhSU9CAe0xz7zFbkAg"; // BBDD Licitaciones viejas (Solo si se sigue usando para otras cosas)

  Logger.log("🔹 Inicio función expedientes_disponibles_objeto()");

  // 🔹 Recoger datos NG y CM desde BigQuery
  Logger.log("📌 Recogiendo datos de Notas de Gasto desde BigQuery…");
  var data_ng = recoger_datos_ng_bq();
  Logger.log("✔ Datos NG cargados. Filas: " + data_ng.length);

  Logger.log("📌 Recogiendo datos de Contrato Menor desde BigQuery…");
  var data_cm = recoger_datos_cm_bq();
  Logger.log("✔ Datos CM cargados. Filas: " + data_cm.length);

  // 🔍 Logging de inspección de cabecera y primeras filas para CM
  if (data_cm.length > 0) {
    Logger.log("📌 Cabecera CM: " + JSON.stringify(data_cm[0]));
    for (var i = 1; i <= Math.min(5, data_cm.length - 1); i++) {
      Logger.log("📄 Fila CM " + i + ": " + JSON.stringify(data_cm[i]));
    }
  }

  // 📌 NUEVO: Recogiendo datos de Licitaciones desde BigQuery con cruce de usuarios ya resuelto
  Logger.log("📌 Recogiendo datos de Licitaciones desde BigQuery…");
  var data_li_bq = recoger_datos_licitaciones_bq();
  Logger.log("✔ Datos Licitaciones cargados desde BQ. Registros válidos: " + data_li_bq.length);

  var obj_tot = { ng: {}, cm: {}, li: {}, cm_ant: {} };

  // 🔹 Procesar Notas de Gasto
  Logger.log("▶ Procesando Notas de Gasto…");
  var exp_ng_count = 0;
  for (var i = 1; i < data_ng.length; i++) {
    var fila = data_ng[i];
    var fila_obj = {};
    for (var j = 0; j < data_ng[0].length; j++) {
      fila_obj[data_ng[0][j]] = fila[j];
    }
    if (fila_obj["Etapa"] == "#4" && (fila_obj["Activa"] === "true" || fila_obj["Activa"] === true)) {
      var n_exp = fila_obj["ID_NG"];
      obj_tot.ng[n_exp] = {
        asunto: fila_obj["Asunto"],
        responsable: fila_obj["User_1"],
        datos_prov: {
          cif: fila_obj["cifContrato"],
          razon: fila_obj["nombreProvedor"],
          email: fila_obj["correoProvedor"]
        }
      };
      exp_ng_count++;
    }
  }
  Logger.log("✔ NG procesado. Expedientes válidos: " + exp_ng_count);

  // 🔹 Procesar Contrato Menor
  Logger.log("▶ Procesando Contrato Menor…");
  var exp_cm_count = 0;
  for (var i = 1; i < data_cm.length; i++) {
    var fila = data_cm[i];
    var fila_obj = {};
    for (var j = 0; j < data_cm[0].length; j++) {
      fila_obj[data_cm[0][j]] = fila[j];
    }
    if (fila_obj["Etapa"] == 5 && (fila_obj["Activa_No Activa"] === "true" || fila_obj["Activa_No Activa"] === true)) {
      var n_exp = fila_obj["ID_CM"];
      obj_tot.cm[n_exp] = {
        asunto: fila_obj["Asunto"],
        responsable: fila_obj["Responsable contrato"],
        datos_prov: {
          cif: fila_obj["CIF"],
          razon: fila_obj["Empresa"],
          email: fila_obj["Correo_adj"]
        }
      };
      exp_cm_count++;
    }
  }
  Logger.log("✔ CM procesado. Expedientes válidos: " + exp_cm_count);

  // 🔹 NUEVO: Procesar Licitaciones de forma ultra-eficiente
  Logger.log("▶ Procesando Licitaciones desde BigQuery…");
  var exp_li_count = 0;
  for (var i = 0; i < data_li_bq.length; i++) {
    var item = data_li_bq[i];
    var n_exp = item.id_expediente;

    // Estructura limpia mapeada con los campos correspondientes de BQ
    obj_tot.li[n_exp] = { 
      asunto: item.objeto_contrato, 
      responsable: item.responsable_final, 
      datos_prov: { 
        cif: item.nif_contratista, 
        razon: item.contratista, // Nombre/Razón social de la empresa contratista
        email: item.email_contratista 
      } 
    };
    exp_li_count++;
  }
  Logger.log("✔ Licitaciones procesadas. Expedientes válidos: " + exp_li_count);

  return [obj_tot, []];
}
/*
function expedientes_disponibles_objetoant() {
  var id_lv = "1yVwkwAX3lPw6-aCjEN1oXOrfWEhSU9CAe0xz7zFbkAg"; // BBDD Licitaciones viejas

  Logger.log("🔹 Inicio función expedientes_disponibles_objeto()");

  var ss_li = SpreadsheetApp.openById(id_lv);
  var hoja_li = ss_li.getSheetByName("Licitaciones");
  var hoja_li_listas = ss_li.getSheetByName("Listas");

  // 🔹 Recoger datos NG y CM
  Logger.log("📌 Recogiendo datos de Notas de Gasto desde BigQuery…");
  var data_ng = recoger_datos_ng_bq();
  Logger.log("✔ Datos NG cargados. Filas: " + data_ng.length);

  Logger.log("📌 Recogiendo datos de Contrato Menor desde BigQuery…");
  var data_cm = recoger_datos_cm_bq();
  Logger.log("✔ Datos CM cargados. Filas: " + data_cm.length);

  // 🔍 Logging de inspección de cabecera y primeras filas
  if (data_cm.length > 0) {
    Logger.log("📌 Cabecera CM: " + JSON.stringify(data_cm[0]));
    for (var i = 1; i <= Math.min(5, data_cm.length - 1); i++) {
      Logger.log("📄 Fila CM " + i + ": " + JSON.stringify(data_cm[i]));
    }
  }

  Logger.log("📌 Cargando datos de Licitaciones hoja principal…");
  var data_li = hoja_li.getDataRange().getValues();
  Logger.log("✔ Datos Licitaciones cargados. Filas: " + data_li.length);

  Logger.log("📌 Cargando datos de Listas (responsables)...");
  var data_li_listas = hoja_li_listas.getDataRange().getValues();
  Logger.log("✔ Datos Listas cargados. Filas: " + data_li_listas.length);

  //var listado_total = [];
  var obj_tot = { ng: {}, cm: {}, li: {}, cm_ant: {} };

  // 🔹 Procesar Notas de Gasto
  Logger.log("▶ Procesando Notas de Gasto…");
  var exp_ng_count = 0;
  for (var i = 1; i < data_ng.length; i++) {
    var fila = data_ng[i];
    var fila_obj = {};
    // Convertir fila a objeto con cabeceras como keys
    for (var j = 0; j < data_ng[0].length; j++) {
      fila_obj[data_ng[0][j]] = fila[j];
    }
    if (fila_obj["Etapa"] == "#4" && (fila_obj["Activa"] === "true" || fila_obj["Activa"] === true)) {
      var n_exp = fila_obj["ID_NG"];
      //listado_total.push(n_exp);
      obj_tot.ng[n_exp] = {
        asunto: fila_obj["Asunto"],
        responsable: fila_obj["User_1"],
        datos_prov: {
          cif: fila_obj["cifContrato"],
          razon: fila_obj["nombreProvedor"],
          email: fila_obj["correoProvedor"]
        }
      };
      exp_ng_count++;
    }
  }
  Logger.log("✔ NG procesado. Expedientes válidos: " + exp_ng_count);

  // 🔹 Procesar Contrato Menor
  Logger.log("▶ Procesando Contrato Menor…");
  var exp_cm_count = 0;
  for (var i = 1; i < data_cm.length; i++) {
    var fila = data_cm[i];
    var fila_obj = {};
    for (var j = 0; j < data_cm[0].length; j++) {
      fila_obj[data_cm[0][j]] = fila[j];
    }
    if (fila_obj["Etapa"] == 5 && (fila_obj["Activa_No Activa"] === "true" || fila_obj["Activa_No Activa"] === true)) {
      var n_exp = fila_obj["ID_CM"];
      //listado_total.push(n_exp);
      obj_tot.cm[n_exp] = {
        asunto: fila_obj["Asunto"],
        responsable: fila_obj["Responsable contrato"],
        datos_prov: {
          cif: fila_obj["CIF"],
          razon: fila_obj["Empresa"],
          email: fila_obj["Correo_adj"]
        }
      };
      exp_cm_count++;
    }
  }
  Logger.log("✔ CM procesado. Expedientes válidos: " + exp_cm_count);

  // 🔹 Procesar Licitaciones
  Logger.log("▶ Procesando Licitaciones…");
  var exp_li_count = 0;
  for (var i = 1; i < data_li.length; i++) {
    var x = data_li[i];
    if (x[34] != "VENCIDA" && x[34] != "PRO VENCIDA" && x[34] != "" && x[34] != "FINALIZADO") {
      var n_exp = x[1];
      //listado_total.push(n_exp);
      var dat_prov = { cif: x[24], razon: x[23], email: x[25] };
      var resp = x[8].toString();
      if (resp.indexOf("@") == -1) {
        data_li_listas.forEach(lis => { if (lis[3] == resp) resp = lis[4]; });
      }
      obj_tot.li[n_exp] = { asunto: x[2], responsable: resp, datos_prov: dat_prov };
      exp_li_count++;
    }
  }
  Logger.log("✔ Licitaciones procesadas. Expedientes válidos: " + exp_li_count);

  //Logger.log("📊 TOTAL expedientes recopilados: " + listado_total.length);
  //Logger.log(listado_total);
  //Logger.log(obj_tot);

  //return [obj_tot, listado_total];
  return [obj_tot, []];
}*/
// recoger_datos_licitaciones_bq() se ha movido a "0000Funciones Big Query.gs"

/** FIN BIBLIOTECA LISTADOS */

function actualizarCif() {
  var spreadsheetId = "12_z17iG_GyRFpf0F0XbcRJy6651_6ECwOMP7NEcVtSU";
  var sheetName = "Facturas";
  var range = "Q:Q";
  var targetColumn = "AC";

  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var data = sheet.getRange(range).getValues();

  for (var i = 0; i < data.length; i++) {
    var stringValue = data[i][0];
    if (stringValue && stringValue.length > 0) {
      var jsonObject;
      try {
        jsonObject = JSON.parse(stringValue);
      } catch (e) {
        continue;
      }
      if (jsonObject.hasOwnProperty("cif")) {
        var cifValue = jsonObject["cif"].replace(/"/g, '');
        sheet.getRange(i + 1, getColumnNumber(targetColumn)).setValue(cifValue);
      }
    }
  }
}
function actualizarFecha() {
  var spreadsheetId = "12_z17iG_GyRFpf0F0XbcRJy6651_6ECwOMP7NEcVtSU";
  var sheetName = "Facturas";
  var range = "L:L";
  var targetColumnFirmadoFecha = "AH"; // Columna para la fecha de firma
  var targetColumnFirmadoObservaciones = "AI"; // Columna para observaciones de firma

  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var data = sheet.getRange(range).getValues();

  for (var i = 0; i < data.length; i++) {
    var stringValue = data[i][0];
    if (stringValue && stringValue.length > 0) {
      // Dividir los objetos JSON por el separador " - "
      var objects = stringValue.split(" - ");

      // Iterar sobre cada objeto JSON
      for (var j = 0; j < objects.length; j++) {
        var jsonObject;
        try {
          jsonObject = JSON.parse(objects[j]);
        } catch (e) {
          continue;
        }

        // Comprobar si el estado es "Firmado"
        if (jsonObject.estado === "Firmado") {
          // Obtener la marca temporal y observaciones
          var firmaFecha = jsonObject.marcaTemporal;
          var observaciones = jsonObject.observaciones || ""; // Si no hay observaciones, se establece como cadena vacía

          // Formatear la fecha en el formato deseado
          firmaFecha = Utilities.formatDate(new Date(firmaFecha), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

          // Establecer la fecha de firma y observaciones en las columnas correspondientes
          sheet.getRange(i + 1, getColumnNumber(targetColumnFirmadoFecha)).setValue(firmaFecha);
          sheet.getRange(i + 1, getColumnNumber(targetColumnFirmadoObservaciones)).setValue(observaciones);

          // Romper el bucle interno para pasar al siguiente registro
          break;
        }
      }
    }
  }
}

function procesarCadena(input) {
  // Verificar si la cadena contiene el delimitador "-"
  if (input.includes(" - ")) {
    // Dividir la cadena en partes usando "-" como delimitador
    let partes = input.split(" - ");

    // Procesar la primera parte y verificar si contiene "peticionFirma"
    let primeraParte = JSON.parse(partes[0]);
    let objetos = [];

    if (primeraParte.peticionFirma) {
      // Extraer el objeto dentro de peticionFirma
      objetos.push(primeraParte.peticionFirma);
    } else {
      // Si no contiene "peticionFirma", usar la primera parte como está
      objetos.push(primeraParte);
    }

    // Procesar las demás partes y agregarlas al array de objetos
    for (let i = 1; i < partes.length; i++) {
      objetos.push(JSON.parse(partes[i]));
    }

    // Convertir cada objeto a una cadena JSON y unirlos con " - "
    let resultado = objetos.map(obj => JSON.stringify(obj)).join(" - ");

    return resultado;
  } else {
    // Procesar el caso donde solo hay un objeto
    let primeraParte = JSON.parse(input);
    if (primeraParte.peticionFirma) {
      return JSON.stringify(primeraParte.peticionFirma);
    } else {
      return input;
    }
  }
}

function procesarColumnL() {
  // ID de la hoja de cálculo y nombre de la hoja
  const sheetId = '12_z17iG_GyRFpf0F0XbcRJy6651_6ECwOMP7NEcVtSU';
  const sheetName = 'Facturas';

  // Abrir la hoja de cálculo y la hoja específica
  let sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);

  // Obtener el rango de la columna L (12ª columna)
  let range = sheet.getRange('L:L');
  let values = range.getValues();

  // Procesar cada valor de la columna L
  for (let i = 0; i < values.length; i++) {
    let cellValue = values[i][0];
    if (cellValue) {
      try {
        let processedValue = procesarCadena(cellValue);
        sheet.getRange(i + 1, 12).setValue(processedValue); // Actualizar la celda en la misma posición
      } catch (e) {
        // Si hay un error al procesar la cadena, puedes manejarlo aquí
        Logger.log(`Error procesando la celda L${i + 1}: ${e.message}`);
      }
    }
  }
}


// Función auxiliar para obtener el número de columna a partir de la letra
function getColumnNumber(columnLetter) {
  var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var columnNumber = 0;
  for (var i = 0; i < columnLetter.length; i++) {
    columnNumber += Math.pow(base.length, columnLetter.length - i - 1) * (base.indexOf(columnLetter.charAt(i)) + 1);
  }
  return columnNumber;
}

function pruebaaaaaaaaaaaaaaaaaa() {
  console.log(getColumnNumber("Q"))
}
