# Limitación pendiente — Envío de emails con AWS SES

## Contexto

En el proyecto Taskify dejé preparada la funcionalidad para enviar correos desde la aplicación, especialmente para acciones como el resumen de tareas por email y notificaciones relacionadas con el uso del sistema.

La integración fue planteada usando AWS SES como servicio de envío de correos.

## Qué quedó hecho

Se avanzó con la estructura técnica necesaria para el envío de emails:

- Servicio de envío desde el frontend/backend.
- Endpoint/API para procesar el envío.
- Validaciones básicas del payload.
- Tests unitarios para casos de éxito y error.
- Manejo de errores cuando AWS SES no responde o no está configurado correctamente.
- Variables de entorno previstas para configurar AWS SES.

## Qué no llegué a completar

No pude dejar funcionando el envío real de correos en producción.

El motivo principal fue que AWS SES no quedó habilitado en modo producción. Al no poder sacar la cuenta de AWS SES del modo sandbox, el sistema no puede enviar emails libremente a usuarios reales.

## Causa técnica

AWS SES, por defecto, trabaja inicialmente en modo sandbox. En ese modo existen restricciones importantes:

- Solo permite enviar correos a direcciones o dominios previamente verificados.
- No permite enviar libremente a cualquier usuario final.
- La cuenta debe solicitar y obtener acceso a producción para poder operar como servicio real de emails.
- La habilitación depende de la aprobación de AWS.

En mi caso, no logré completar esa aprobación o puesta en producción dentro del tiempo disponible, por lo que el envío real de emails quedó pendiente.

## Estado actual

La funcionalidad no está descartada ni eliminada.

Quedó preparada a nivel de código, pero limitada por la configuración externa de AWS SES.

Actualmente el sistema puede validar la lógica y los tests relacionados, pero no se puede garantizar el envío real a destinatarios finales mientras AWS SES siga sin acceso productivo.

## Impacto en el proyecto

La aplicación puede seguir funcionando sin el envío real de emails.

Lo que queda afectado es:

- Envío de resumen de tareas por correo.
- Notificaciones reales por email.
- Confirmaciones externas que dependan de correo.
- Validación completa del flujo productivo de emails.

El resto del sistema no depende directamente de AWS SES para funcionar.

## Qué faltaría hacer más adelante

Para completar esta parte sería necesario:

1. Verificar correctamente el email o dominio remitente en AWS SES.
2. Configurar las variables de entorno reales:
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SES_FROM_EMAIL`
3. Solicitar acceso a producción en AWS SES.
4. Esperar la aprobación de AWS.
5. Probar envío real a correos no verificados.
6. Validar el flujo completo desde la aplicación.
7. Recién después considerar esta funcionalidad como cerrada.

## Decisión tomada

Por falta de tiempo y por depender de una aprobación externa de AWS, decidí dejar documentada esta limitación y no bloquear el resto del avance del proyecto.

La parte de emails queda como funcionalidad pendiente por configuración productiva de AWS SES, no como falla principal del código de la aplicación.
