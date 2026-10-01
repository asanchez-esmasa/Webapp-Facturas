var emailUsuarioActivo = Session.getActiveUser().getEmail()


function obtenerExpedientesDisponibles_gs() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'expedientes_disponibles_v1';
  const CHUNK_SIZE = 90 * 1024; // 90 KB (Margen seguro por debajo de los 100 KB)

  try {
    // 1️⃣ 🔹 INTENTAR RECONSTRUIR DESDE CACHÉ FRAGMENTADA
    const numChunksStr = cache.get(cacheKey + '_chunks');
    
    if (numChunksStr) {
      const numChunks = parseInt(numChunksStr, 10);
      let jsonReconstruido = '';
      let cacheCompleta = true;

      for (let i = 0; i < numChunks; i++) {
        let chunk = cache.get(cacheKey + '_part_' + i);
        if (chunk === null) {
          cacheCompleta = false; // Si falta un solo trozo (por expiración), invalidamos la caché
          break;
        }
        jsonReconstruido += chunk;
      }

      if (cacheCompleta) {
        Logger.log('✔ Expedientes devueltos con éxito desde caché fragmentada.');
        return jsonReconstruido;
      }
    }

    // 2️⃣ 🔹 SI NO HAY CACHÉ, CALCULAMOS LOS DATOS REALES
    Logger.log('▶ Calculando expedientes disponibles (sin caché)');
    const objetoControlG = expedientes_disponibles_objeto(); 

    // 3️⃣ 🔹 SERIALIZACIÓN
    const jsonFull = Utilities.jsonStringify(objetoControlG);

    // 4️⃣ 🔹 GUARDAR EN CACHÉ EN TROZOS (CHUNKING)
    let index = 0;
    let residuo = jsonFull;

    while (residuo.length > 0) {
      let trozo = residuo.substring(0, CHUNK_SIZE);
      cache.put(cacheKey + '_part_' + index, trozo, 1800); // Almacena el fragmento
      residuo = residuo.substring(CHUNK_SIZE);
      index++;
    }
    
    // Guardamos cuántos trozos se crearon para saber cómo leerlos después
    cache.put(cacheKey + '_chunks', index.toString(), 1800);

    Logger.log('✔ Expedientes calculados y guardados en caché (' + index + ' fragmentos).');
    return jsonFull;

  } catch (err) {
    Logger.log('❌ Error en obtenerExpedientesDisponibles_gs');
    Logger.log(err && err.stack ? err.stack : err);
    throw err; 
  }
}

/**
 * Elimina manualmente la caché fragmentada de los expedientes disponibles.
 * Puede ser invocada desde el editor o desde la interfaz de usuario (HTML).
 * @return {boolean} True si el proceso se ejecutó correctamente.
 */
function limpiarCacheExpedientes_gs() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'expedientes_disponibles_v1';
  
  try {
    Logger.log('▶ Iniciando proceso de limpieza de caché...');
    
    // 1️⃣ Intentar obtener el número de fragmentos almacenados
    const numChunksStr = cache.get(cacheKey + '_chunks');
    const keysToRemove = [cacheKey + '_chunks']; // Añadimos la llave principal a la lista de eliminación
    
    if (numChunksStr) {
      const numChunks = parseInt(numChunksStr, 10);
      Logger.log(`Se detectaron ${numChunks} fragmentos guardados.`);
      
      // Reconstruir los nombres de las llaves de cada trozo
      for (let i = 0; i < numChunks; i++) {
        keysToRemove.push(cacheKey + '_part_' + i);
      }
    } else {
      Logger.log('⚠ No se encontró el índice de fragmentos. Procediendo con barrido preventivo.');
      // Barrido de seguridad por si el índice expiró pero quedan fragmentos huérfanos
      for (let i = 0; i < 15; i++) {
        keysToRemove.push(cacheKey + '_part_' + i);
      }
    }
    
    // 2️⃣ Eliminación masiva en una sola llamada al servidor para optimizar rendimiento
    cache.removeAll(keysToRemove);
    
    Logger.log('✔ Caché de expedientes invalidada y removida con éxito.');
    return true;
    
  } catch (err) {
    Logger.log('❌ Error en limpiarCacheExpedientes_gs');
    Logger.log(err && err.stack ? err.stack : err);
    throw new Error('No se pudo reiniciar la caché de expedientes: ' + err.message);
  }
}



function obtenerVersionesURLcontrol_gasto() {
  //var id_ss_control = '1D7XHHNETN9ScqRnmvZcQUTX4UFAz389RKx1ZmFjPc7k'
  //var usuariosControlGasto = [id_ss_control, 'Versiones']
  //var arrayUsuarios = obtenerDatosTabla(usuariosControlGasto)
  //console.log(arrayUsuarios)
  return ""
}

function doGet(e) {
  const arrayUsuarioActivo = infoUsuario();
  Logger.log("arrayUsuarioActivo: " + arrayUsuarioActivo);

  const usuarioJSON = JSON.stringify(arrayUsuarioActivo);
  const correoUsuario = arrayUsuarioActivo?.[2] || "Correo no disponible";
  Logger.log(correoUsuario)
  const tipoUsuario = arrayUsuarioActivo?.[5] || "Correo no disponible";

  const urlAppJSON = "";

  // Datos globales
  const arrayUsuariosActivos = usuariosDatosLimitados();
  const usuariosJSON = JSON.stringify(arrayUsuariosActivos);

  // 🔹 Inicializamos objeto vacío por defecto
  let objetoControlG = {};
  //objetoControlG = expedientes_disponibles_objeto();
  // Solo si el usuario está autorizado, se carga el objeto
  const objetoControlGJSON = JSON.stringify(objetoControlG);

  const expedientesJSON = "";

  let facturasSolicitar = {}
  //facturasSolicitar = obtenerDatosTablaBQ([idProyectoBigquery, idDatasetContabilidad, idTablaFacturas], true);
  let facturasRealizar = {}
  //facturasRealizar = obtenerDatosTabla(datosFirma2, true);

  const facturasSolicitarJSON = JSON.stringify(facturasSolicitar);
  const facturasRealizarJSON = JSON.stringify(facturasRealizar);

  const nombreRuta = "Facturas";

  // Mapa de permisos simplificado
  const permisos = { 'AD': 'full', 'UE': 'partial', 'UA': 'partial' };

  // Validación de acceso
  if (correoUsuario !== emailUsuarioActivo) {
    return renderizarPagina("AccesoDenegado", usuarioJSON, '', '', '', '', '', urlAppJSON);
  }

  const nivelPermiso = permisos[tipoUsuario] || 'denegado';
  if (nivelPermiso === 'denegado') {
    return renderizarPagina("AccesoDenegado", usuarioJSON, '', '', '', '', '', urlAppJSON);
  }

  // Renderizamos la página
  return renderizarPagina(
    nombreRuta,
    usuarioJSON,
    usuariosJSON,
    expedientesJSON,
    facturasSolicitarJSON,
    facturasRealizarJSON,
    objetoControlGJSON,
    urlAppJSON
  );
}



function renderizarPagina(nombrePagina, usuario, usuarios, expedientes, facturasSolicitar, facturasRealizar, objetoControlG, urlAppJSON) {
  page = nombrePagina;
  Logger.log("Nombre de pagina a renderizar: " + nombrePagina)
  var template = HtmlService.createTemplateFromFile(page);
  template.page = page;
  template.usuario = usuario; // Pasamos el usuario al template
  template.usuarios = usuarios; // Pasamos el usuario al template
  //template.expedientes = expedientes; // Expedeintes
  template.facturasRealizar = facturasRealizar; //
  template.facturasSolicitar = facturasSolicitar; //
  template.objetoControlG = objetoControlG; //
  template.urlAppJSON = urlAppJSON; //
  Logger.log(template)
  var output = template.evaluate();
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  output.setTitle(nombrePagina);
  Logger.log(output)
  return output;
}

function infoUsuario() {
  var usuariosControlGasto = ['datos-transversales', 'DATOS_BBDD_Contratacion', 'tabla_BBDD_Usuarios']
  var arrayUsuarios = obtenerDatosTablaBQ(usuariosControlGasto,false)
  var emailBuscado = emailUsuarioActivo;
  var usuarioEncontrado = null;
  for (let i = 0; i < arrayUsuarios.length; i++) {
    var arrayUsuario = arrayUsuarios[i];
    var email = arrayUsuario[2]; // La posición 2 contiene el correo electrónico
    if (email === emailBuscado) {
      usuarioEncontrado = arrayUsuario;
      break; // Si ya se encuentra el correo, salimos del bucle
    }
  }
  Logger.log("usuarioEncontrado: " + usuarioEncontrado)
  return usuarioEncontrado
}