function generateUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
function adjuntarAlbaranesFacturas(formulario) {
  // Desactivada: escribía los enlaces en la columna Datos_proveedor y borraba el CIF/razón social
  // del proveedor. Ningún botón la usa (los albaranes se adjuntan con guardarAlbaranes → recorrerListaAlbaranesFactura).
  // Si se recupera, hay que decidir antes en qué columna deben guardarse los enlaces.
  throw new Error("adjuntarAlbaranesFacturas está desactivada: sobrescribía Datos_proveedor.");
  var arrayLinks;

  if (formulario.idArchivoFormulario.includes(',')) {
    arrayLinks = formulario.idArchivoFormulario.split(',');
  } else {
    arrayLinks = [formulario.idArchivoFormulario];
  }
  const newArray = arrayLinks.map(url => {
    return {
      id: generateUniqueId(),
      url: url
    };
  });
  var columnasValores = [newArray]
  //columnas que hay que sustituir
  var columnasHoja = ["Datos_proveedor"]
  actualizarDatosEnHoja(idProyectoBigquery, idDatasetContabilidad, idTablaFacturas, formulario.idFactura,"ID_Factura", columnasValores, columnasHoja)
}


function subirArchivosUrl(imgCarpeta) {
  var file = Utilities.newBlob(imgCarpeta[0].bytes, imgCarpeta[0].mineType, imgCarpeta[0].filename);
  var folder = DriveApp.getFolderById(imgCarpeta[1]);
  var createFile = folder.createFile(file)
  return createFile.getUrl()
}


function enviarCorreoConAdjunto(destinatario, titulo, cuerpo, urlArchivoAdjunto) {
  try {
    if (urlArchivoAdjunto) {
      var id = extraerIdDesdeEnlaceDrive(urlArchivoAdjunto)
      var archivosAdjuntos = [DriveApp.getFileById(id).getBlob()]

      GmailApp.sendEmail(destinatario, titulo, cuerpo, {
        noReply: true,
        attachments: archivosAdjuntos,  // Adjuntar el archivo usando un Blob
        htmlBody: cuerpo,
        //bcc: "a.sanchez@esmasalcorcon.com",
        //bcc: "a.sanchez@esmasalcorcon.com"+"," + otrodestinatario,
      });
    } else {

      GmailApp.sendEmail(destinatario, titulo, cuerpo, {
        noReply: true,
        attachments: [],  // Adjuntar el archivo usando un Blob
        htmlBody: cuerpo,
        //bcc: "a.sanchez@esmasalcorcon.com",
        //bcc: "a.sanchez@esmasalcorcon.com"+"," + otrodestinatario,
      });
    }
    return true;
  } catch (e) {
    mostrarErrorPosicion('Correo con 1 archivo', e);
    return false;
  }
}
function mostrarErrorPosicion(posicionString, error) {
  // Enviar correo electrónico de notificación de error
  // var destinatario = "a.sanchez@esmasalcorcon.com,d.fernandez@esmasalcorcon.com";
  var destinatario = "a.sanchez@esmasalcorcon.com";
  var asunto = posicionString;
  var mensaje = "Se produjo un error al ejecutar el script. El error fue: " + error.message + "\n\nStack trace:\n" + error.stack;
  GmailApp.sendEmail(destinatario, asunto, mensaje);
}
function extraerIdDesdeEnlaceDrive(enlace) {
  // Expresión regular para buscar el ID en el enlace de Google Drive
  var regex = /\/d\/([a-zA-Z0-9_-]+)(\/|$)/;
  var match = enlace.match(regex);

  if (match && match[1]) {
    var id = match[1];
    return id;
  } else {
    // Si no se encuentra un ID válido en el enlace
    return null;
  }
}
/******************************FUNCION PARA REALIZAR PRUEBAS***********************************/
function usuariosDatosLimitados() {
  //var usuariosControlGasto = ['1DTEf-OYKTIplYxK-rzWt4PZgQZ-uXe6JDX3RrJ00bc0', 'Usuarios']
  var arrayUsuarios = obtenerDatosTablaBQ(['datos-transversales', 'DATOS_BBDD_Contratacion', 'tabla_BBDD_Usuarios'])
  var nuevoArrayUsuarios = arrayUsuarios.map(function (subarray) {
    return subarray.slice(0, 5).concat(subarray[6]);
  });
  Logger.log("nuevoArrayUsuarios"+nuevoArrayUsuarios);
  return nuevoArrayUsuarios
}
/******************************IDENTIFICAR USUARIO***********************************/
function usuarioActivo() {
  return emailUsuarioActivo
}
/***********************************RUTA WEB*****************************************/
/** 
function ruta() {
  return rutaWeb
}
*/
/***********************************PODER AÑADIR ARCHIVOS (INCLUDE)*****************************************/
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}
/***********************************OBTENER TODOS LOS DATOS O UN RANGO*****************************************/
// function obtenerDatosTabla(variables) {
//   Logger.log(variables)
//   var libro = SpreadsheetApp.openById(variables[0]);
//   var hoja = libro.getSheetByName(variables[1]);
//   if (variables[2]) {
//     var rango = hoja.getRange(variables[2])
//     var datos = rango.getDisplayValues();
//   } else {
//     var rango = hoja.getDataRange();
//     var datos = rango.getDisplayValues();
//   }
//   Logger.log(datos)
//   return datos
// }
function obtenerDatosTabla(variables, reverseArray) {
  Logger.log(variables);
  var libro = SpreadsheetApp.openById(variables[0]);
  var hoja = libro.getSheetByName(variables[1]);
  var rango;
  var datos;

  if (variables[2]) {
    rango = hoja.getRange(variables[2]);
    datos = rango.getDisplayValues();
  } else {
    rango = hoja.getDataRange();
    datos = rango.getDisplayValues();
  }

  // Si reverseArray es true, invertir los datos
  if (reverseArray) {
    // Extraer los títulos de la primera fila
    var titulos = datos.shift();

    // Darle la vuelta a los datos
    datos.reverse();

    // Agregar los títulos al principio de los datos invertidos
    datos.unshift(titulos);
  }
  Logger.log("Número de filas recogidas: " + datos.length);

  Logger.log("datos: "+JSON.stringify(datos));
  return datos;
}

/***********************************OBTENER DATOS TABLA (desde BigQuery)*****************************************/
/**
 * Obtiene los datos de una tabla de BigQuery en el mismo formato que getDisplayValues()
 * @param {Array} variables - [projectId, datasetId, tableId, queryOptional]
 * @param {boolean} reverseArray - Si es true, invierte las filas (excepto la cabecera)
 * @return {Array<Array<string>>} - Array con cabecera + filas de datos como strings
 */
function obtenerDatosTablaBQ(variables, reverseArray) {
  try {
    Logger.log("=== 🧩 INICIO obtenerDatosTablaBQ ===");
    Logger.log("📥 Parámetros recibidos:");
    Logger.log(JSON.stringify(variables));
    Logger.log("🔁 reverseArray: " + reverseArray);

    const projectId = variables[0];
    const datasetId = variables[1];
    const tableId = variables[2];
    const queryOptional = variables[3]; // Puede ser una query personalizada

    Logger.log("🧠 projectId: " + projectId);
    Logger.log("🧠 datasetId: " + datasetId);
    Logger.log("🧠 tableId: " + tableId);
    Logger.log("🧠 queryOptional: " + queryOptional);

    // Construimos la query final
    if (queryOptional) {
      query = queryOptional;
    } else if (tableId === "tabla_BBDD_Facturas") {
      // Consulta excluyendo id_key
      query = `
        SELECT * EXCEPT(id_key)
        FROM \`${projectId}.${datasetId}.${tableId}\`
        WHERE 
          EXTRACT(YEAR FROM Fecha_factura) = EXTRACT(YEAR FROM CURRENT_DATETIME())
          OR Estado != 'Pagada'
      `;
    } else {
      query = `
        SELECT * EXCEPT(id_key)
        FROM \`${projectId}.${datasetId}.${tableId}\`
      `;
    }
    Logger.log("📜 SQL ejecutado:");
    Logger.log(query);

    // Configuración del request
    const request = {
      query: query,
      useLegacySql: false,
      location: "US" // ⚠️ Ajusta según tu dataset real (EU o US)
    };

    Logger.log("🌍 Región BigQuery (location): " + request.location);
    Logger.log("🚀 Ejecutando query con BigQuery.Jobs.query...");

    // Ejecutar la consulta
    const queryResults = BigQuery.Jobs.query(request, projectId);

    Logger.log("📦 queryResults (estructura completa):");
    Logger.log(JSON.stringify(queryResults, null, 2));

    // Verificamos si el job se completó
    if (queryResults.jobComplete !== true) {
      throw new Error("❌ El job de consulta no se completó correctamente.");
    }

    const rows = queryResults.rows || [];
    const schema = queryResults.schema?.fields?.map(f => f.name) || [];

    Logger.log("🧱 Esquema de columnas:");
    Logger.log(JSON.stringify(schema));

    Logger.log("📊 Número de filas crudas devueltas por BigQuery: " + rows.length);

    // Convertimos a formato getDisplayValues()
    let datos = [schema];

    for (const row of rows) {
      const valores = row.f.map(celda => {
        const valor = celda.v;
        return valor === null || valor === undefined ? "" : String(valor);
      });
      datos.push(valores);
    }

    // Si se pide invertir
    if (reverseArray && datos.length > 1) {
      const headers = datos[0];
      const cuerpoInvertido = datos.slice(1).reverse();
      datos = [headers, ...cuerpoInvertido];
      Logger.log("🔄 Array invertido (reverseArray=true)");
    }

    Logger.log("✅ Número final de filas (sin cabecera): " + (datos.length - 1));
    Logger.log("=== ✅ FIN obtenerDatosTablaBQ ===");

    return datos;

  } catch (err) {
    Logger.log("❌ ERROR en obtenerDatosTablaBQ:");
    Logger.log(err.stack || err.message);
    return [["Error"], [err.message]];
  }
}


/***********************************GUARDAR DATOS TABLA*****************************************/
/*
function guardarDatoTabla(idLibro, nombrehoja, objetoDatos) {
  var refHojaCalculo = SpreadsheetApp.openById(idLibro).getSheetByName(nombrehoja)
  var valores = Object.values(objetoDatos);
  refHojaCalculo.appendRow(valores);
}*/
/***********************************GUARDAR DATOS TABLA*****************************************/
/**
 * Inserta un registro en una tabla de BigQuery.
 * @param {string} projectId - ID del proyecto de Google Cloud.
 * @param {string} datasetId - ID del dataset en BigQuery.
 * @param {string} tableId - ID de la tabla en BigQuery.
 * @param {Object} objetoDatos - Objeto con los datos a insertar (campos = columnas).
 */
function guardarDatoTabla(projectId, datasetId, tableId, objetoDatos) {
  try {
    console.log(`🚀 Iniciando inserción en BigQuery: ${datasetId}.${tableId}`);
    console.log("📝 Objeto recibido para insertar:");
    console.log(JSON.stringify(objetoDatos, null, 2));

    // ============================
    // 🔑 GENERACIÓN DE ID_KEY
    // ============================
    const id_key = Utilities.getUuid();

    // ============================
    // 🔄 MAPEO CAMPOS → BIGQUERY
    // ============================
    const filaBQ = {
      id_key: id_key,
      Marca_Temp_Soli: toBigQueryDateTime(objetoDatos.marcaTemporal) || null,
      NumFactura: objetoDatos.numeroFactura || "",
      ID_Factura: objetoDatos.idFactura || "",
      NumExpe: objetoDatos.nExpediente || "",
      Fecha_factura: toBigQueryDateTime(objetoDatos.fechaEmisionFactura) || null,
      Usu_Solicit: objetoDatos.usuarioEmisor || "",
      Usu_Firmant: objetoDatos.usuarioReceptor || "",
      euros_SIN_IVA: objetoDatos.importeSinIva || 0,
      Observaciones: objetoDatos.observaciones || "",
      Factura_1: objetoDatos.archivoFactura || "",
      Estado: objetoDatos.estado || "",
      Marca_temporal_cambio_de_estado: objetoDatos.marcaTemporalCambioEstado || "",
      Fact_2: objetoDatos.archivoFacturaFirmada || "",
      Albaranes: objetoDatos.albaranes || "",
      Documentacion: objetoDatos.documentacion || "",
      Objeto_Datos_contabilizada: objetoDatos.objetoContabilizar || "",
      Datos_proveedor: objetoDatos.datosProveedor || "",
      Motivo_Rechazo: objetoDatos.motivoRechazo || "",
      UC: objetoDatos.uc || "",
      PDF_Comprobante: objetoDatos.pdfComprobante || "",
      Error_Firma: objetoDatos.errorFirma || "",
      Obj_cuentaProvedor4: objetoDatos.objCuenta4 || "",
      Obj_cuentaProvedor6: objetoDatos.objCuenta6 || "",
      Obj_anotaciones: objetoDatos.objAnotaciones || "",
      Obj_unidadCoste: objetoDatos.objUnidadCoste || "",
      Obj_FechaContabilizar: objetoDatos.objFechaContabilizar || "",
      Obj_UsuarioActivo: objetoDatos.objusuarioActivo || "",
      Obj_ivaAsignado: objetoDatos.objiva || "",
      DatProv_Cif: objetoDatos.datoProvCif || "",
      DatProv_RazonSocial: objetoDatos.datoProvRazonSocial || "",
      DatProv_Asunto: objetoDatos.datoProvAsinto || "",
      DatProv_Email: objetoDatos.datoProvemail || "",
      MT_Rechazado: toBigQueryDateTime(objetoDatos.mtRechazo),
      MT_Firmado: toBigQueryDateTime(objetoDatos.mtFirmado),
      Obs_Firmado: objetoDatos.obsFirmada || "",
      MT_C_Mano: toBigQueryDateTime(objetoDatos.mtmano),
      Obs_C_Mano: objetoDatos.obsmano || "",
      MT_Contabilizada: toBigQueryDateTime(objetoDatos.mtcont),
      Script_Contabilizada: objetoDatos.scriptcont || "",
      MT_Pendiente_de_pago: toBigQueryDateTime(objetoDatos.mtpendiente),
      "Script_Pendiente de pago": objetoDatos.scriptpendiente || "",
      MT_Pagado: toBigQueryDateTime(objetoDatos.mtpagado),
      Obs_Pagado: objetoDatos.obspagado || "",
      Usu_Pagado: objetoDatos.usupagado || "",
      Script_Pagado: objetoDatos.scriptpagado || "",
      Inversion: objetoDatos.esInversion || ""
    };

    console.log("====================================================");
    console.log("📦 JSON generado para BigQuery:");
    console.log(JSON.stringify(filaBQ, null, 2));

    // ============================
    // 📤 PREPARAR JOB DE CARGA
    // ============================
    const jobConfig = {
      configuration: {
        load: {
          destinationTable: { projectId, datasetId, tableId },
          sourceFormat: "NEWLINE_DELIMITED_JSON",
          writeDisposition: "WRITE_APPEND"
        }
      }
    };

    const data = JSON.stringify(filaBQ);
    const blob = Utilities.newBlob(data, "application/json");

    console.log("🕒 Enviando job a BigQuery...");
    const job = BigQuery.Jobs.insert(jobConfig, projectId, blob);
    esperarJobBQ_(projectId, job.jobReference.jobId);

    console.log("✅ Registro insertado correctamente en BigQuery.");

  } catch (err) {
    console.error("❌ Error en guardarDatoTablaBQ:");
    console.error(err);
    // Se relanza para que quien llama no dé por guardado un registro que no existe
    throw err;
  }
}

/**
 * Espera a que termine un job de BigQuery (PENDING/RUNNING → DONE)
 * y lanza un error si el job ha fallado.
 */
function esperarJobBQ_(projectId, jobId) {
  let estado;
  do {
    Utilities.sleep(300);
    estado = BigQuery.Jobs.get(projectId, jobId);
  } while (estado.status.state !== "DONE");

  if (estado.status.errorResult) {
    const detalle = JSON.stringify(estado.status.errors || estado.status.errorResult);
    console.error("❌ Error en el job de BigQuery " + jobId + ": " + detalle);
    throw new Error("Error en BigQuery: " + detalle);
  }
  return estado;
}

/**
 * Convierte un valor en un literal de cadena de BigQuery,
 * escapando barras, comillas, saltos de línea y tabuladores.
 */
function literalCadenaBQ_(valor) {
  const texto = String(valor)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");
  return `"${texto}"`;
}
function toBigQueryDateTime(date) {
  if (!date) return null;
  try {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
  } catch (e) {
    console.error("❌ Error formateando fecha:", date, e);
    return null;
  }
}



/***********************************ACTUALIZAR DATOS*****************************************/
/*
function actualizarDatosEnHoja(idLibro, nombreHoja, nExpediente, posicion, columnasValores, columnasHoja) {
  var libro = SpreadsheetApp.openById(idLibro);
  var hoja = libro.getSheetByName(nombreHoja);
  var datos = hoja.getDataRange().getValues();
  var filaEncontrada = null; // Inicializa como null para indicar que no se ha encontrado la fila
  var actualizaciones = [];
  for (var i = 0; i < datos.length; i++) {
    if (datos[i][posicion] == nExpediente) {
      for (var j = 0; j < columnasHoja.length; j++) {
        var columnaIndex = columnasHoja[j];
        datos[i][columnaIndex] = columnasValores[j]; // Actualiza el valor en la matriz 'datos'
        actualizaciones.push({ fila: i + 1, columna: columnaIndex + 1, valor: columnasValores[j] });
      }
      filaEncontrada = datos[i]; // Asigna la fila actualizada a filaEncontrada
      break; // Salir del bucle una vez que se ha encontrado la fila
    }
  }
  // Aplicar las actualizaciones de una sola vez
  for (var k = 0; k < actualizaciones.length; k++) {
    var update = actualizaciones[k];
    hoja.getRange(update.fila, update.columna).setValue(update.valor);
  }
  return filaEncontrada; // Retorna la fila completa con valores actualizados o null si no se encontró
}*/
/***********************************
 * ACTUALIZAR DATOS EN BIGQUERY
 ***********************************/
function actualizarDatosEnHoja(projectId, datasetId, tableId, nExpediente, nombreColumnaClave, columnasValores, columnasHoja) {
  /*
    🔹 nExpediente → valor por el que buscar (por ejemplo, el idFactura)
    🔹 nombreColumnaClave → nombre del campo por el que se hace la búsqueda (por ejemplo, "ID_Factura")
    🔹 columnasValores → array con los valores nuevos
    🔹 columnasHoja → array con los nombres de columnas a actualizar

    Ejemplo de uso:
    actualizarDatosEnHojaBQ(
      'mi-proyecto',
      'DATOS_BBDD_Facturas',
      'tabla_BBDD_Facturas',
      formulario.idFactura,
      'ID_Factura',
      [JSON.stringify(newArray)],
      ['Albaranes']
    )
  */

  if (columnasHoja.length !== columnasValores.length) {
    throw new Error("❌ Las longitudes de columnasHoja y columnasValores no coinciden.");
  }

  // Construir dinámicamente el SET del UPDATE
  const setClauses = columnasHoja.map((col, i) => {
    const val = columnasValores[i];
    // Forzar conversión a string JSON en caso de que sea un array u objeto
    const safeVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `${col} = ${literalCadenaBQ_(safeVal)}`;
  }).join(', ');

  const query = `
    UPDATE \`${projectId}.${datasetId}.${tableId}\`
    SET ${setClauses}
    WHERE ${nombreColumnaClave} = ${literalCadenaBQ_(nExpediente)}
  `;

  const request = {
    query: query,
    useLegacySql: false
  };

  const job = BigQuery.Jobs.query(request, projectId);
  const result = job.jobReference.jobId;
  if (!job.jobComplete) {
    esperarJobBQ_(projectId, result);
  }

  Logger.log("✅ Actualización completada en BigQuery. Job ID: " + result);
  Logger.log("🧩 Query ejecutada:\n" + query);

  return result;
}


/*
function actualizarDatosEnHojaManteniendoHistorialFila11(idLibro, nombreHoja, idfacturainterno, posicion, columnasValores, columnasHoja) {
  var libro = SpreadsheetApp.openById(idLibro);
  var hoja = libro.getSheetByName(nombreHoja);
  var datos = hoja.getDataRange().getValues();
  var filaEncontrada = null; // Inicializa como null para indicar que no se ha encontrado la fila
  var actualizaciones = []; 
  Logger.log("actualizarDatosEnHojaManteniendoHistorialFila11")
  Logger.log("columnasValores "+columnasValores)
  Logger.log("columnasHoja "+columnasHoja)
  Logger.log("idfacturainterno "+idfacturainterno)
  
  for (var i = 0; i < datos.length; i++) {
    if (datos[i][posicion] == idfacturainterno) {
      Logger.log("entra "+idfacturainterno)
      for (var j = 0; j < columnasHoja.length; j++) {
        var columnaIndex = columnasHoja[j];
        // Verifica si la columna es la columna 11
        if (columnaIndex == 11) {
          // Obtiene el valor actual de la celda y lo suma al nuevo valor con un separador "-"
          var valorActual = datos[i][columnaIndex];
          var nuevoValor = columnasValores[j];
          columnasValores[j] = valorActual + " - " + nuevoValor;
        }
        // Actualiza el valor en la matriz 'datos'
        datos[i][columnaIndex] = columnasValores[j];
        actualizaciones.push({ fila: i + 1, columna: columnaIndex + 1, valor: columnasValores[j] });
      }
      filaEncontrada = datos[i]; // Asigna la fila actualizada a filaEncontrada
      break; // Salir del bucle una vez que se ha encontrado la fila
    }
  }
  
  // Aplicar las actualizaciones de una sola vez
  for (var k = 0; k < actualizaciones.length; k++) {
    var update = actualizaciones[k];

    Logger.log("update.fila "+update.fila+" -------------- "+"update.columna "+update.columna+" -------------- "+"update.valor "+update.valor)
    hoja.getRange(update.fila, update.columna).setValue(update.valor);
  }
  
  return filaEncontrada; // Retorna la fila completa con valores actualizados o null si no se encontró
}*/
/***********************************
 * ACTUALIZAR DATOS EN BIGQUERY MANTENIENDO HISTORIAL EN UNA COLUMNA
 ***********************************/
/**
 * Convierte una fecha tipo "dd/MM/yyyy HH:mm:ss" al formato BigQuery DATETIME.
 */
function toBigQueryDateTimeManteniendoHistorial(valor) {
  try {
    // Si NO es una cadena, no tocar
    if (typeof valor !== "string") return valor;

    // Detectar formato dd/MM/yyyy
    if (!/^\d{2}\/\d{2}\/\d{4}/.test(valor)) return valor;

    const [fecha, hora] = valor.split(" ");
    const [dd, MM, yyyy] = fecha.split("/");
    const [hh="00", mm="00", ss="00"] = (hora || "").split(":");

    const convertido = `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
    console.log(`🔄 Conversión fecha BigQuery: ${valor} → ${convertido}`);

    return convertido;

  } catch (e) {
    console.error("❌ Error convirtiendo fecha:", e);
    return valor;
  }
}



/**
 * Actualiza columnas en BigQuery y mantiene historial concatenado.
 */
function actualizarDatosEnHojaManteniendoHistorialFila11(projectId, datasetId, tableId, idFacturaInterno, columnaClave, columnasValores, columnaHistorial) {

  try {
    const table = `${projectId}.${datasetId}.${tableId}`;
    console.log("🔎 Iniciando actualización con historial en BigQuery...");
    console.log("🗝️ Clave:", idFacturaInterno);
    console.log("📋 Columnas recibidas:", JSON.stringify(columnasValores));

    // -------------------------------------------------------------
    // 1️⃣ Convertir cualquier campo fecha al formato BigQuery
    // -------------------------------------------------------------
    for (let col in columnasValores) {
      const val = columnasValores[col];

      if (typeof val === "string" && /^\d{2}\/\d{2}\/\d{4}/.test(val)) {
        columnasValores[col] = toBigQueryDateTimeManteniendoHistorial(val);
      }
    }

    console.log("📋 Columnas FINAL (post conversión):", JSON.stringify(columnasValores));

    // -------------------------------------------------------------
    // 2️⃣ Leer historial actual
    // -------------------------------------------------------------
    const querySelect = `
      SELECT ${columnaHistorial}
      FROM \`${table}\`
      WHERE ${columnaClave} = ${literalCadenaBQ_(idFacturaInterno)}
      LIMIT 1
    `;

    console.log("🔍 Query SELECT historial:", querySelect);

    const jobSelect = BigQuery.Jobs.insert(
      { configuration: { query: { query: querySelect, useLegacySql: false } } },
      projectId
    );

    let jobIdSelect = jobSelect.jobReference.jobId;
    esperarJobBQ_(projectId, jobIdSelect);

    const results = BigQuery.Jobs.getQueryResults(projectId, jobIdSelect);
    const rows = results.rows;

    const valorActualHistorial = (rows && rows.length > 0) ? rows[0].f[0].v : "";
    console.log("📜 Historial existente:", valorActualHistorial);

    // -------------------------------------------------------------
    // 3️⃣ Generar historial concatenado
    // -------------------------------------------------------------
    const nuevoHist = columnasValores[columnaHistorial] || "";
    const historialConcatenado = valorActualHistorial
      ? `${valorActualHistorial} - ${nuevoHist}`
      : nuevoHist;

    console.log("🆕 Historial concatenado:", historialConcatenado);

    // -------------------------------------------------------------
    // 4️⃣ Construcción SET para UPDATE
    // -------------------------------------------------------------
    const sanitize = v => {
      if (v === null || v === undefined) return "NULL";

      if (v instanceof Error) {
        return literalCadenaBQ_(v.toString());
      }

      if (typeof v === "object") {
        return literalCadenaBQ_(JSON.stringify(v));
      }

      if (typeof v === "string") {
        return literalCadenaBQ_(v);
      }

      return `${v}`;
    };

    const updates = Object.entries(columnasValores)
      .map(([col, val]) => {
        if (col === columnaHistorial) {
          return `${col} = ${literalCadenaBQ_(historialConcatenado)}`;
        }
        return `${col} = ${sanitize(val)}`;
      }).join(", ");


    const queryUpdate = `
      UPDATE \`${table}\`
      SET ${updates}
      WHERE ${columnaClave} = ${literalCadenaBQ_(idFacturaInterno)}
    `;

    console.log("🟦 Query UPDATE final:", queryUpdate);

    // -------------------------------------------------------------
    // 5️⃣ Ejecutar UPDATE
    // -------------------------------------------------------------
    const jobUpdate = BigQuery.Jobs.insert(
      { configuration: { query: { query: queryUpdate, useLegacySql: false } } },
      projectId
    );

    const jobIdUpdate = jobUpdate.jobReference.jobId;
    esperarJobBQ_(projectId, jobIdUpdate);

    console.log("✅ Actualización completada correctamente.");
    return true;

  } catch (err) {
    console.error("❌ Error al actualizar datos en BigQuery:", err);
    // Se relanza para que no se envíen correos ni se muestre éxito si el UPDATE ha fallado
    throw err;
  }
}

/*
function actualizarDatosEnHojaManteniendoHistorialFila11Rechazados(idLibro, nombreHoja, idfacturainterno, posicion, columnasValores, columnasHoja) {
  var libro = SpreadsheetApp.openById(idLibro);
  var hoja = libro.getSheetByName(nombreHoja);
  var datos = hoja.getDataRange().getValues();
  var filaEncontrada = null; // Inicializa como null para indicar que no se ha encontrado la fila
  var actualizaciones = []; 
  Logger.log("actualizarDatosEnHojaManteniendoHistorialFila11Rechazados")
  Logger.log("columnasValores "+columnasValores)
  Logger.log("columnasHoja "+columnasHoja)
   Logger.log("idfacturainterno "+idfacturainterno)
  
  for (var i = 0; i < datos.length; i++) {
    if (datos[i][posicion] == idfacturainterno) {
      Logger.log("entra "+idfacturainterno)
      for (var j = 0; j < columnasHoja.length; j++) {
        var columnaIndex = columnasHoja[j];
        // Verifica si la columna es la columna 11
        if (columnaIndex == 11) {
          // Obtiene el valor actual de la celda y lo suma al nuevo valor con un separador "-"
          var valorActual = datos[i][columnaIndex];
          var nuevoValor = columnasValores[j];
          columnasValores[j] = valorActual + " - " + nuevoValor;
        }
        if (columnaIndex == 13) {
          columnasValores[j] = "[]";
        }
                
        if (columnaIndex == 12) {
          // Obtiene el valor actual de la celda y lo suma al nuevo valor con un separador "-"
          var valorActual = datos[i][9];
          columnasValores[j] = valorActual;
        }
        // Actualiza el valor en la matriz 'datos'
        datos[i][columnaIndex] = columnasValores[j];
        actualizaciones.push({ fila: i + 1, columna: columnaIndex + 1, valor: columnasValores[j] });
      }
      filaEncontrada = datos[i]; // Asigna la fila actualizada a filaEncontrada
      break; // Salir del bucle una vez que se ha encontrado la fila
    }
  }
  
  // Aplicar las actualizaciones de una sola vez
  for (var k = 0; k < actualizaciones.length; k++) {
    var update = actualizaciones[k];

    Logger.log("update.fila "+update.fila+" -------------- "+"update.columna "+update.columna+" -------------- "+"update.valor "+update.valor)
    hoja.getRange(update.fila, update.columna).setValue(update.valor);
  }
  
  return filaEncontrada; // Retorna la fila completa con valores actualizados o null si no se encontró
}*/
/***********************************
 * ACTUALIZAR DATOS EN BIGQUERY (MANTENIENDO HISTORIAL Y REGLAS ESPECIALES)
 ***********************************/
function actualizarDatosEnHojaManteniendoHistorialFila11Rechazados(projectId,datasetId,tableId,idfacturainterno,columnasValores,columnasHoja) {
  const queryBase = `
    DECLARE original_factura_1 STRING;
    DECLARE original_marca_temporal STRING;
    DECLARE nuevo_marca_temporal STRING;
    
    -- Obtener valores actuales
    SET (original_factura_1, original_marca_temporal) = (
      SELECT AS STRUCT Factura_1, Marca_temporal_cambio_de_estado
      FROM \`${projectId}.${datasetId}.${tableId}\`
      WHERE ID_Factura = @idfacturainterno
      LIMIT 1
    );

    SET nuevo_marca_temporal = CONCAT(original_marca_temporal, ' - ', @nuevoMarcaTemporal);

    UPDATE \`${projectId}.${datasetId}.${tableId}\`
    SET
      ${columnasHoja.map((col, i) => {
        if (col === "Marca_temporal_cambio_de_estado") return `${col} = nuevo_marca_temporal`;
        if (col === "Albaranes") return `${col} = '[]'`;
        if (col === "Fact_2") return `${col} = original_factura_1`;
        return `${col} = @valor${i}`;
      }).join(",\n      ")}
    WHERE ID_Factura = @idfacturainterno;

    SELECT * EXCEPT(id_key)
    FROM \`${projectId}.${datasetId}.${tableId}\`
    WHERE ID_Factura = @idfacturainterno;
  `;

  const params = [
    { name: "idfacturainterno", parameterType: { type: "STRING" }, parameterValue: { value: idfacturainterno } },
    { name: "nuevoMarcaTemporal", parameterType: { type: "STRING" }, parameterValue: { value: columnasValores[columnasHoja.indexOf("Marca_temporal_cambio_de_estado")] || "" } },
    ...columnasHoja.map((col, i) => ({
      name: `valor${i}`,
      parameterType: { type: "STRING" },
      parameterValue: { value: columnasValores[i] || "" },
    })),
  ];

  const request = {
    query: queryBase,
    useLegacySql: false,
    parameterMode: "NAMED",
    queryParameters: params,
  };

  const queryResults = BigQuery.Jobs.query(request, projectId);
  return queryResults.jobComplete ? queryResults.rows : [];
}


/***********************************SUBIR ARCHIVOS*****************************************/
function subirArchivos(imgCarpeta) {
  var file = Utilities.newBlob(imgCarpeta[0].bytes, imgCarpeta[0].mineType, imgCarpeta[0].filename);
  var folder = DriveApp.getFolderById(imgCarpeta[1]);
  var createFile = folder.createFile(file)
  if (imgCarpeta[2] == 'url') {
    return createFile.getUrl()

  } else {
    return createFile.getId()

  }
}
/**************GENERAR ID***********/
function generarIdAleatorio(texto) {
  // Obtener el timestamp actual en milisegundos
  const timestamp = Date.now();
  // Generar un número aleatorio entre 0 y 999
  const numeroAleatorio = Math.floor(Math.random() * 1000);
  // Montamos el id
  const idUnico = `${texto}_${timestamp}_${numeroAleatorio}`;
  return idUnico;
}
/*
function recorrerLista(lista, formulario) {
  const refHojaCalculo = SpreadsheetApp.openById(idLibroFacturas).getSheetByName(nombreHojaAlbaranes)
  // Iterar sobre cada elemento de la lista
  for (let i = 0; i < lista.length; i++) {
    // Obtener la clave y el valor del objeto actual
    var idGenerado = generarIdAleatorio('A')
    var marcaTemporal = new Date()
    const clave = Object.keys(lista[i])[0];
    const valor = lista[i][clave];
    console.log('valor')
    console.log(valor)
    var albaran = new Albaran(marcaTemporal, idGenerado, formulario.nExpediente, valor.fechaAlbaran, clave, valor.urlArchivoAlbaran,formulario.numfacturaformulario)
    registro_general_albaran(refHojaCalculo, albaran)
    // Llamar a la función de procesamiento para cada elemento
    //procesarElemento(valor);
  }
}
/** GENERADA POR FRAN 
function recorrerListaAlbaranesFactura(lista, formulario) {
  const refHojaCalculo = SpreadsheetApp.openById(idLibroFacturas).getSheetByName(nombreHojaAlbaranes)
  // Iterar sobre cada elemento de la lista
  for (let i = 0; i < lista.length; i++) {
    // Obtener la clave y el valor del objeto actual
    var idGenerado = generarIdAleatorio('A')
    var marcaTemporal = new Date()
    const clave = Object.keys(lista[i])[0];
    const valor = lista[i][clave];
    console.log('valor')
    console.log(valor)
    /** Modificado por fran 
    if(clave != "" && valor.fechaAlbaran == "" && valor.urlArchivoAlbaran ==""){
      var bbddFirmasAppFacturas = SpreadsheetApp.openById("12_z17iG_GyRFpf0F0XbcRJy6651_6ECwOMP7NEcVtSU");
      var hojaAlbaranes =  bbddFirmasAppFacturas.getSheetByName("Albaranes");
      var datosAlbaranes = hojaAlbaranes.getDataRange().getValues();
      
      for (var z = 1; z < datosAlbaranes.length; z++) {
        var expedienteFila = datosAlbaranes[z][2];
        var claveFila = datosAlbaranes[z][4];
        
        if (expedienteFila == formulario.nExpediente && claveFila == clave) { 
          hojaAlbaranes.getRange(z+1, 7).setValue(formulario.numfacturaformulario);
          hojaAlbaranes.getRange(z+1, 9).setValue(Session.getActiveUser().getEmail());
        }
      }
    }else{
      var albaran = new Albaran(marcaTemporal, idGenerado, formulario.nExpediente, valor.fechaAlbaran, clave, valor.urlArchivoAlbaran,formulario.numfacturaformulario)
      registro_general_albaran(refHojaCalculo, albaran)
      /**COMENTADO POR SI EN UN FUTURO SE USA, CONSISTE EN QUE AL GUARDAR ALBARANES TAMBIEN GUARDE EN LA COLUMNA N DE FACTURAS EL STRING CON LA ESTRUCTURA 
      // var estructuraAlbaranesPegar = generarEstructuraAlbaranes(formulario.numfacturaformulario);

      // var ss = SpreadsheetApp.openById("12_z17iG_GyRFpf0F0XbcRJy6651_6ECwOMP7NEcVtSU"); // Abre la hoja de cálculo por ID
      // var hoja = ss.getSheetByName("Facturas"); // Obtiene la hoja llamada "Facturas"
      // var datos = hoja.getDataRange().getValues(); // Obtiene todos los datos de la hoja
      
      // // Itera sobre los datos para encontrar la fila correspondiente a la factura
      // for (var x = 0; x < datos.length; x++) {
      //   if (datos[x][2] == formulario.numfacturaformulario) { // Compara la columna C (columna 3) con idFactura
      //     hoja.getRange("N" + (x + 1)).setValue(estructuraAlbaranesPegar); // Inserta estructuraAlbaranesPegar en la columna N de la fila correspondiente
      //     break; // Termina el bucle una vez que se encuentra la factura
      //   }
      // }

    }
    // Llamar a la función de procesamiento para cada elemento
    //procesarElemento(valor);
  }
}*/
/**
 * Convierte un valor a formato DATETIME compatible con BigQuery.
 */
function convertirADateTimeBQ(valor) {
  if (!valor) return null;

  let fecha = valor;

  // Si es objeto Date
  if (valor instanceof Date) {
    fecha = Utilities.formatDate(valor, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  } 
  // Si es string tipo ISO (2025-11-17T12:09:15.897Z)
  else if (typeof valor === "string" && valor.includes("T")) {
    fecha = valor.split("T")[0] + " " + valor.split("T")[1].split(".")[0];
  } 
  // Si es string dd/MM/yyyy
  else if (/^\d{2}\/\d{2}\/\d{4}/.test(valor)) {
    const [dd, MM, yyyy] = valor.split("/"); 
    fecha = `${yyyy}-${MM}-${dd} 00:00:00`;
  }

  return fecha;
}

/**
 * Recorre la lista de albaranes y los inserta o actualiza en BigQuery.
 */
function recorrerListaAlbaranesFactura(lista, formulario) {
  const projectId = "datos-transversales";
  const datasetId = "DATOS_BBDD_Contabilidad";
  const tableId = "tabla_BBDD_Albaranes";
  const table = `${projectId}.${datasetId}.${tableId}`;
  const usuario = Session.getActiveUser().getEmail();

  console.log("🚀 Iniciando recorrerListaAlbaranesFactura_BQ...");
  console.log(`📄 Tabla destino: ${table}`);

  for (let i = 0; i < lista.length; i++) {
    const clave = Object.keys(lista[i])[0];
    const valor = lista[i][clave];
    const idGenerado = Utilities.getUuid();
    const marcaTemporal = new Date();

    console.log(`🔹 Procesando clave: ${clave}`);

    if (clave && !valor.fechaAlbaran && !valor.urlArchivoAlbaran) {
      console.log("entra clave sin fecha/archivo")
      // ✅ CASO 1: Actualizar albarán existente (sin fecha/archivo)
      const query = `
        UPDATE \`${table}\`
        SET
          ID_Factura = @numfacturaformulario,
          User_adjunta_albaran_a_factura = @usuario
        WHERE
          NumExpediente = @nExpediente
          AND NumAlbaran = @clave
      `;

      const params = [
        { name: "numfacturaformulario", parameterType: { type: "STRING" }, parameterValue: { value: formulario.numfacturaformulario } },
        { name: "usuario", parameterType: { type: "STRING" }, parameterValue: { value: usuario } },
        { name: "nExpediente", parameterType: { type: "STRING" }, parameterValue: { value: formulario.nExpediente } },
        { name: "clave", parameterType: { type: "STRING" }, parameterValue: { value: clave } }
      ];

      ejecutarQueryBQConLogs(projectId, query, params);
    } else {
      console.log("entra en nuevo albaran")
      // ✅ CASO 2: Insertar nuevo albarán
      const query = `
        INSERT INTO \`${table}\` (
          id_key,
          Marca_temp,
          ID_Albaran,
          NumExpediente,
          Fecha_albaran,
          NumAlbaran,
          Link_archivo,
          ID_Factura,
          User_crea_albaran,
          User_adjunta_albaran_a_factura
        )
        VALUES (
          @id_key,
          @marcaTemporal,
          @idGenerado,
          @nExpediente,
          @fechaAlbaran,
          @numAlbaran,
          @urlArchivoAlbaran,
          @numfacturaformulario,
          @usuario,
          @usuario
        )
      `;

      const params = [
        { name: "id_key", parameterType: { type: "STRING" }, parameterValue: { value: idGenerado } },
        { name: "marcaTemporal", parameterType: { type: "DATETIME" }, parameterValue: { value: convertirADateTimeBQ(marcaTemporal) } },
        { name: "idGenerado", parameterType: { type: "STRING" }, parameterValue: { value: idGenerado } },
        { name: "nExpediente", parameterType: { type: "STRING" }, parameterValue: { value: formulario.nExpediente } },
        { name: "fechaAlbaran", parameterType: { type: "DATETIME" }, parameterValue: { value: convertirADateTimeBQ(valor.fechaAlbaran) } },
        { name: "numAlbaran", parameterType: { type: "STRING" }, parameterValue: { value: clave } },
        { name: "urlArchivoAlbaran", parameterType: { type: "STRING" }, parameterValue: { value: valor.urlArchivoAlbaran || null } },
        { name: "numfacturaformulario", parameterType: { type: "STRING" }, parameterValue: { value: formulario.numfacturaformulario } },
        { name: "usuario", parameterType: { type: "STRING" }, parameterValue: { value: usuario } }
      ];

      ejecutarQueryBQConLogs(projectId, query, params);
    }
  }
}

/**
 * Ejecuta la query en BigQuery con logs y espera activa.
 */
function ejecutarQueryBQConLogs(projectId, query, params) {
  try {
    console.log("🟡 Ejecutando consulta en BigQuery...");
    const request = {
      configuration: {
        query: {
          query: query,
          useLegacySql: false,
          parameterMode: "NAMED",
          queryParameters: params
        }
      }
    };

    const job = BigQuery.Jobs.insert(request, projectId);
    const jobId = job.jobReference.jobId;

    esperarJobBQ_(projectId, jobId);
    console.log("✅ Job completado correctamente:", jobId);
  } catch (err) {
    console.error("🚨 Error al ejecutar consulta BQ:", err.message);
    throw err;
  }
}



function registro_general_albaran(refHojaCalculo, objeto) {
  let valores = Object.values(objeto);
  var usuario=Session.getActiveUser().getEmail();
  valores.push(usuario)
  valores.push(usuario)
  refHojaCalculo.appendRow(valores);
}
function procesarElemento(elemento) {
  // Hacer algo con el elemento, por ejemplo, imprimir las propiedades
  console.log('Fecha de Albarán:', elemento.fechaAlbaran);
  console.log('URL de Archivo de Albarán:', elemento.urlArchivoAlbaran);
  console.log('---');
}