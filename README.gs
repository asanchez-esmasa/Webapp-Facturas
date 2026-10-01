/* 
Apuntes:
- Los permisos de los usuarios están separados de los que pueden entrar y los que pueden contabilizar, estos ultimos estan hardcodeados en una lista dentro de ObtenerDatosJS en una variable llamada usuariosConCuenta6, lo ideal sería mover esta lista a BQ o introducir un nuevo tipo de usuario en la bbdd de usuarios, este permiso hace que solo a las personas de esa lista les carguen las cuentas 6, haciendo que no pueden entrar en el botón de inspeccionar para contabilizar.

- La conexión con sage está en 0000BIBLIOTECAS_CAMBIAR_SI_SE_MODIFICA, ahi están las funciones para interactuar con sage, si se cambia de servicio habría que modificar estas mismas para que la aplicación funcione correctamente
 */ 
