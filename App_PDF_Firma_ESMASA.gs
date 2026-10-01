/**Recibimos un pdf a firmar y el correo electronico del usuario, y devolvemos url del pdf firmado 
 * La funcion es asincrona, de manera que no interrumpe la ejecución.
 * La promesa devuelve resolve si todo va bien, y si hay algun error devuelve reject
 * La funcion trabaja sobre la carpeta "FIRMA PDF APP"
 * Guarda los archivos firmados en la carpeta "1XV2qNyf_uMs6tZjK0bEHWdm887PKydZk"
 * Enlace a biblioteca GitHub: https://github.com/tanaikech/PDFApp
*/
//https://drive.google.com/file/d/1JvGV4inK73t-CpwrY2FbF_axHyY6plOy/view?usp=drive_link. https://drive.google.com/file/d/1HBM2kSogixbjT_hYXsLDBdSVCAe3PY7p/view?usp=sharing
//https://drive.google.com/file/d/1POWkRV0Mo2uJdsfibJ6rgS7sWIlgMh7K/view?usp=drive_link


function ver_metadata() {
  var blob_documentoPdf = DriveApp.getFileById("1_22Nps8tRKimWTxq1i3alVtu8FTqbWUh").getAs('application/pdf');
  setPDFBlob(blob_documentoPdf).getMetadata()
    .then(res => console.log(res)
      .catch(err => console.log(err))
    )
}
function firmaFabri() {
  var id_factura = "1qghmFVdBG4BR7eS_uM_Xg5Nq4mo9VX85"
  var usuario = "Fabricio Jonathan Cruz chicaiza";
  var posicionFirma = "down";
  Logger.log(firmapdf(id_factura, usuario, posicionFirma))
  Logger.log("seguimos")
}


function firmapdf(id_factura, usuario, posicionFirma) {

  return new Promise((resolve, reject) => {

    var id_fondo_firma = "18oNGvYHgFUvFxvyB8pbSLxWFxJp3h2CT";
    var id_carpeta_firmados = "1XV2qNyf_uMs6tZjK0bEHWdm887PKydZk"
    var resgistro = SpreadsheetApp.openById("1rFB1Axo8R90OIsAtn77R3S_jUJ3v2-_yvZWL5djp-jA").getSheetByName("Registro Facturas")

    var rpl_user = usuario.replace(".", "_") //sustituimos
    var spl_user = rpl_user.split("@")


    var file = DriveApp.getFileById(id_factura);
    var nombre_file = file.getName();
    var url_file = file.getUrl()
    var blob_documentoPdf = file.getAs('application/pdf');

    var ahora = new Date();
    var ano = ahora.getFullYear();
    var mes = ahora.getMonth() + 1;
    var dia = ahora.getDate();
    var hora = ahora.getHours();
    var minu = ahora.getMinutes();
    var segu = ahora.getSeconds();
    var fecha_string = dia + "/" + mes + "/" + ano + " - " + hora + ":" + minu + ":" + segu;
    var nombre_pdf_firmado = nombre_file + "#" + fecha_string + " - " + spl_user;

    var texto_usuario = "Firmado digitalmente por: " + spl_user;
    var texto_fecha = "Fecha: " + fecha_string;


    setPDFBlob(blob_documentoPdf).getMetadata()
      .then(res => {
        var alto_pag = res.pageInfo[0].pageHeight;
        switch (posicionFirma) {
          case "up":
            var object = {
              page1: [
                { imageFileId: id_fondo_firma, x: 90, y: alto_pag - 24, scale: 0.65 },
                { text: texto_usuario, x: 115, y: alto_pag - 12, size: 10 },
                { text: texto_fecha, x: 140, y: alto_pag - 22, size: 10 },
              ],
            };
            break;
          case "down":
            var object = {
              page1: [
                { imageFileId: id_fondo_firma, x: 90, y: 2, scale: 0.65 },
                { text: texto_usuario, x: 115, y: 14, size: 10 },
                { text: texto_fecha, x: 140, y: 4, size: 10 },
              ],
            };
            break;
        }

        setPDFBlob(blob_documentoPdf).embedObjects(object)
          .then(newBlob => {
            const metadata_nuevo = {
              title: [nombre_pdf_firmado, { showInWindowTitleBar: true }],
              subject: "Factura firmada por aplicacion de ESMASA",
              author: usuario,
              creator: usuario,
              creationDate: new Date(),
              modificationDate: new Date(),
              keywords: [nombre_pdf_firmado],
              producer: "",
            };

            setPDFBlob(newBlob).udpateMetadata(metadata_nuevo)
              .then(newBlob_nuevo => {
                var id_pdf_firmado = DriveApp.getFolderById(id_carpeta_firmados).createFile(newBlob_nuevo).setName(nombre_pdf_firmado).getUrl();
                resgistro.appendRow([new Date(), url_file, usuario, res, metadata_nuevo, id_pdf_firmado])
                resolve(id_pdf_firmado);
              })
              .catch(err => {
                console.error(err);
                reject(err);
              })
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });
      })
      .catch(err => {
        console.error(err);
        reject(err);
      });
  })
    .catch(err => {
      console.error(err);
      reject(err);
    })
}

function mergue_pdfs() {
  var ss = SpreadsheetApp.openById("1XfROhaEa_vCG2Q8XBS1czuzz4Tufn2ffrXoXDFl4xRA").getSheetByName("Mergue_brea")
  var data = ss.getDataRange().getValues()
  var pdfBlobs = []
  data.forEach(function (x, i) {
    var url = x[7]
    var id_file = obtenerIdDesdeURL(url)
    Logger.log(id_file)
    var blob = DriveApp.getFileById(id_file).getBlob();
    var pdf_blob = convertirJpgABlobPdf(blob)
    pdfBlobs.push(pdf_blob)

  })

  Logger.log(pdfBlobs)


  mergePDFs(pdfBlobs)
    .then(newBlob => DriveApp.getFolderById("1tnKj6NlPP5J7KQeVEuEXnLFY9oe4FC2s").createFile(newBlob).setName("Las mulas - Enero"))
    .catch(err => console.log(err))
}


// Función para convertir un blob de imagen JPG a un blob de PDF
function convertirJpgABlobPdf(blob) {
  var doc = DocumentApp.create('temp');
  var body = doc.getBody()
  var parrafo = body.appendParagraph("").setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  var foto = parrafo.appendInlineImage(blob);
  var alturafoto = foto.getHeight();              //recuperamos alto de la foto original
  var anchofoto = foto.getWidth();                //recuperamos ancho de la foto original
  var valorancho = 800;                        //valor del ancho que queremos en el documento
  if (anchofoto > alturafoto) {
    var proporcion = valorancho / anchofoto;          //calcular proporcion entre ancho de foto y ancho de foto en el documento
    var valoralto = alturafoto * proporcion;        //aplicamos proporcion al alto
    foto.setWidth(valorancho).setHeight(valoralto); //le damos los valores de ancho y alto a la foto para ponerla en el documento
  } else {
    var proporcion = valorancho / alturafoto;
    var valoralto = valorancho;
    var valoranchofoto = anchofoto * proporcion;
    foto.setWidth(valoranchofoto).setHeight(valoralto); //le damos los valores de ancho y alto a la foto para ponerla en el documento
  }
  var pdf = doc.getAs('application/pdf');
  doc.saveAndClose();

  // Convertir el PDF a Blob
  var pdfBytes = pdf.getBytes();
  var pdfBlob = Utilities.newBlob(pdfBytes, 'application/pdf', 'nombre_archivo.pdf');

  return pdfBlob;
}

function obtenerIdDesdeURL(url) {
  // Expresión regular para extraer el ID del enlace de Google Drive
  var idRegex = /(?:id=|\/d\/|\/file\/d\/|\/open\?id=)([\w-]{25,})/;

  // Intenta hacer coincidir la URL con la expresión regular
  var match = url.match(idRegex);

  // Si se encuentra una coincidencia, devuelve el ID
  if (match && match[1]) {
    return match[1];
  } else {
    // Si no se encuentra ninguna coincidencia, devuelve null
    return null;
  }
}

