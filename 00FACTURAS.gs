//Class Factura
class Factura {
  constructor(marcaTemporal, numeroFactura, idFactura, nExpediente, fechaEmisionFactura, usuarioEmisor, usuarioReceptor, importeSinIva, observaciones, archivoFactura, estado, marcaTemporalCambioEstado, archivoFacturaFirmada, albaranes, documentacion, objetoContabilizar, datosProveedor, motivoRechazo, uc, pdfComprobante, errorFirma, objCuenta4, objCuenta6, objAnotaciones, objUnidadCoste, objFechaContabilizar, objusuarioActivo, objiva, datoProvCif, datoProvRazonSocial, datoProvAsinto, datoProvemail, mtRechazo, mtFirmado, obsFirmada, mtmano, obsmano, mtcont, scriptcont, mtpendiente, scriptpendiente, mtpagado, obspagado, usupagado, scriptpagado, esInversion) {
    this.marcaTemporal = marcaTemporal;
    this.numeroFactura = numeroFactura;
    this.idFactura = idFactura;
    this.nExpediente = nExpediente;
    this.fechaEmisionFactura = fechaEmisionFactura;
    this.usuarioEmisor = usuarioEmisor;
    this.usuarioReceptor = usuarioReceptor;
    this.importeSinIva = importeSinIva;
    this.observaciones = observaciones;
    this.archivoFactura = archivoFactura;
    this.estado = estado;
    this.marcaTemporalCambioEstado = marcaTemporalCambioEstado;
    this.archivoFacturaFirmada = archivoFacturaFirmada;
    this.albaranes = albaranes;
    this.documentacion = documentacion;
    this.objetoContabilizar = objetoContabilizar;
    this.datosProveedor = datosProveedor;
    this.motivoRechazo = motivoRechazo;
    this.uc = uc;
    this.pdfComprobante = pdfComprobante;
    this.errorFirma = errorFirma;
    this.objCuenta4 = objCuenta4;
    this.objCuenta6 = objCuenta6;
    this.objAnotaciones = objAnotaciones;
    this.objUnidadCoste = objUnidadCoste;
    this.objFechaContabilizar = objFechaContabilizar;
    this.objusuarioActivo = objusuarioActivo;
    this.objiva = objiva;
    this.datoProvCif = datoProvCif;
    this.datoProvRazonSocial = datoProvRazonSocial;
    this.datoProvAsinto = datoProvAsinto;
    this.datoProvemail = datoProvemail;
    this.mtRechazo = mtRechazo;
    this.mtFirmado = mtFirmado;
    this.obsFirmada = obsFirmada;
    this.mtmano = mtmano;
    this.obsmano = obsmano;
    this.mtcont = mtcont;
    this.scriptcont = scriptcont;
    this.mtpendiente = mtpendiente;
    this.scriptpendiente = scriptpendiente;
    this.mtpagado = mtpagado;
    this.obspagado = obspagado;
    this.usupagado = usupagado;
    this.scriptpagado = scriptpagado;
    this.esInversion = esInversion;
  }
}
//Class Proveedor
class Proveedor {
  constructor(asunto, cif, email, razon) {
    this.asunto = asunto;
    this.cif = cif;
    this.email = email;
    this.razon = razon;
  }
}
//Class Factura firmada
class FacturaFirmada {
  constructor(marcaTemporal, idFactura, nExpediente, usuarioFirmante, observaciones, archivoFactura, estado) {
    this.marcaTemporal = marcaTemporal;
    this.idFactura = idFactura;
    this.nExpediente = nExpediente;
    this.usuarioFirmante = usuarioFirmante;
    this.observaciones = observaciones;
    this.archivoFactura = archivoFactura;
    this.estado = estado;
  }
}
//Class Factura contabilizar a mano
class FacturaContabilizadaMano {
  constructor(cuantiaFactura, selectProvedor, cifProveedor, selectUsuario, estadoFactura, nExpedienteFactura, anotacionesContablizacion, fechaFactura1, selectNexpediente, asuntoProveedor, razonProveedor, fechaFactura, idFactura, usuarioFactura, ivaAsignado, emailProveedor, idFacturaContabilizar, uc) {
    this.cuantiaFactura = cuantiaFactura;
    this.selectProvedor = selectProvedor;
    this.cifProveedor = cifProveedor;
    this.selectUsuario = selectUsuario;
    this.estadoFactura = estadoFactura;
    this.nExpedienteFactura = nExpedienteFactura;
    this.anotacionesContablizacion = anotacionesContablizacion;
    this.fechaFactura1 = fechaFactura1;
    this.selectNexpediente = selectNexpediente;
    this.asuntoProveedor = asuntoProveedor;
    this.razonProveedor = razonProveedor;
    this.fechaFactura = fechaFactura;
    this.idFactura = idFactura;
    this.usuarioFactura = usuarioFactura;
    this.ivaAsignado = ivaAsignado;
    this.emailProveedor = emailProveedor;
    this.idFacturaContabilizar = idFacturaContabilizar;
    this.uc = uc;
  }
}
//Albaranes
class Albaran {
  constructor(marcaTemp, idAlbaran, numExpediente, fechaAlbaran, numAlbaran, linkArchivo, idFactura) {
    this.marcaTemp = marcaTemp;
    this.idAlbaran = idAlbaran;
    this.numExpediente = numExpediente;
    this.fechaAlbaran = fechaAlbaran;
    this.numAlbaran = numAlbaran;
    this.linkArchivo = linkArchivo;
    this.idFactura = idFactura;
  }
}
//Solicitud de firma INSERT BIGQUERY
function guardarDatosSolicitudFirmaFactura2(formulario) {
  try {
    Logger.log("Inicio función")
    Logger.log(formulario.checkFirma)
    Logger.log('formulario')
    Logger.log(formulario.datosNexpedientes)
    var folder = DriveApp.getFolderById('13uZGbVRs3qC3eHgIgLVjOo93wn2pMCsC');
    // RECONSTRUCCIÓN DEL ARCHIVO
    // En lugar de: var file = formulario.archivos0.copyBlob();
    var decoded = Utilities.base64Decode(formulario.archivoBase64);
    var blob = Utilities.newBlob(decoded, 'application/pdf', formulario.archivoNombre);
    
    var createFile = folder.createFile(blob);
    createFile.setName('1.Factura: ' + formulario.nFactura + '.pdf');

    Logger.log(formulario)
    var objetoInfoUsuarioUC = ""
    try {
      var objetoInfoUsuario = JSON.parse(formulario.infoUsuarioInput)
      objetoInfoUsuarioUC = objetoInfoUsuario.infoUsuario[5];
    } catch (e) {
      objetoInfoUsuarioUC = ""
    }
    var arrayNexpediente

    if (formulario.datosNexpedientes !== undefined) {
      arrayNexpediente = JSON.parse(formulario.datosNexpedientes)
    } else {
      arrayNexpediente = []
    }
    Logger.log("num 1")
    //Generamos id factura
    var idGenerado = generarIdAleatorio('F')
    //Objeto Proveedor
    var objetoProveedor = new Proveedor(formulario.asuntoProveedor, formulario.cifProveedor, formulario.emailProveedor, formulario.razonProveedor)
    var objetoStringProveedor = JSON.stringify(objetoProveedor)
    //Cuerpo correos
    //var cuerpoEnvioErroneoFactura = generarCuerpoEnvioErroneoFactura('a')
    //Marca temporal
    var fechaEmision
    var marcaTemporal = new Date()
    if (formulario.fechaFactura) {
      fechaEmision = new Date(formulario.fechaFactura)
    } else {
      fechaEmision = ''
    }
    Logger.log("num 2")
    //Historico marcas temporales
    var historiaEstado = { marcaTemporal: marcaTemporal, estado: 'Pendiente de revisión', usuario: usuarioActivo(), observaciones: formulario.obsFactura }
    var historiaEstadoString = JSON.stringify(historiaEstado);

    var objetoFactura
    var usuarioSelecionado = formulario.selectUsuario;
    if (usuarioSelecionado != "Sin responsable") {
      usuarioSelecionado = usuarioSelecionado + '@esmasalcorcon.com'
    }
    var esInversion = (formulario.checkInversion === "on") ? "Es una inversión" : "No es una inversión";
    /** MODIFICADO POR FRAN PUSE   == "on" y cambie historiaEstadoString*/
    var facturaFormula = '="' + formulario.nFactura + '"'
    Logger.log("---------------------formulario.nFactura----------------" + formulario.nFactura)
    Logger.log("---------------------facturaFormula----------------" + facturaFormula)
    if (formulario.checkFirma == "on" || usuarioSelecionado == "Sin responsable") {

      historiaEstado = { marcaTemporal: marcaTemporal, estado: 'Firmado', usuario: usuarioActivo(), observaciones: formulario.obsFactura }
      historiaEstadoString = JSON.stringify(historiaEstado);
      //Montamos el objeto 
      objetoFactura = new Factura(marcaTemporal, formulario.nFactura, idGenerado, formulario.selectNexpediente, fechaEmision, usuarioActivo(), usuarioSelecionado, formatearNumeroPasarPuntosAComaDosDecimales(formulario.inporteFactura), formulario.obsFactura, createFile.getUrl(), 'Firmado', historiaEstadoString, createFile.getUrl(), 'Sin albaranes', 'Sin pdf completo', 'ObjetoContabilizar', objetoStringProveedor, '-', objetoInfoUsuarioUC, "", "", "", "", "", "", "", "", "", formulario.cifProveedor, formulario.razonProveedor, formulario.asuntoProveedor, formulario.emailProveedor, "", marcaTemporal, "", "", "", "", "", "", "", "", "", "", "", esInversion)
    } else {
      objetoFactura = new Factura(marcaTemporal, formulario.nFactura, idGenerado, formulario.selectNexpediente, fechaEmision, usuarioActivo(), usuarioSelecionado, formatearNumeroPasarPuntosAComaDosDecimales(formulario.inporteFactura), formulario.obsFactura, createFile.getUrl(), 'Pendiente de revisión', historiaEstadoString, 'Aun sin firmar', 'Sin albaranes', 'Sin pdf completo', 'ObjetoContabilizar', objetoStringProveedor, '-', objetoInfoUsuarioUC, "", "", "", "", "", "", "", "", "", formulario.cifProveedor, formulario.razonProveedor, formulario.asuntoProveedor, formulario.emailProveedor, "", "", "", "", "", "", "", "", "", "", "", "", "", esInversion)
    }
    Logger.log("num 3")
    var cuerpoSolicitudFirma = generarCuerpoSolicitudFirma(objetoFactura)

    //INSERT BIGQUERY (antes de enviar correos: si falla, no se avisa de una factura que no existe)
    try {
      guardarDatoTabla(idProyectoBigquery, idDatasetContabilidad, idTablaFacturas, objetoFactura)
    } catch (errorInsert) {
      createFile.setTrashed(true) // El PDF subido quedaría huérfano
      throw errorInsert
    }

    if (objetoFactura.usuarioReceptor != "Sin responsable") {
      Logger.log("entra con responsable")
      //Enviar correo de la solicitud
      enviarCorreoConAdjunto(objetoFactura.usuarioReceptor, 'Solicitud firma factura: ' + objetoFactura.numeroFactura, cuerpoSolicitudFirma, '')
      if (objetoFactura.usuarioReceptor == usuarioManteniminetoRuiz) {
        var cuerpoSolicitudAdjuntarAlbaranes = generarCuerpoSolicitudAdjuntarAlbaranes(objetoFactura)
        enviarCorreoConAdjunto(usuarioManteniminetoCorrochano, 'Solicitud firma factura: ' + objetoFactura.numeroFactura, cuerpoSolicitudAdjuntarAlbaranes, '')
        enviarCorreoConAdjunto(usuarioTallerTaller, 'Solicitud firma factura: ' + objetoFactura.numeroFactura, cuerpoSolicitudAdjuntarAlbaranes, '')
      }
    }
    /** MANTENER CEROS EN EL NUMERO DE FACTURAS */
    // var ss = SpreadsheetApp.openById(idLibroFacturas);
    // var sheet = ss.getSheetByName(nombreHojaFacturasSolicitarFirma);

    // // Obtener el número de la última fila con datos
    // var ultimaFila = sheet.getLastRow();

    // // Establecer el rango de las últimas 10 filas o menos si hay menos de 10 filas
    // var primeraFila = Math.max(1, ultimaFila - 9);

    // // Iterar sobre las últimas 10 filas en la columna B
    // for (var i = primeraFila; i <= ultimaFila; i++) {
    //   var valor = sheet.getRange(i, 2).getValue(); // Obtener el valor de la columna B

    //   // Verificar si hay "borrar" al principio del valor en la columna B
    //   if (valor.substring(0, 6) === "borrar") {
    //     // Eliminar el texto "borrar" del principio de la celda
    //     sheet.getRange(i, 2).setValue(valor.substring(6));
    //   }
    // }

    Logger.log("num 4")
    // Enviar correo si no es contratacion quien envia la factura
    // var datos = expedientes_disponibles_objeto(objetoFactura.nExpediente)
    // var conjuntoDatos = { ...datos[0].ng, ...datos[0].cm, ...datos[0].li }
    // var datosTipoExpediente = conjuntoDatos[objetoFactura.nExpediente]
    // var emailProveedor = datosTipoExpediente.datos_prov.email
    // if (objetoFactura.usuarioEmisor !== contratacion) {
    // formulario.emailProveedor
    //   enviarCorreoConAdjunto(emailProveedor, 'Envio erroneo de factura', cuerpoEnvioErroneoFactura, formulario.idArchivoFormulario)
    // }
    // Enviar correo a contratacion para informar que no existe ningun contrato para realizar la facturacion
    // if (objetoFactura.nExpediente=='Sin contrato'){
    //   enviarCorreoConAdjunto(contratacion, 'Envio erroneo de factura', cuerpoEnvioErroneoFactura, formulario.idArchivoFormulario)
    // }
    var stringObjeto = JSON.stringify(objetoFactura);
    const objeto = JSON.parse(stringObjeto);
    Logger.log("num 5")
    return objeto
  }catch (e){
    Logger.log("ERROR CAPTURADO: " + e.toString());
    throw new Error("Fallo en el servidor: " + e.message);
  }

}
// Función para formatear el número
function formatearNumeroPasarPuntosAComaDosDecimales(numero) {

  // Convertir el número a string
  var numeroString = numero.toString();

  // Comprobar si el string tiene coma
  if (numeroString.includes(',')) {
    // Si tiene coma, reemplazarla por un punto
    numeroString = numeroString.replace(',', '.');
  }

  // Redondear el número con dos decimales
  var numeroRedondeado = parseFloat(parseFloat(numeroString).toFixed(2));

  return numeroRedondeado;
}

function formatearMarcaTemporal(fecha) {
  var dia = fecha.getDate().toString().padStart(2, '0');
  var mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Suma 1 porque los meses se indexan desde 0
  var ano = fecha.getFullYear();
  var horas = fecha.getHours().toString().padStart(2, '0');
  var minutos = fecha.getMinutes().toString().padStart(2, '0');
  var segundos = fecha.getSeconds().toString().padStart(2, '0');
  return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
}

//Firmar factura
function firmaFactura(formulario) {
  Logger.log("Inicio funcion firmaFactura")
  for (var prop in formulario) {
    Logger.log(prop + ": " + formulario["obsFactura"]);
  }
  Logger.log("funcion firmaFactura")
  Logger.log("formulario" + formulario)
  Logger.log("formulario.arrayDatosFacturaAntesDeFirma" + formulario.arrayDatosFacturaAntesDeFirma)
  var datosAntesDeFirmar = JSON.parse(formulario.arrayDatosFacturaAntesDeFirma)
  Logger.log("datosAntesDeFirmar" + datosAntesDeFirmar)
  var marcaTemporal = new Date()
  // URL del enlace proporcionado
  const url = formulario.idArchivoFactura;

  // Expresión regular para extraer el ID del enlace
  const regex = /\/d\/([a-zA-Z0-9_-]+)\//;
  const match = url.match(regex);

  // El ID se encuentra en la posición 1 de la coincidencia
  const idDelArchivo = match && match[1];

  // Imprimir el ID del archivo
  var arrayUsuarioActivo = infoUsuario()

  firmapdf(idDelArchivo, usuarioActivo(), 'down').then((id_pdf_firmado) => {
    try {
    console.log("entra al then ")
    console.log(id_pdf_firmado)
    var objetoFactura = new FacturaFirmada(marcaTemporal, formulario.idFactura, 'nExpediente', usuarioActivo(), formulario.obsFactura, id_pdf_firmado, 'Firmado')
    var historiaEstado = { marcaTemporal: new Date, estado: 'Firmado', usuario: usuarioActivo(), observaciones: formulario["obsFactura"] }
    var marcaTemporalHistoriaEstado = formatearMarcaTemporal(historiaEstado.marcaTemporal);
    var observacionesHistoriaEstado = historiaEstado.observaciones;

    var historiaEstadoString = JSON.stringify(historiaEstado);
    var objeto1
    Logger.log("formulario.arrayAlbaranes " + formulario.arrayAlbaranes)
    if (formulario.arrayAlbaranes == "Sin albaranes") {
      objeto1 = {}
    } else {
      objeto1 = JSON.parse(formulario.arrayAlbaranes);
    }
    var columnasValores
    Logger.log("formulario.idFactura: " + formulario.idFactura)
    var arrayAlbaranesModificado = generarEstructuraAlbaranes(formulario.idFactura)
    Logger.log("formulario.objetoConjuntoFacturas" + formulario.objetoConjuntoFacturas)
    if (formulario.objetoConjuntoFacturas == "") {
      Logger.log("entra if formulario.objetoConjuntoFacturas ")
      columnasValores = ["Firmado", historiaEstadoString, id_pdf_firmado, arrayAlbaranesModificado, marcaTemporalHistoriaEstado, observacionesHistoriaEstado]
    } else {
      Logger.log("entra else formulario.objetoConjuntoFacturas ")
      var objeto2 = JSON.parse(formulario.objetoConjuntoFacturas);
      var conjunto = { ...objeto1[0], ...objeto2[0] }
      var conjuntoString = JSON.stringify(conjunto)
      /** array hecho por fran */
      //columnasValores = [formulario["obsFactura"],"Firmado", historiaEstadoString, id_pdf_firmado, arrayAlbaranesModificado]
      columnasValores = ["Firmado", historiaEstadoString, id_pdf_firmado, arrayAlbaranesModificado, marcaTemporalHistoriaEstado, observacionesHistoriaEstado]
    }
    /*
    
        Logger.log("formulario.arrayAlbaranes " + formulario.arrayAlbaranes)
        Logger.log("columnasValores " + columnasValores)
        //var columnasValores = ["Firmado", historiaEstadoString, id_pdf_firmado]
        //columnas que hay que sustituir
        //var columnasHoja = [8,10, 11, 12, 13]
    
    */
    var columnasHoja = ["Estado", "Marca_temporal_cambio_de_estado", "Fact_2", "Albaranes", "MT_Firmado", "Obs_Firmado"]
    var columnaDatos = {
    "Estado": columnasValores[0],
    "Marca_temporal_cambio_de_estado": columnasValores[1],
    "Fact_2": columnasValores[2],
    "Albaranes": columnasValores[3],
    "MT_Firmado": columnasValores[4],
    "Obs_Firmado": columnasValores[5]
  }
    actualizarDatosEnHojaManteniendoHistorialFila11(idProyectoBigquery, idDatasetContabilidad, idTablaFacturas, formulario.idFactura,"ID_Factura",columnaDatos, "Marca_temporal_cambio_de_estado")
    //guardarDatoTabla(idLibroFacturas, nombreHojaFacturasFirmasRealizadas, objetoFactura)
    var cuerpoA = generarCuerpoFirmaRealizada(objetoFactura, datosAntesDeFirmar)
    enviarCorreoConAdjunto(usuarioActivo(), 'Firma realizada Nª:' + datosAntesDeFirmar[1], cuerpoA, '')
    //guardarDatoTabla(idLibroFacturas, nombreHojaFacturasSolicitarFirma, objetoFactura)
    } catch (errorTrasFirma) {
      // La firma ya está hecha: no se pasa al bloque de error de firma para no perder el PDF firmado
      console.error("❌ Error después de firmar la factura " + formulario.idFactura + " (PDF firmado: " + id_pdf_firmado + "): " + (errorTrasFirma && errorTrasFirma.stack ? errorTrasFirma.stack : errorTrasFirma))
    }
  }, (error) => {
    var errorRecibido = error;
    console.log("entra al catch " + errorRecibido)
    console.log("datosAntesDeFirmar[16]  " + datosAntesDeFirmar[16])
    console.log(" typeof datosAntesDeFirmar[16]  " + typeof datosAntesDeFirmar[16])
    let objetoFatosEmpresa = typeof datosAntesDeFirmar[16] === 'string' ? JSON.parse(datosAntesDeFirmar[16]) : datosAntesDeFirmar[16];

    let cif = objetoFatosEmpresa.cif ? objetoFatosEmpresa.cif : "";
    console.log("cif  " + cif)
    let razon = objetoFatosEmpresa.razon ? objetoFatosEmpresa.razon : "";
    console.log("razon  " + razon)
    // Inicializar proveedor
    let proveedor = "";

    // Verificar si tanto cif como razon no están vacíos
    if (cif !== "" && razon !== "") {
      proveedor = `${cif} / ${razon}`;
    } else if (cif !== "") {
      proveedor = cif;
    } else if (razon !== "") {
      proveedor = razon;
    }
    //GENERAMOS PDF COMPROBANTE DE FIRMA
    let fechaSolicitudFirma = datosAntesDeFirmar[0].split(' ')[0];
    let numFactura = datosAntesDeFirmar[1];
    let idFactura = datosAntesDeFirmar[2];
    let numExpediente = datosAntesDeFirmar[3];
    let fechaFactura = datosAntesDeFirmar[4].split(' ')[0];
    let usuarioSolicitud = datosAntesDeFirmar[5];
    let usuarioFirmante = arrayUsuarioActivo[0];
    let precioSinIva = datosAntesDeFirmar[7];
    let observacionessolicitante = datosAntesDeFirmar[8];
    let observacionesfirmante = formulario["obsFactura"];
    let urlFactura = datosAntesDeFirmar[9];
    let emailFirmante = Session.getActiveUser().getEmail();
    let marcaTemporalComprobacion = obtenerMarcaTemporalDDMMYYYYHHmm();

    // Suponiendo que generarPDFFirmaFacturaSustituta es una función que acepta estos parámetros
    let id_pdf_firmado = generarPDFFirmaFacturaSustituta(fechaSolicitudFirma, numFactura, idFactura, numExpediente, fechaFactura, usuarioSolicitud, usuarioFirmante, precioSinIva, observacionessolicitante, observacionesfirmante, urlFactura, proveedor, razon, emailFirmante, marcaTemporalComprobacion)
    console.log("objetoFactura")
    console.log("marcaTemporal" + marcaTemporal)
    console.log("formulario.idFactura" + formulario.idFactura)
    console.log("usuarioActivo()" + emailFirmante)
    console.log("formulario.obsFactura" + formulario.obsFactura)
    console.log("id_pdf_firmado" + id_pdf_firmado)

    var objetoFactura = new FacturaFirmada(marcaTemporal, formulario.idFactura, 'nExpediente', emailFirmante, formulario.obsFactura, id_pdf_firmado, 'Firmado')
    var historiaEstado = { marcaTemporal: new Date, estado: 'Firmado', usuario: emailFirmante, observaciones: formulario["obsFactura"] }
    var marcaTemporalHistoriaEstado = formatearMarcaTemporal(historiaEstado.marcaTemporal);
    var observacionesHistoriaEstado = historiaEstado.observaciones;
    var historiaEstadoString = JSON.stringify(historiaEstado);

    var objeto1;
    Logger.log("formulario.arrayAlbaranes " + formulario.arrayAlbaranes)
    if (formulario.arrayAlbaranes == "Sin albaranes") {
      objeto1 = {}
    } else {
      objeto1 = JSON.parse(formulario.arrayAlbaranes);
    }
    var columnasValores
    var arrayAlbaranesModificado = generarEstructuraAlbaranes(formulario.idFactura)
    Logger.log("formulario.objetoConjuntoFacturas" + formulario.objetoConjuntoFacturas)
    if (formulario.objetoConjuntoFacturas == "") {
      Logger.log("entra if formulario.objetoConjuntoFacturas ")
      columnasValores = ["Firmado", historiaEstadoString, "", arrayAlbaranesModificado, id_pdf_firmado, errorRecibido, marcaTemporalHistoriaEstado, observacionesHistoriaEstado]
    } else {
      Logger.log("entra else formulario.objetoConjuntoFacturas ")
      var objeto2 = JSON.parse(formulario.objetoConjuntoFacturas);
      var conjunto = { ...objeto1[0], ...objeto2[0] }
      var conjuntoString = JSON.stringify(conjunto)
      /** array hecho por fran */
      //columnasValores = [formulario["obsFactura"],"Firmado", historiaEstadoString, id_pdf_firmado, arrayAlbaranesModificado]
      columnasValores = ["Firmado", historiaEstadoString, "", arrayAlbaranesModificado, id_pdf_firmado, errorRecibido, marcaTemporalHistoriaEstado, observacionesHistoriaEstado]
    }
    /*
    Logger.log("formulario.arrayAlbaranes " + formulario.arrayAlbaranes)
    Logger.log("columnasValores " + columnasValores)
    */
    //var columnasValores = ["Firmado", historiaEstadoString, id_pdf_firmado]
    //columnas que hay que sustituir
    //var columnasHoja = [8,10, 11, 12, 13]
    var columnasHoja = [10, 11, 12, 13, 19, 20, 33, 34]
    //actualizarDatosEnHojaManteniendoHistorialFila11(idLibroFacturas, nombreHojaFacturasSolicitarFirma, formulario.idFactura, 2, columnasValores, columnasHoja)
    var columnaDatos = {
    "Estado": columnasValores[0],
    "Marca_temporal_cambio_de_estado": columnasValores[1],
    "Fact_2": columnasValores[2],
    "Albaranes": columnasValores[3],
    "PDF_Comprobante": columnasValores[4],
    "Error_Firma": columnasValores[5],
    "MT_Firmado": columnasValores[6],
    "Obs_Firmado": columnasValores[7]
  }
    actualizarDatosEnHojaManteniendoHistorialFila11(idProyectoBigquery, idDatasetContabilidad, idTablaFacturas, formulario.idFactura,"ID_Factura",columnaDatos, "Marca_temporal_cambio_de_estado")
    //guardarDatoTabla(idLibroFacturas, nombreHojaFacturasFirmasRealizadas, objetoFactura)
    var cuerpoA = generarCuerpoFirmaRealizada(objetoFactura, datosAntesDeFirmar)
    enviarCorreoConAdjunto(usuarioActivo(), 'Firma realizada Nª:' + datosAntesDeFirmar[1], cuerpoA, '')
    //guardarDatoTabla(idLibroFacturas, nombreHojaFacturasSolicitarFirma, objetoFactura)

  });
}
/*
function generarEstructuraAlbaranes(idFacturaRecibida) {
  // Abrir el spreadsheet y seleccionar la hoja Albaranes
  var spreadsheet = SpreadsheetApp.openById("12_z17iG_GyRFpf0F0XbcRJy6651_6ECwOMP7NEcVtSU");
  var hojaAlbaranes = spreadsheet.getSheetByName("Albaranes");

  // Obtener los datos de la hoja
  var data = hojaAlbaranes.getDataRange().getValues();

  // Inicializar un array para almacenar la estructura generada
  var estructura = [];

  // Recorrer los datos y generar la estructura
  for (var i = 1; i < data.length; i++) { // Empezamos desde 1 para omitir la fila de encabezados
    var fila = data[i];
    var idFactura = fila[6]; // Columna G
    var nAlbaran = fila[4]; // Columna E
    var fechaAlbaran = fila[3]; // Columna D

    //Se hace esta verificación por si no se ha metido la fecha en el Albaran
    if (fechaAlbaran instanceof Date) {
      var dia = ("0" + (fechaAlbaran.getDate())).slice(-2); // Agrega cero al inicio si es necesario y toma los últimos dos caracteres
      var mes = ("0" + (fechaAlbaran.getMonth() + 1)).slice(-2); // Agrega cero al inicio si es necesario y toma los últimos dos caracteres
      var anio = fechaAlbaran.getFullYear();
    } else {
      var dia = "DD"
      var mes = "MM"
      var anio = "YYYY"
    }
    // Formato: YYYY-MM-DD
    fechaAlbaran = anio + "-" + mes + "-" + dia;

    var urlArchivoAlbaran = fila[5]; // Columna F

    // Verificar si el id de albarán coincide
    if (idFactura == idFacturaRecibida) {
      // Generar la estructura y agregarla al array
      var elemento = {};
      elemento[nAlbaran] = {
        fechaAlbaran: fechaAlbaran,
        urlArchivoAlbaran: urlArchivoAlbaran
      };
      estructura.push(elemento);
    }
  }
  estructura = JSON.stringify(estructura)
  // Imprimir la estructura generada en el registro
  Logger.log(estructura);
  return estructura
}*/
function generarEstructuraAlbaranes(idFacturaRecibida) {
  const projectId = "datos-transversales";
  const datasetId = "DATOS_BBDD_Contabilidad";
  const tableId = "tabla_BBDD_Albaranes";
  const table = `${projectId}.${datasetId}.${tableId}`;

  console.log(`📄 Generando estructura de albaranes para factura: ${idFacturaRecibida}`);

  const query = `
    SELECT
      NumAlbaran,
      Fecha_albaran,
      Link_archivo
    FROM \`${table}\`
    WHERE ID_Factura = @idFactura
    ORDER BY Fecha_albaran
  `;

  const params = [
    {
      name: "idFactura",
      parameterType: { type: "STRING" },
      parameterValue: { value: idFacturaRecibida }
    }
  ];

  try {
    // Ejecutamos la query
    const jobRequest = {
      configuration: {
        query: {
          query: query,
          useLegacySql: false,
          parameterMode: "NAMED",
          queryParameters: params
        }
      }
    };

    const queryJob = BigQuery.Jobs.insert(jobRequest, projectId);
    const jobId = queryJob.jobReference.jobId;

    // Esperar activamente a que termine
    let jobStatus;
    do {
      Utilities.sleep(1000);
      jobStatus = BigQuery.Jobs.get(projectId, jobId);
    } while (jobStatus.status.state !== "DONE");

    if (jobStatus.status.errorResult) {
      throw new Error("Error en la consulta: " + jobStatus.status.errorResult.message);
    }

    const rows = BigQuery.Jobs.getQueryResults(projectId, jobId).rows || [];

    // Construir estructura igual que el Apps Script original
    const estructura = rows.map(row => {
      const numAlbaran = row.f[0].v;
      const fecha = row.f[1].v;
      const url = row.f[2].v;

      let fechaFormateada = "YYYY-MM-DD";
      if (fecha) {
        const d = new Date(fecha);
        const dia = ("0" + d.getDate()).slice(-2);
        const mes = ("0" + (d.getMonth() + 1)).slice(-2);
        const anio = d.getFullYear();
        fechaFormateada = `${anio}-${mes}-${dia}`;
      }

      const elemento = {};
      elemento[numAlbaran] = {
        fechaAlbaran: fechaFormateada,
        urlArchivoAlbaran: url
      };
      return elemento;
    });

    const estructuraJSON = JSON.stringify(estructura);
    console.log("✅ Estructura generada:", estructuraJSON);
    return estructuraJSON;

  } catch (err) {
    console.error("🚨 Error al generar estructura de albaranes:", err.message);
    return "[]";
  }
}

//Rechazar facturas
function rechazarFactura(formulario) {
  console.log("formulario rechazado " + formulario)
  console.log("formulario rechazado " + JSON.stringify(formulario))

  var historiaEstado = { marcaTemporal: new Date, estado: 'Rechazado', usuario: usuarioActivo(), observaciones: formulario.motivoRechazo }
  var marcaTemporalHistoriaEstado = formatearMarcaTemporal(historiaEstado.marcaTemporal);
  var historiaEstadoString = JSON.stringify(historiaEstado);

  var columnasValores = ["Rechazado", historiaEstadoString, formulario.motivoRechazo, "", "", marcaTemporalHistoriaEstado]
  //columnas que hay que sustituir
  var columnasHoja = [10, 11, 17, 13, 12, 32]
  //actualizarDatosEnHojaManteniendoHistorialFila11Rechazados(idLibroFacturas, nombreHojaFacturasSolicitarFirma, formulario.idFacturaRechazar, 2, columnasValores, columnasHoja)
  //actualizarDatosEnHojaManteniendoHistorialFila11Rechazados(idProyectoBigquery, idDatasetContabilidad, idTablaFacturas,formulario.idFacturaRechazar,columnasValores,columnasHoja)
  var columnaDatos = {
    "Estado": columnasValores[0],
    "Marca_temporal_cambio_de_estado": columnasValores[1],
    "Motivo_Rechazo": columnasValores[2],
    "Albaranes": columnasValores[3],
    "Fact_2": columnasValores[4],
    "MT_Rechazado": columnasValores[5]
  }
  actualizarDatosEnHojaManteniendoHistorialFila11(idProyectoBigquery, idDatasetContabilidad, idTablaFacturas, formulario.idFacturaRechazar,"ID_Factura",columnaDatos, "Marca_temporal_cambio_de_estado")
  var cuerpoA = generarCuerpoFacturaRechazo(formulario)
  enviarCorreoConAdjunto(usuarioActivo(), 'Factura rechazada', cuerpoA)

  //enviarCorreoConAdjunto(formulario.emailProveedor, 'Factura rechazada', cuerpoA)
}


function adjuntarAlbaranesAlaFacturaGs(formulario) {
  console.log(formulario)
  var arrayAlbaranes
  // Verificar si formulario.arrayAlbaranes está vacío o no está definido
  if (!formulario.arrayAlbaranes || formulario.arrayAlbaranes.trim() === "Sin albaranes") {
    formulario.arrayAlbaranes = "[]"; // Asignar un JSON válido de un array vacío si está vacío o no está definido
    arrayAlbaranes = JSON.parse(formulario.arrayAlbaranes);
  } else {
    arrayAlbaranes = JSON.parse(formulario.arrayAlbaranes);
  }

  const arrayAlbaranesPorAdjuntar = JSON.parse(formulario.arrayAlbaranesPorAdjuntar);
  // Concatenar los arrays
  const albaranesCombinados = [...arrayAlbaranes, ...arrayAlbaranesPorAdjuntar];
  var idFactura = formulario.idFactura
  // Parseamos el JSON contenido en la propiedad arrayAlbaranes

  console.log(arrayAlbaranes);
  console.log(arrayAlbaranesPorAdjuntar);
  console.log(albaranesCombinados);

  var stringObjeto = JSON.stringify(albaranesCombinados);

  // Recorremos cada elemento del array
  albaranesCombinados.forEach(albaran => {
    // Extraemos el objeto albaran dentro del objeto actual
    const nombreAlbaran = Object.keys(albaran)[0];
    const detalleAlbaran = albaran[nombreAlbaran];

    // Accedemos a las propiedades del objeto albaran
    const fechaAlbaran = detalleAlbaran.fechaAlbaran;
    const urlArchivoAlbaran = detalleAlbaran.urlArchivoAlbaran;

    // Haces lo que necesites con los datos de cada albarán
    console.log("Nombre del albarán:", nombreAlbaran);
    console.log("Fecha del albarán:", fechaAlbaran);
    console.log("URL del archivo del albarán:", urlArchivoAlbaran);
    columnasValores = [idFactura]
    var columnasHoja = [6]
    actualizarDatosEnHoja(idLibroFacturas, nombreHojaAlbaranes, nombreAlbaran, 4, columnasValores, columnasHoja)
    return albaranesCombinados
  });



  var objeto1
  var historiaEstado = { marcaTemporal: new Date, estado: 'Adjuntar Albaranes', usuario: usuarioActivo() }
  var historiaEstadoString = JSON.stringify(historiaEstado);
  if (formulario.arrayAlbaranes == "Sin albaranes") {
    objeto1 = {}
  } else {
    objeto1 = JSON.parse(formulario.arrayAlbaranesPorAdjuntar);
  }

  var columnasValores = [historiaEstadoString, stringObjeto]
  var columnasHoja = [11, 13]

  //actualizarDatosEnHojaManteniendoHistorialFila11(idLibroFacturas, nombreHojaFacturasSolicitarFirma, formulario.idFactura, 2, columnasValores, columnasHoja)
  var columnaDatos = {
    "Marca_temporal_cambio_de_estado": columnasValores[0],
    "Albaranes": columnasValores[1]
  }
  actualizarDatosEnHojaManteniendoHistorialFila11(idProyectoBigquery, idDatasetContabilidad, idTablaFacturas, formulario.idFactura,"ID_Factura",columnaDatos, "Marca_temporal_cambio_de_estado")
}
/*
function pagarAManoGS(array) {
  var spreadsheet = SpreadsheetApp.openById("12_z17iG_GyRFpf0F0XbcRJy6651_6ECwOMP7NEcVtSU");
  var hojaFacturas = spreadsheet.getSheetByName("Facturas");

  // Obtener todos los datos de la hoja
  var data = hojaFacturas.getDataRange().getValues();
  var idFactura = array[0].replace(/\//g, '');
  var observaciones = array[1]
  Logger.log('idFactura' + idFactura);
  // Iterar sobre las filas para buscar el idFactura en la columna C
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] == idFactura) { // Columna C es el índice 2 (cero basado)
      // Actualizar la columna K (índice 10) con "Pagada"
      hojaFacturas.getRange(i + 1, 11).setValue('Pagada'); // i + 1 porque los índices de getRange son 1-basados

      // Actualizar la columna AP (índice 41) con new Date()
      hojaFacturas.getRange(i + 1, 42).setValue(formatearMarcaTemporal(new Date()));

      // Actualizar la columna AQ (índice 42) con 
      hojaFacturas.getRange(i + 1, 43).setValue(observaciones);

      // Actualizar la columna AR (índice 43) con el usuario activo
      hojaFacturas.getRange(i + 1, 44).setValue(usuarioActivo());

      // Salir de la función una vez encontrado y actualizado
      return;
    }
  }

  Logger.log('Factura no encontrada');
}*/
function pagarAManoGS(array) {
  const projectId = "datos-transversales";
  const datasetId = "DATOS_BBDD_Contabilidad";
  const tableId = "tabla_BBDD_Facturas";

  const idFactura = array[0].replace(/\//g, '');
  const observaciones = array[1];
  const usuario = Session.getActiveUser().getEmail();

  // Fecha compatible con DATETIME BigQuery
  const fechaActual = convertirADateTimeBQ_FechaHora(new Date());

  console.log("🧾 ID Factura:", idFactura);
  console.log("📄 Observaciones:", observaciones);

  const query = `
    UPDATE \`${projectId}.${datasetId}.${tableId}\`
    SET 
      Estado = 'Pagada',
      MT_C_Mano = '${fechaActual}',
      Obs_C_Mano = '${observaciones}',
      Usu_Pagado = '${usuario}'
    WHERE REPLACE(ID_Factura, '/', '') = '${idFactura}'
  `;

  const request = {
    query: query,
    useLegacySql: false
  };

  try {
    const job = BigQuery.Jobs.insert(request, projectId);
    const jobId = job.jobReference.jobId;

    let finishedJob = BigQuery.Jobs.get(projectId, jobId);
    while (finishedJob.status.state !== "DONE") {
      Utilities.sleep(1000);
      finishedJob = BigQuery.Jobs.get(projectId, jobId);
    }

    if (finishedJob.status.errorResult) {
      console.error("❌ Error en BigQuery:", finishedJob.status.errorResult.message);
    } else {
      console.log("✅ Factura actualizada correctamente en BigQuery.");
    }

  } catch (e) {
    console.error("❌ Error en pagarAManoBQ:", e);
  }
}


//Contabilizar a mano
function contabulizarManoGs(formulario) {
  console.log("contabulizarManoGs----------------------");
  console.log(JSON.stringify(formulario));

  const facturaContabilizada = new FacturaContabilizadaMano(formulario.cuantiaFactura, formulario.selectProveedor, formulario.cifProveedor, formulario.selectUsuario, formulario.estadoFactura, formulario.nExpedienteFactura, formulario.anotacionesContablizacion, formulario.fechaFactura1, formulario.selectNexpediente, formulario.asuntoProveedor, formulario.razonProveedor, formulario.fechaFactura, formulario.idFactura, formulario.usuarioFactura, formulario.ivaAsignado, '', formulario.idFacturaContabilizar);

  var observacionesContabilizar = formulario.anotacionesContablizacion;

  var historiaEstado = { marcaTemporal: new Date, estado: 'C.Mano', usuario: usuarioActivo(), observaciones: observacionesContabilizar }

  var marcaTemporalContabilizar = formatearMarcaTemporal(historiaEstado.marcaTemporal);

  var historiaEstadoString = JSON.stringify(historiaEstado);

  var stringObjeto = JSON.stringify(facturaContabilizada);
  var columnasValores = ['C.Mano', historiaEstadoString, stringObjeto, marcaTemporalContabilizar, observacionesContabilizar]
  //columnas que hay que sustituir
  var columnasHoja = [10, 11, 15, 35, 36]
  //guardarDatoTabla(idLibroFacturas, nombreHojaFacturasFirmasRealizadas, facturaContabilizada)
  //actualizarDatosEnHojaManteniendoHistorialFila11(idLibroFacturas, nombreHojaFacturasSolicitarFirma, facturaContabilizada.idFacturaContabilizar, 2, columnasValores, columnasHoja)
  var columnaDatos = {
    "Estado": columnasValores[0],
    "Marca_temporal_cambio_de_estado": columnasValores[1],
    "Objeto_Datos_contabilizada": columnasValores[2],
    "MT_C_Mano": columnasValores[3],
    "Obs_C_Mano": columnasValores[4]
  }
  actualizarDatosEnHojaManteniendoHistorialFila11(idProyectoBigquery, idDatasetContabilidad, idTablaFacturas, formulario.idFacturaContabilizar,"ID_Factura",columnaDatos, "Marca_temporal_cambio_de_estado")
  const objeto = JSON.parse(stringObjeto);

  /** AQUI SE PASA A PAGADO EN CASO DE HABER PUESTO ALGO EN EL CAMPO DEL SELECT PAGADO ( PASAR A PAGADO ) */
  if (formulario.selectPagado != "") {
    actualizarFacturaAPagada(facturaContabilizada.idFacturaContabilizar, formulario.selectPagado);
  }

  return objeto
}
/*
function actualizarFacturaAPagada(idFacturaInno, motivoPagada) {
  var ss = SpreadsheetApp.openById("12_z17iG_GyRFpf0F0XbcRJy6651_6ECwOMP7NEcVtSU");
  var sheet = ss.getSheetByName("Facturas");

  var data = sheet.getDataRange().getValues();
  var user = Session.getActiveUser().getEmail();
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  for (var i = 0; i < data.length; i++) {
    if (data[i][2] == idFacturaInno) { // Columna C es la columna 3 en el índice 0
      sheet.getRange(i + 1, 11).setValue("Pagada"); // Columna K es la columna 11 en el índice 0
      sheet.getRange(i + 1, 42).setValue(timestamp); // Columna AP es la columna 42 en el índice 0
      sheet.getRange(i + 1, 43).setValue(motivoPagada); // Columna AQ es la columna 43 en el índice 0
      sheet.getRange(i + 1, 44).setValue(user); // Columna AR es la columna 44 en el índice 0
      break;
    }
  }
}*/
function convertirADateTimeBQ_FechaHora(valor) {
  if (!valor) return null;

  // Si es objeto Date
  if (valor instanceof Date) {
    return Utilities.formatDate(
      valor,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd HH:mm:ss"
    );
  }

  // Si es string ISO: 2025-11-14T08:59:57.146Z
  if (typeof valor === "string" && valor.includes("T")) {
    const [fecha, hora] = valor.split("T");
    const horaSinMs = hora.split(".")[0]; 
    return `${fecha} ${horaSinMs}`;
  }

  // dd/MM/yyyy HH:mm:ss
  if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(valor)) {
    const [fecha, hora] = valor.split(" ");
    const [dd, MM, yyyy] = fecha.split("/");
    return `${yyyy}-${MM}-${dd} ${hora}`;
  }

  // dd/MM/yyyy (sin hora → hora 00:00:00)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    const [dd, MM, yyyy] = valor.split("/");
    return `${yyyy}-${MM}-${dd} 00:00:00`;
  }

  return valor;
}

function actualizarFacturaAPagada(idFacturaInno, motivoPagada) {
  const projectId = "datos-transversales";
  const datasetId = "DATOS_BBDD_Contabilidad";
  const tableId = "tabla_BBDD_Facturas";

  const usuario = Session.getActiveUser().getEmail();

  // Fecha corregida
  const fechaActual = convertirADateTimeBQ_FechaHora(new Date());

  const idFactura = idFacturaInno; // ya no se hace REPLACE porque tú no lo haces

  const query = `
    UPDATE \`${projectId}.${datasetId}.${tableId}\`
    SET 
      Estado = 'Pagada',
      MT_C_Mano = '${fechaActual}',
      Obs_C_Mano = '${motivoPagada}',
      Usu_Pagado = '${usuario}'
    WHERE REPLACE(ID_Factura, '/', '') = '${idFactura}'
  `;

  const request = { query: query, useLegacySql: false };

  try {
    const job = BigQuery.Jobs.insert(request, projectId);
    const jobId = job.jobReference.jobId;

    // Esperar a que termine el job
    let finishedJob = BigQuery.Jobs.get(projectId, jobId);
    while (finishedJob.status.state !== "DONE") {
      Utilities.sleep(1000);
      finishedJob = BigQuery.Jobs.get(projectId, jobId);
    }

    if (finishedJob.status.errorResult) {
      console.error("❌ Error en BigQuery:", finishedJob.status.errorResult.message);
    } else {
      console.log("✅ Factura actualizada a Pagada correctamente en BigQuery.");
    }
  } catch (e) {
    console.error("❌ Error en actualizarFacturaAPagadaBQ:", e);
  }
}


//Guardar albaranes
function guardarAlbaranes(formulario) {
  console.log(formulario)
  var objetoFacturas = JSON.parse(formulario.objetoConjuntoFacturas)
  recorrerListaAlbaranesFactura(objetoFacturas, formulario);
  return objetoFacturas
}
//Obtener cuenta contable
function obtenerCuentaContable() {
  var arrayCuentasContables6 = cuentas_contables_6() //biblioteca Eliminada
  return arrayCuentasContables6
}
function proveedores_codigo_contable_4(cif) {
  var arrayCuentasContables4 = proveedores_codigo_contable_4_2(cif) //biblioteca Eliminada 
  return arrayCuentasContables4
}




//Generar cuerpo de corrreos
function generarCuerpoSolicitudFirma(objetoFactura) {
  var cuerpo = `<html><body>`
  cuerpo += `<p>Buenos dias ` + objetoFactura.usuarioReceptor + `</p>`
  cuerpo += `<p>Le informamos que el usuario: ` + objetoFactura.usuarioEmisor + ` ha solicitado su firma para la factura: ` + objetoFactura.numeroFactura + `</p>`
  cuerpo += `<p>Por favor, proceda con la firma lo antes posible accediendo a la aplicacion.</p>`
  cuerpo += `<p>https://sites.google.com/esmasalcorcon.com/control-de-gasto/inicio</p>`
  cuerpo += `<p>Gracias.</p>`
  cuerpo += `</body></html>`
  return cuerpo
}
function generarCuerpoFirmaRealizada(objetoFactura, datosAntesDeFirmar) {
  var cuerpo = `<html><body><p>Buenos días:</p>`
  cuerpo += `<p>Le informamos que el usuario: ` + objetoFactura.usuarioFirmante + ` ha firmado la factura : ` + datosAntesDeFirmar[1] + `</p>`
  cuerpo += `<p>Para visualizar la factura firmada accede a la aplicación</p>`
  cuerpo += `<p>https://sites.google.com/esmasalcorcon.com/control-de-gasto/inicio</p>`
  cuerpo += `<p>Gracias.</p>`
  cuerpo += `</body></html>`
  return cuerpo;
}
function generarCuerpoFacturaRechazo() {
  var cuerpo = `<html><body><p>Buenos días:</p>
    <p>Le informamos que la factura ha sido rechazada.</p>
    <p>Muchas gracias.</p></body></html>`;
  return cuerpo;
}

function generarCuerpoSolicitudAdjuntarAlbaranes(objetoFactura) {
  var cuerpo = `<html><body>`
  cuerpo += `<p>Buenos dias ` + usuarioManteniminetoCorrochano + `</p>`
  cuerpo += `<p>Le informamos que el usuario: ` + objetoFactura.usuarioEmisor + ` ha solicitado la firma ha ` + objetoFactura.usuarioReceptor + `, para la factura: ` + objetoFactura.numeroFactura + `</p>`
  cuerpo += `<p>Por favor, proceda ha adjuntar los albaranes correspondientes a la factura.</p>`
  cuerpo += `<p>https://sites.google.com/esmasalcorcon.com/control-de-gasto/inicio</p>`
  cuerpo += `<p>Gracias.</p>`
  cuerpo += `</body></html>`
  return cuerpo
}
function generarCuerpoEnvioErroneoFactura(enlaceFactura) {
  var cuerpo = `<html><body><p>Buenos días:</p>
    <p>Le informamos que la factura recibida , deberia ser enviada a contrattacion :</p>
    <p>Muchas gracias .</p></body></html>`;

  return cuerpo;
}
/*
function desvincularAlbaranDeFacturaGS(idAlbaran) {
  Logger.log(idAlbaran)
  var bbddFirmaFacturas = SpreadsheetApp.openById("12_z17iG_GyRFpf0F0XbcRJy6651_6ECwOMP7NEcVtSU");
  var hojaAlbaranes = bbddFirmaFacturas.getSheetByName("Albaranes");
  var hojaHistorial = bbddFirmaFacturas.getSheetByName("Historial Albaranes");

  var data = hojaAlbaranes.getDataRange().getValues();
  var rowToUpdate = -1;

  for (var i = 0; i < data.length; i++) {
    if (data[i][1] == idAlbaran) {
      var fila = data[i];
      fila.push("Desvinculo el albarán(" + fila[4] + ") de la factura (" + fila[6] + ") desde la app facturas");
      fila.push(new Date());
      fila.push(Session.getActiveUser().getEmail());
      hojaHistorial.appendRow(fila);
      rowToUpdate = i + 1;
      break;
    }
  }

  if (rowToUpdate !== -1) {
    hojaAlbaranes.getRange(rowToUpdate, 7).setValue("")
    hojaAlbaranes.getRange(rowToUpdate, 9).setValue("")
  }

  // var arrayAlbaranesRenderizar=[];
  // var arrayAlbaranesSinFiltrar= SpreadsheetApp.openById("12_z17iG_GyRFpf0F0XbcRJy6651_6ECwOMP7NEcVtSU").getSheetByName("Albaranes").getDataRange().getValues();
  // for (var i = 0; i < arrayAlbaranesSinFiltrar.length; i++) {
  //   if (arrayAlbaranesSinFiltrar[i][6] === "") { // Comprueba si la columna G está vacía
  //     arrayAlbaranesRenderizar.push(arrayAlbaranesSinFiltrar[i]);
  //   }
  // }
  // return JSON.stringify(arrayAlbaranesRenderizar)
}*/

function desvincularAlbaranDeFacturaGS(idAlbaran) {
  const projectId = 'datos-transversales';
  const datasetId = 'DATOS_BBDD_Contabilidad';
  const tablaAlbaranes = 'tabla_BBDD_Albaranes';
  const tablaHistorial = 'tabla_BBDD_Historial_Albaranes';
  const usuario = Session.getActiveUser().getEmail();

  try {
    console.log("🚀 Iniciando desvinculación de albarán:", idAlbaran);

    // 🔹 1. Obtener los datos del albarán antes de modificarlo
    const selectQuery = `
      SELECT *
      FROM \`${projectId}.${datasetId}.${tablaAlbaranes}\`
      WHERE ID_Albaran = @idAlbaran
      LIMIT 1
    `;
    const selectParams = [
      { name: "idAlbaran", parameterType: { type: "STRING" }, parameterValue: { value: idAlbaran } }
    ];

    const selectJob = BigQuery.Jobs.insert({
      configuration: {
        query: {
          query: selectQuery,
          useLegacySql: false,
          parameterMode: "NAMED",
          queryParameters: selectParams
        }
      }
    }, projectId);

    const jobId = selectJob.jobReference.jobId;
    let jobStatus;
    do {
      Utilities.sleep(500);
      jobStatus = BigQuery.Jobs.get(projectId, jobId);
    } while (!jobStatus.status.state || jobStatus.status.state !== "DONE");

    const results = BigQuery.Jobs.getQueryResults(projectId, jobId);
    const rows = results.rows;
    if (!rows || rows.length === 0) {
      console.warn(`⚠️ No se encontró el albarán con ID: ${idAlbaran}`);
      return `⚠️ No se encontró el albarán con ID: ${idAlbaran}`;
    }

    // 🔹 2. Convertir los datos a objeto
    const fields = results.schema.fields.map(f => f.name);
    const albaran = {};
    rows[0].f.forEach((cell, i) => albaran[fields[i]] = cell.v);

    // 🔹 3. Preparar fechas en formato DATETIME
    const fechaAlbaranBQ = albaran.Fecha_albaran ? convertirADateTimeBQ(albaran.Fecha_albaran) : null;
    const marcaTemporalBQ = convertirADateTimeBQ(new Date());

    // 🔹 4. Insertar registro en Historial usando parámetros
    const textoHistorico = `Desvinculo el albarán (${albaran.NumAlbaran || idAlbaran}) de la factura (${albaran.ID_Factura || 'sin factura'}) desde la app facturas`;

    const insertHistorialQuery = `
      INSERT INTO \`${projectId}.${datasetId}.${tablaHistorial}\`
      (id_key, Marca_temp, ID_Albaran, Fecha_albaran, NumAlbaran, Link_archivo, ID_Factura, User_crea_albaran, User_adjunta_albaran_a_factura, Historico, Marca_Temporal, Usuario)
      VALUES (
        GENERATE_UUID(),
        @marcaTemporal,
        @idAlbaran,
        @fechaAlbaran,
        @numAlbaran,
        @linkArchivo,
        @idFactura,
        @userCrea,
        @userAdjunta,
        @historico,
        @marcaTemporal,
        @usuario
      )
    `;

    const insertParams = [
      { name: "marcaTemporal", parameterType: { type: "DATETIME" }, parameterValue: { value: marcaTemporalBQ } },
      { name: "idAlbaran", parameterType: { type: "STRING" }, parameterValue: { value: albaran.ID_Albaran || '' } },
      { name: "fechaAlbaran", parameterType: { type: "DATETIME" }, parameterValue: { value: fechaAlbaranBQ } },
      { name: "numAlbaran", parameterType: { type: "STRING" }, parameterValue: { value: albaran.NumAlbaran || '' } },
      { name: "linkArchivo", parameterType: { type: "STRING" }, parameterValue: { value: albaran.Link_archivo || '' } },
      { name: "idFactura", parameterType: { type: "STRING" }, parameterValue: { value: albaran.ID_Factura || '' } },
      { name: "userCrea", parameterType: { type: "STRING" }, parameterValue: { value: albaran.User_crea_albaran || '' } },
      { name: "userAdjunta", parameterType: { type: "STRING" }, parameterValue: { value: albaran.User_adjunta_albaran_a_factura || '' } },
      { name: "historico", parameterType: { type: "STRING" }, parameterValue: { value: textoHistorico } },
      { name: "usuario", parameterType: { type: "STRING" }, parameterValue: { value: usuario } }
    ];

    ejecutarQueryBQConLogs(projectId, insertHistorialQuery, insertParams);

    // 🔹 5. Actualizar albarán: limpiar los campos de vinculación
    const updateQuery = `
      UPDATE \`${projectId}.${datasetId}.${tablaAlbaranes}\`
      SET 
        ID_Factura = '',
        User_adjunta_albaran_a_factura = ''
      WHERE ID_Albaran = @idAlbaran
    `;
    const updateParams = [
      { name: "idAlbaran", parameterType: { type: "STRING" }, parameterValue: { value: idAlbaran } }
    ];
    ejecutarQueryBQConLogs(projectId, updateQuery, updateParams);

    console.log(`✅ Albarán ${idAlbaran} desvinculado correctamente.`);
    return `✅ Albarán ${idAlbaran} desvinculado correctamente.`;

  } catch (error) {
    console.error("❌ Error en desvincularAlbaranDeFacturaBQ:", error);
    return `❌ Error al desvincular el albarán: ${error.message}`;
  }
}

// Convierte a formato DATETIME compatible con BigQuery
/*function convertirADateTimeBQ(fecha) {
  const d = new Date(fecha);
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}*/


function moveFileId(fileId, toFolderId) {
  var file = DriveApp.getFileById(fileId);
  var source_folder = DriveApp.getFileById(fileId).getParents().next();
  var folder = DriveApp.getFolderById(toFolderId)
  folder.addFile(file);
  source_folder.removeFile(file);
}

function generarPDFFirmaFacturaSustituta(fechasolicitudfirma, numfactura, idfactura, numexpediente, fechafactura, usuariosolicitud, usuariofirmante, preciosiniva, observacionessolicitante, observacionesfirmante, urlfactura, proveedorComprobacion, razonsocialcomprobacion, usuarioactivo, marcatemporal) {

  id_PlantillaFactura = "1qsHAsH5oT9l7Xjl4K1MDoYFk2viOTU5mrVXv3qKzJRg"
  id_carpetadestino = "1XV2qNyf_uMs6tZjK0bEHWdm887PKydZk" //Carpeta de subida de las facturas firmadas

  //Generamos el doc
  var a = DriveApp.getFileById(id_PlantillaFactura).makeCopy("ConformidadFactura_" + idfactura, DriveApp.getFolderById(id_carpetadestino)).getId();
  var doc = DocumentApp.openById(a);
  var body_doc = doc.getBody();

  body_doc.replaceText("<<fechasolicitud>>", fechasolicitudfirma)
  body_doc.replaceText("<<numfactura>>", numfactura)
  body_doc.replaceText("<<idfactura>>", idfactura)
  body_doc.replaceText("<<nexpediente>>", numexpediente)
  body_doc.replaceText("<<fechafactura>>", fechafactura)
  body_doc.replaceText("<<usuariosolicitante>>", usuariosolicitud)
  body_doc.replaceText("<<usuariofirmante>>", usuariofirmante)
  body_doc.replaceText("<<preciosiniva>>", preciosiniva)
  body_doc.replaceText("<<observacionessolicitante>>", observacionessolicitante)
  body_doc.replaceText("<<observacionesfirmante>>", observacionesfirmante)
  body_doc.replaceText("<<urlfactura>>", urlfactura)
  body_doc.replaceText("<<proveedorcomprobacion>>", proveedorComprobacion)
  body_doc.replaceText("<<razonsocial>>", razonsocialcomprobacion)
  body_doc.replaceText("<<usuarioactivo>>", usuarioactivo)
  body_doc.replaceText("<<fechafirma>>", marcatemporal)


  //CONVERTIR A PDF EL DOCUMENTO
  doc.saveAndClose();

  //convertir documento a pdf y almacenarlo en la carpeta documentos generados\pdf
  var docFolder = DriveApp.getFolderById(id_carpetadestino).getId(); //carpeta de destino
  var docblob = doc.getAs('application/pdf');    //añadir extension pdf 
  docblob.setName(doc.getName() + ".pdf");
  var file = DriveApp.createFile(docblob);
  var linkpdf = file.getUrl()   //cogemos el link al pdf generado para ponerlo en una columna del spreadsheet
  var fileId = file.getId();
  moveFileId(fileId, docFolder);

  DriveApp.getFileById(a).setTrashed(true)

  return linkpdf


}
function obtenerMarcaTemporalDDMMYYYYHHmm() {
  // Obtenemos la marca temporal actual
  const marcaTemporal = new Date();

  // Obtenemos los componentes de la fecha
  const dia = marcaTemporal.getDate().toString().padStart(2, '0'); // Día
  const mes = (marcaTemporal.getMonth() + 1).toString().padStart(2, '0'); // Mes (los meses en JavaScript son base 0)
  const ano = marcaTemporal.getFullYear(); // Año

  // Obtenemos los componentes de la hora
  const horas = marcaTemporal.getHours().toString().padStart(2, '0'); // Horas
  const minutos = marcaTemporal.getMinutes().toString().padStart(2, '0'); // Minutos

  // Construimos la cadena con el formato deseado
  const marcaTemporalFormateada = `${dia}/${mes}/${ano} ${horas}:${minutos}`;

  return marcaTemporalFormateada;
}



