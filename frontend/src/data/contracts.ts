export type RiskLevel = "alto" | "medio" | "bajo";

export interface RedFlag {
  tipo: string;
  descripcion: string;
  nivel: RiskLevel;
}

export interface Contract {
  id: string;
  objeto: string;
  contratista: string;
  nit: string;
  secretaria: string;
  comuna: number | string;
  anio: number;
  presupuestoInicial: number;
  adiciones: number;
  valorFinal: number;
  estado: "Activo" | "Terminado" | "Suspendido" | "Liquidado";
  modalidad: "Licitación Pública" | "Contratación Directa" | "Selección Abreviada" | "Concurso de Méritos" | "Mínima Cuantía";
  fechaInicio: string;
  fechaFin: string;
  oferentes: number;
  prorrogas: number;
  banderas: RedFlag[];
  riskScore: number;
}

export const contracts: Contract[] = [
  {
    id: "CT-2024-0451",
    objeto: "Construcción y pavimentación de vías en la Calle 5 entre Carreras 8 y 15, Comuna 3 Centro",
    contratista: "Constructora Pacífico S.A.S.",
    nit: "900.123.456-7",
    secretaria: "Infraestructura",
    comuna: 3,
    anio: 2024,
    presupuestoInicial: 1_850_000_000,
    adiciones: 920_000_000,
    valorFinal: 2_770_000_000,
    estado: "Activo",
    modalidad: "Licitación Pública",
    fechaInicio: "2024-01-15",
    fechaFin: "2024-12-31",
    oferentes: 2,
    prorrogas: 3,
    banderas: [
      { tipo: "Adición Presupuestal Excesiva", descripcion: "Adición del 49.7% sobre el presupuesto inicial. Supera el límite reglamentario del 20%.", nivel: "alto" },
      { tipo: "Prórrogas Reiteradas", descripcion: "3 prórrogas acumuladas equivalen a 8 meses adicionales sin justificación técnica aprobada.", nivel: "alto" },
      { tipo: "Baja Concurrencia", descripcion: "Solo 2 oferentes participaron en proceso licitatorio para contrato superior a $1.800 M.", nivel: "medio" },
    ],
    riskScore: 87,
  },
  {
    id: "CT-2024-0389",
    objeto: "Suministro e instalación de luminarias LED en espacio público de la Comuna 13 Ladera",
    contratista: "Iluminaciones del Valle Ltda.",
    nit: "800.567.234-1",
    secretaria: "Infraestructura",
    comuna: 13,
    anio: 2024,
    presupuestoInicial: 650_000_000,
    adiciones: 0,
    valorFinal: 650_000_000,
    estado: "Terminado",
    modalidad: "Selección Abreviada",
    fechaInicio: "2024-02-01",
    fechaFin: "2024-06-30",
    oferentes: 5,
    prorrogas: 0,
    banderas: [],
    riskScore: 12,
  },
  {
    id: "CT-2024-0512",
    objeto: "Interventoría técnica, financiera y administrativa del proyecto de adecuación del Parque del Amor, Chipichape, Comunas 17 y 19",
    contratista: "INGENIERÍA Y CONSULTORÍA ANDINA S.A.",
    nit: "860.345.789-3",
    secretaria: "Deporte y Recreación",
    comuna: 17,
    anio: 2024,
    presupuestoInicial: 420_000_000,
    adiciones: 315_000_000,
    valorFinal: 735_000_000,
    estado: "Activo",
    modalidad: "Contratación Directa",
    fechaInicio: "2024-03-10",
    fechaFin: "2025-03-09",
    oferentes: 1,
    prorrogas: 2,
    banderas: [
      { tipo: "Contratación Directa Injustificada", descripcion: "Uso de la modalidad directa para interventoría sin demostrar causal de urgencia manifiesta.", nivel: "alto" },
      { tipo: "Adición Presupuestal Excesiva", descripcion: "Adición del 75% del valor original. Se supera ampliamente el umbral de alerta.", nivel: "alto" },
      { tipo: "Único Oferente", descripcion: "Proceso sin competencia. Contratista único habitual de la Secretaría de Deporte.", nivel: "medio" },
    ],
    riskScore: 92,
  },
  {
    id: "CT-2023-1204",
    objeto: "Construcción del Centro de Desarrollo Infantil (CDI) Comunas 6 y 7 - Sector Floralia",
    contratista: "CONSTRUCCIONES COLCIVIL S.A.S.",
    nit: "900.789.012-5",
    secretaria: "Bienestar Social",
    comuna: 6,
    anio: 2023,
    presupuestoInicial: 3_200_000_000,
    adiciones: 480_000_000,
    valorFinal: 3_680_000_000,
    estado: "Terminado",
    modalidad: "Licitación Pública",
    fechaInicio: "2023-04-01",
    fechaFin: "2024-01-31",
    oferentes: 4,
    prorrogas: 1,
    banderas: [
      { tipo: "Adición Moderada", descripcion: "Adición del 15% dentro del rango aceptable pero requiere seguimiento.", nivel: "medio" },
    ],
    riskScore: 34,
  },
  {
    id: "CT-2024-0671",
    objeto: "Mantenimiento y operación de la red de acueducto en Corregimiento de Villacarmelo y Zona Rural Norte",
    contratista: "ACUAVALLE S.A. E.S.P.",
    nit: "891.480.185-4",
    secretaria: "Medio Ambiente y Agua Potable",
    comuna: "Corregimiento Norte",
    anio: 2024,
    presupuestoInicial: 890_000_000,
    adiciones: 0,
    valorFinal: 890_000_000,
    estado: "Activo",
    modalidad: "Contratación Directa",
    fechaInicio: "2024-01-01",
    fechaFin: "2024-12-31",
    oferentes: 1,
    prorrogas: 0,
    banderas: [
      { tipo: "Contratación Directa", descripcion: "Justificada por ser empresa pública de servicios, pero requiere supervisión de tarifas.", nivel: "bajo" },
    ],
    riskScore: 22,
  },
  {
    id: "CT-2024-0290",
    objeto: "Dotación de equipos de cómputo y tecnología para sedes educativas de la Secretaría de Educación Municipal",
    contratista: "TECNOLOGÍA EMPRESARIAL DEL PACIFICO S.A.S.",
    nit: "900.234.567-8",
    secretaria: "Educación",
    comuna: 15,
    anio: 2024,
    presupuestoInicial: 1_100_000_000,
    adiciones: 550_000_000,
    valorFinal: 1_650_000_000,
    estado: "Suspendido",
    modalidad: "Selección Abreviada",
    fechaInicio: "2024-02-15",
    fechaFin: "2024-08-15",
    oferentes: 3,
    prorrogas: 4,
    banderas: [
      { tipo: "Adición Presupuestal Excesiva", descripcion: "50% de adición sobre el valor inicial. Contrato suspendido por hallazgo de Contraloría.", nivel: "alto" },
      { tipo: "Prórrogas Reiteradas", descripcion: "4 prórrogas sin entrega efectiva. Contrato suspendido desde julio 2024.", nivel: "alto" },
    ],
    riskScore: 95,
  },
  {
    id: "CT-2024-0801",
    objeto: "Prestación de servicios de aseo y limpieza de dependencias de la Alcaldía de Santiago de Cali",
    contratista: "SERVICIOS GENERALES CALI S.A.S.",
    nit: "900.456.123-9",
    secretaria: "Administrativo",
    comuna: 3,
    anio: 2024,
    presupuestoInicial: 280_000_000,
    adiciones: 0,
    valorFinal: 280_000_000,
    estado: "Activo",
    modalidad: "Mínima Cuantía",
    fechaInicio: "2024-01-01",
    fechaFin: "2024-12-31",
    oferentes: 6,
    prorrogas: 0,
    banderas: [],
    riskScore: 8,
  },
  {
    id: "CT-2023-0987",
    objeto: "Mejoramiento integral de barrio en sector El Poblado, construcción de redes sanitarias y pluviales, Comuna 16",
    contratista: "OBRAS CIVILES DEL SUR S.A.",
    nit: "800.678.901-2",
    secretaria: "Infraestructura",
    comuna: 16,
    anio: 2023,
    presupuestoInicial: 2_100_000_000,
    adiciones: 210_000_000,
    valorFinal: 2_310_000_000,
    estado: "Liquidado",
    modalidad: "Licitación Pública",
    fechaInicio: "2023-06-01",
    fechaFin: "2024-03-31",
    oferentes: 7,
    prorrogas: 0,
    banderas: [
      { tipo: "Adición Moderada", descripcion: "Adición del 10% dentro de parámetros normales de obra civil.", nivel: "bajo" },
    ],
    riskScore: 18,
  },
];

export interface CommuneData {
  id: number | string;
  nombre: string;
  tipo: "urbana" | "rural";
  totalContratos: number;
  totalInvertido: number;
  banderas: number;
  riskLevel: RiskLevel;
  secretariasActivas: string[];
  proyectosDestacados: string[];
}

export const communes: CommuneData[] = [
  { id: 1, nombre: "Comuna 1 - Terrón Colorado", tipo: "urbana", totalContratos: 12, totalInvertido: 4_200_000_000, banderas: 1, riskLevel: "bajo", secretariasActivas: ["Infraestructura", "Bienestar Social"], proyectosDestacados: ["Pavimentación Calle 80", "CDI Sector Siloé"] },
  { id: 2, nombre: "Comuna 2 - Santa Rosa", tipo: "urbana", totalContratos: 8, totalInvertido: 1_800_000_000, banderas: 0, riskLevel: "bajo", secretariasActivas: ["Educación", "Infraestructura"], proyectosDestacados: ["Ampliación IE Multipropósito"] },
  { id: 3, nombre: "Comuna 3 - Libertad", tipo: "urbana", totalContratos: 21, totalInvertido: 7_900_000_000, banderas: 3, riskLevel: "alto", secretariasActivas: ["Infraestructura", "Administrativo", "Cultura"], proyectosDestacados: ["Pavimentación Calle 5", "Centro Cultural Municipal"] },
  { id: 4, nombre: "Comuna 4 - Flores", tipo: "urbana", totalContratos: 9, totalInvertido: 2_300_000_000, banderas: 1, riskLevel: "medio", secretariasActivas: ["Bienestar Social", "Salud"], proyectosDestacados: ["Hospital Nivel I Ampliación"] },
  { id: 5, nombre: "Comuna 5 - Guabal", tipo: "urbana", totalContratos: 14, totalInvertido: 3_450_000_000, banderas: 2, riskLevel: "medio", secretariasActivas: ["Infraestructura", "Deporte"], proyectosDestacados: ["Placa Polideportiva Guabal"] },
  { id: 6, nombre: "Comuna 6 - Flores", tipo: "urbana", totalContratos: 18, totalInvertido: 5_100_000_000, banderas: 1, riskLevel: "bajo", secretariasActivas: ["Bienestar Social", "Educación"], proyectosDestacados: ["CDI Floralia"] },
  { id: 7, nombre: "Comuna 7 - Terrón Colorado", tipo: "urbana", totalContratos: 11, totalInvertido: 2_890_000_000, banderas: 0, riskLevel: "bajo", secretariasActivas: ["Infraestructura"], proyectosDestacados: ["Vía Cra 1 Mejoramiento"] },
  { id: 8, nombre: "Comuna 8 - Villacolombia", tipo: "urbana", totalContratos: 16, totalInvertido: 4_650_000_000, banderas: 2, riskLevel: "medio", secretariasActivas: ["Infraestructura", "Salud"], proyectosDestacados: ["Puesto de Salud Villacolombia"] },
  { id: 9, nombre: "Comuna 9 - Sucre", tipo: "urbana", totalContratos: 7, totalInvertido: 1_540_000_000, banderas: 0, riskLevel: "bajo", secretariasActivas: ["Educación", "Deporte"], proyectosDestacados: ["Escenario Deportivo Sucre"] },
  { id: 10, nombre: "Comuna 10 - El Calvario", tipo: "urbana", totalContratos: 13, totalInvertido: 3_200_000_000, banderas: 1, riskLevel: "bajo", secretariasActivas: ["Infraestructura", "Cultura"], proyectosDestacados: ["Renovación Centro Histórico"] },
  { id: 11, nombre: "Comuna 11 - La Concepción", tipo: "urbana", totalContratos: 10, totalInvertido: 2_780_000_000, banderas: 1, riskLevel: "medio", secretariasActivas: ["Bienestar Social"], proyectosDestacados: ["Parque Comunitario La Concepción"] },
  { id: 12, nombre: "Comuna 12 - Buenaventura", tipo: "urbana", totalContratos: 9, totalInvertido: 1_980_000_000, banderas: 0, riskLevel: "bajo", secretariasActivas: ["Educación", "Infraestructura"], proyectosDestacados: ["IE Buenos Aires Reforzamiento"] },
  { id: 13, nombre: "Comuna 13 - El Rodeo", tipo: "urbana", totalContratos: 15, totalInvertido: 3_870_000_000, banderas: 0, riskLevel: "bajo", secretariasActivas: ["Infraestructura", "Deporte"], proyectosDestacados: ["Luminarias LED Ladera", "Vías Sector Ladera"] },
  { id: 14, nombre: "Comuna 14 - Junín", tipo: "urbana", totalContratos: 8, totalInvertido: 1_430_000_000, banderas: 0, riskLevel: "bajo", secretariasActivas: ["Bienestar Social"], proyectosDestacados: ["Centro Gerontológico Junín"] },
  { id: 15, nombre: "Comuna 15 - El Diamante", tipo: "urbana", totalContratos: 19, totalInvertido: 5_600_000_000, banderas: 4, riskLevel: "alto", secretariasActivas: ["Educación", "Infraestructura", "TIC"], proyectosDestacados: ["Dotación Equipos Educativos"] },
  { id: 16, nombre: "Comuna 16 - Calimio", tipo: "urbana", totalContratos: 22, totalInvertido: 6_800_000_000, banderas: 1, riskLevel: "bajo", secretariasActivas: ["Infraestructura"], proyectosDestacados: ["Mejoramiento Barrio El Poblado"] },
  { id: 17, nombre: "Comuna 17 - Meléndez", tipo: "urbana", totalContratos: 17, totalInvertido: 4_990_000_000, banderas: 3, riskLevel: "alto", secretariasActivas: ["Deporte", "Infraestructura"], proyectosDestacados: ["Parque del Amor Interventoría", "Ciclovía Sur"] },
  { id: 18, nombre: "Comuna 18 - Mojica", tipo: "urbana", totalContratos: 14, totalInvertido: 3_100_000_000, banderas: 2, riskLevel: "medio", secretariasActivas: ["Bienestar Social", "Salud"], proyectosDestacados: ["Hospital Básico Mojica"] },
  { id: 19, nombre: "Comuna 19 - Cristóbal Colón", tipo: "urbana", totalContratos: 11, totalInvertido: 2_450_000_000, banderas: 1, riskLevel: "medio", secretariasActivas: ["Cultura", "Educación"], proyectosDestacados: ["Teatro Colón Restauración"] },
  { id: 20, nombre: "Comuna 20 - Aguablanca", tipo: "urbana", totalContratos: 24, totalInvertido: 8_200_000_000, banderas: 5, riskLevel: "alto", secretariasActivas: ["Infraestructura", "Bienestar Social", "Salud"], proyectosDestacados: ["Hospital Piloto Ampliación", "Vías Distrito Agua Blanca"] },
  { id: 21, nombre: "Comuna 21 - Las Orquídeas", tipo: "urbana", totalContratos: 13, totalInvertido: 2_900_000_000, banderas: 1, riskLevel: "bajo", secretariasActivas: ["Educación", "Deporte"], proyectosDestacados: ["Escenario Deportivo Las Orquídeas"] },
  { id: 22, nombre: "Comuna 22 - Ciudad Jardín", tipo: "urbana", totalContratos: 9, totalInvertido: 3_400_000_000, banderas: 0, riskLevel: "bajo", secretariasActivas: ["Medio Ambiente", "Infraestructura"], proyectosDestacados: ["Parque Lineal Cañaveralejo"] },
  { id: "rural-norte", nombre: "Corregimiento Norte", tipo: "rural", totalContratos: 6, totalInvertido: 1_200_000_000, banderas: 1, riskLevel: "bajo", secretariasActivas: ["Medio Ambiente", "Agua Potable"], proyectosDestacados: ["Acueducto Villacarmelo"] },
  { id: "rural-sur", nombre: "Corregimiento Sur", tipo: "rural", totalContratos: 4, totalInvertido: 780_000_000, banderas: 0, riskLevel: "bajo", secretariasActivas: ["Infraestructura Rural"], proyectosDestacados: ["Vías Rurales Sur"] },
];

export const kpiData = {
  totalInvertido: 89_450_000_000,
  totalContratos: 298,
  contratosAuditados: 241,
  banderasRojas: 31,
  adicionesPromedio: 18.4,
  contratosActivos: 134,
  contratistasUnicos: 187,
  secretarias: 12,
};
