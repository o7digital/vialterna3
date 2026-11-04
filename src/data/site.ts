export const navigation = [
  { label: "Soluciones", href: "#soluciones" },
  { label: "Industrias", href: "#industrias" },
  { label: "Empresa", href: "/empresa/" },
  { label: "Noticias", href: "/insights/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Contacto", href: "/contacto/" }
];

export const approaches = [
  {
    title: "SD-WAN sobre una sola red",
    text: "El tráfico se gestiona, pero la red subyacente sigue siendo un punto único de falla y los firewalls por sitio elevan el costo."
  },
  {
    title: "Internet básico sin capa administrada",
    text: "Sin SLA, monitoreo ni failover, el downtime se absorbe silenciosamente a través de toda la operación."
  }
];

export const pillars = [
  {
    title: "Siempre activos por diseño",
    text: "La resiliencia multirred elimina puntos únicos de falla. Nuestra arquitectura combina fibra, celular, satélite y otras fuentes en una conectividad de alta disponibilidad."
  },
  {
    title: "Gestión proactiva 24/7 con visibilidad total",
    text: "Nuestro NOC monitorea cada sitio en tiempo real en todo el país. Detectamos y resolvemos problemas antes de que los notes."
  },
  {
    title: "Telco as a Service",
    text: "Auditamos el gasto en telecomunicaciones, sacamos a la luz operadores redundantes, enlaces de bajo rendimiento y fugas silenciosas de SLA."
  }
];

export const phases = [
  ["Entrada", "Comenzamos con un diagnóstico de tu estado actual de telecomunicaciones o con un problema específico a resolver."],
  ["Diseño", "Diseñamos la arquitectura de red para cada sitio utilizando la combinación óptima de enlaces y tecnologías."],
  ["Despliegue", "Coordinamos hardware, operadores y activación para poner la solución en operación."],
  ["Gestión y expansión", "Optimizamos y expandimos la arquitectura a medida que crece tu presencia o cambian tus necesidades de red."]
];

export const solutions = [
  {
    eyebrow: "Edge · SuperWAN",
    title: "Edge",
    text: "Conectividad resiliente por sitio con enlaces independientes, SuperWAN, failover automático, monitoreo NOC 24/7 y hasta 99.97% de disponibilidad.",
    href: "/soluciones/edge/",
    type: "rings",
    label: "Endpoint / Failover / Monitoreo"
  },
  {
    eyebrow: "Core · Managed SD-WAN",
    title: "Core",
    text: "Orquestación y gobierno de SLA sobre toda tu red y todos tus proveedores, con un responsable único y reportes auditables.",
    href: "/soluciones/core/",
    type: "signal",
    label: "Core / Diversidad / Baja latencia"
  },
  {
    eyebrow: "Telco as a Service",
    title: "Telco as a Service",
    text: "Auditoría, reestructuración y gobierno continuo de tu gasto Telco para reducir costos, fugas de SLA y complejidad.",
    href: "/soluciones/telco-as-a-service/",
    type: "backup",
    label: "Auditoría / TCO / Gobierno"
  },
  {
    eyebrow: "IoT / SIM",
    title: "Soluciones IoT y SIM",
    text: "SIM, eSIM y sensores administrados a escala, con monitoreo, alertas, optimización de planes, IMEI lock y ciclo de vida completo.",
    href: "/soluciones/iot-sim/",
    type: "cells",
    label: "SIM / eSIM / Sensores / MVNO"
  }
];

export const industries = [
  ["Servicios financieros", "Las instituciones financieras dependen de conectividad resiliente para cajeros automáticos, sucursales, terminales y procesamiento transaccional. Vialterna integra respaldo, supervisión y arquitectura multioperador.", "/industrias/servicios-financieros/"],
  ["Retail y franquicias", "Cada tienda desconectada puede significar ventas perdidas, procesos manuales y presión sobre el corporativo. Conectamos tiendas, POS, inventarios, pedidos en línea y centros de distribución.", "/industrias/retail-franquicias/"],
  ["Energía e industria", "Los sitios operativos remotos dependen de conectividad para telemetría, seguridad, sistemas industriales y control operativo. Combinamos enlaces terrestres, celulares y satelitales.", "/industrias/energia-industria/"],
  ["Infraestructura de pagos", "Las empresas de pagos necesitan administrar miles de SIMs, detectar terminales desconectadas, optimizar planes y proteger sitios de procesamiento.", "/industrias/infraestructura-pagos/"]
  ,["Logística y cadena de frío", "Conectividad resiliente para centros de distribución, cross docks, última milla y cámaras frías, con monitoreo continuo de variables críticas.", "/industrias/logistica-cadena-frio/"]
];
