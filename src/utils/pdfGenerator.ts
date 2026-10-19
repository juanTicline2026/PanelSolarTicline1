import { jsPDF } from 'jspdf';

export interface ProposalPdfData {
  projectName?: string;
  projectCode?: string;
  date?: string;
  clientName?: string;
  department?: string;
  trm?: number;
  consumoKwh: number;
  costoKwhBase?: number;
  valorKwhFactura?: number;
  radiacion?: number;
  potenciaPanel: number;
  panelCount: number;
  kwp: number;
  areaRequeridaM2: number;
  produccionMensualKwh: number;
  produccionAnualKwh?: number;
  ahorroPct: number;
  ahorroCo2Ton: number;
  arboles: number;
  costoSolucionCop: number;
  costoVatioCop?: number;
  ahorroMensualCop: number;
  ahorro30AniosCop: number;
  retornoMeses: number;
  retornoAnios: number;
  tirPct: number;
  flujoAnual?: { anio: number; flujo: number; acumulado: number }[];
}

const nf = (v: number, d = 0) =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

const cop = (v: number) => `$ ${nf(v)} COP`;

// Helper to load image as base64 or HTMLImageElement
async function getImageElement(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateProposalPdf(data: ProposalPdfData): Promise<void> {
  // Exact format: US Letter Landscape (279.4 x 215.9 mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  const pageWidth = 279.4;
  const pageHeight = 215.9;

  // Dynamic variables formatted to match original document
  const clientName = data.clientName?.trim() || 'Propietario Finca Bolombolo';
  const projectName = data.projectName?.trim() || 'Finca Bolombolo';
  const projectCode = data.projectCode || 'C5752026';
  const dateFormatted = data.date || new Intl.DateTimeFormat('es-CO', { month: 'long', day: '2-digit', year: 'numeric' }).format(new Date());
  const dateCapitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  const kwp = data.kwp || Number(((data.panelCount * data.potenciaPanel) / 1000).toFixed(3));
  const paneles = data.panelCount || 10;
  const microInversoresCount = Math.max(1, Math.ceil(paneles / 4));
  const consumoKwh = Math.round(data.consumoKwh || 1385);
  const produccionMensual = Math.round(data.produccionMensualKwh || 737);
  const ahorroPct = Math.min(100, Math.max(1, Math.round(data.ahorroPct || 100)));
  const areaReq = Math.round(data.areaRequeridaM2 || 28);
  const ahorroCo2 = data.ahorroCo2Ton || 3.45;
  const arboles = data.arboles || 7;

  const costoSolucion = data.costoSolucionCop || 48720000;
  const ahorro30Anios = data.ahorro30AniosCop || 1637755707;
  const retornoAnios = Number((data.retornoAnios || 3.5).toFixed(1));
  const retornoMeses = data.retornoMeses || Math.round(retornoAnios * 12);
  const tirPct = Number.isFinite(data.tirPct) ? Number(data.tirPct.toFixed(1)) : 32.7;

  // Pre-load all extracted assets matching Cotizacion Bolombolo1.docx
  const [
    img1,
    img13,
    img15,
    img16,
    img17,
    img20,
    img21,
    img22,
    img23,
    img25,
    img27,
    img52,
    img54,
  ] = await Promise.all([
    getImageElement('/cotizacion_assets/image1.jpeg'),
    getImageElement('/cotizacion_assets/image13.jpeg'),
    getImageElement('/cotizacion_assets/image15.jpeg'),
    getImageElement('/cotizacion_assets/image16.jpeg'),
    getImageElement('/cotizacion_assets/image17.jpeg'),
    getImageElement('/cotizacion_assets/image20.jpeg'),
    getImageElement('/cotizacion_assets/image21.jpeg'),
    getImageElement('/cotizacion_assets/image22.jpeg'),
    getImageElement('/cotizacion_assets/image23.jpeg'),
    getImageElement('/cotizacion_assets/image25.jpeg'),
    getImageElement('/cotizacion_assets/image27.jpeg'),
    getImageElement('/cotizacion_assets/image52.jpeg'),
    getImageElement('/cotizacion_assets/image54.jpeg'),
  ]);

  // Standard Gray Header matching docx: fill #7C7C80 (RGB 124, 124, 128), height 22mm
  const drawStandardHeader = (title: string) => {
    doc.setFillColor(124, 124, 128);
    doc.rect(0, 0, pageWidth, 22, 'F');

    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 14, 14.5);

    if (img25) {
      doc.addImage(img25, 'JPEG', pageWidth - 50, 3.5, 42, 15);
    }
  };

  // =========================================================================
  // PÁGINA 1: PORTADA OFICIAL EPC
  // =========================================================================
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Left White bordered box
  doc.setDrawColor(0, 35, 77); // #00234D
  doc.setLineWidth(0.8);
  doc.rect(8, 14, 118, 188, 'S');

  if (img13) {
    doc.addImage(img13, 'JPEG', 16, 55, 102, 34);
  }

  // Client and Project Name subtitle inside box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(38, 52, 137); // #263489
  doc.text(projectName, 67, 105, { align: 'center' });

  if (clientName && clientName !== projectName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(75, 85, 99);
    doc.text(`Cliente: ${clientName}`, 67, 112, { align: 'center' });
  }

  // Modalidad EPC at bottom right of the box
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(11);
  doc.setTextColor(28, 28, 26);
  doc.text('Modalidad EPC', 120, 180, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(56, 73, 84);
  const epcLines = doc.splitTextToSize(
    'Ingeniería de diseño, adquisición de equipos, construcción puesta en marcha y legalización del proyecto.',
    94
  );
  doc.text(epcLines, 120, 186, { align: 'right' });

  // Right Side Solar Panels Image
  if (img1) {
    doc.addImage(img1, 'JPEG', 130, 0, pageWidth - 130, pageHeight);
  }

  // =========================================================================
  // PÁGINA 2: QUIÉNES SOMOS / TRAYECTORIA
  // =========================================================================
  doc.addPage('letter', 'landscape');
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Gray Header with Ticline logo on left
  doc.setFillColor(124, 124, 128);
  doc.rect(0, 0, pageWidth, 22, 'F');
  if (img13) {
    doc.addImage(img13, 'JPEG', 12, 3.5, 45, 15);
  }

  // Left Text description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(28, 28, 26);
  const aboutText =
    'Con más de 14 años de experiencia, Ticline es una empresa líder en soluciones de Tecnologías de la Información y la Comunicación Nuestro compromiso es brindar un servicio integral al cliente, actuando como su aliado tecnológico. Nos especializamos en la implementación de tecnologías adecuadas a necesidades específicas en todos nuestros proyectos de suministro y servicios.';
  const aboutLines = doc.splitTextToSize(aboutText, 110);
  doc.text(aboutLines, 14, 40, { lineHeightFactor: 1.4 });

  // Installed MW metric + Colombia map
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(28, 28, 26);
  doc.text('1,30', 25, 150);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Capacidad instalada', 25, 160);
  doc.setFont('helvetica', 'bold');
  doc.text('en mega vatios', 25, 166);

  if (img22) {
    doc.addImage(img22, 'JPEG', 68, 125, 52, 68);
  }

  // Right Side Photo Collage
  if (img15) doc.addImage(img15, 'JPEG', 128, 30, 68, 83);
  if (img16) doc.addImage(img16, 'JPEG', 198, 30, 72, 83);
  if (img17) doc.addImage(img17, 'JPEG', 128, 115, 45, 88);
  if (img20) doc.addImage(img20, 'JPEG', 175, 115, 45, 88);
  if (img21) doc.addImage(img21, 'JPEG', 222, 115, 48, 88);

  // =========================================================================
  // PÁGINA 3: CARÁTULA DEL PROYECTO
  // =========================================================================
  doc.addPage('letter', 'landscape');
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top Section: Project Name & Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(56, 73, 84);
  doc.text(`Proyecto ${projectCode}`, 16, 42);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(28, 28, 26);
  doc.text(projectName, 16, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(56, 73, 84);
  doc.text(`${dateCapitalized}.v1`, 16, 62);

  if (img25) {
    doc.addImage(img25, 'JPEG', pageWidth - 55, 36, 44, 16);
  }

  // Bottom Wide Solar Panels Image
  if (img23) {
    doc.addImage(img23, 'JPEG', 0, 88, pageWidth, pageHeight - 88);
  }

  // =========================================================================
  // PÁGINA 4: ESPECIFICACIONES TÉCNICAS DEL PROYECTO (Diagrama Exacto)
  // =========================================================================
  doc.addPage('letter', 'landscape');
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  drawStandardHeader('Especificaciones Técnicas del Proyecto');

  // Left Column: Solar Icon & Description
  if (img27) {
    doc.addImage(img27, 'JPEG', 14, 34, 20, 20);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(28, 28, 26);
  doc.text('Solución fotovoltaica', 14, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  const specDesc =
    'dimensionada para cubrir el consumo actual con generación equivalente y máximo aprovechamiento del espacio.';
  const specLines = doc.splitTextToSize(specDesc, 66);
  doc.text(specLines, 14, 69, { lineHeightFactor: 1.35 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(28, 28, 26);
  doc.text(`Consumo Actual:`, 14, 118);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(38, 52, 137);
  doc.text(`${nf(consumoKwh)} kWh/mes`, 14, 126);

  // Right Area: The Exact Card Grid from user screenshot
  const gridStartX = 92;
  const colW = 41;
  const colGap = 3.5;
  const row1Y = 32;
  const row1H = 34;

  // Helper for Top Row Cards (White fill, dark border, rounded corners)
  const drawTopKpiCard = (x: number, title: string, value: string, unit: string) => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, row1Y, colW, row1H, 4, 4, 'F');
    doc.setDrawColor(56, 73, 84); // #384954
    doc.setLineWidth(0.6);
    doc.roundedRect(x, row1Y, colW, row1H, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(28, 28, 26);
    doc.text(title, x + colW / 2, row1Y + 9, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(28, 28, 26);
    doc.text(value, x + colW / 2, row1Y + 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text(unit, x + colW / 2, row1Y + 28, { align: 'center' });
  };

  drawTopKpiCard(gridStartX + 0 * (colW + colGap), 'Potencia', nf(kwp, 3), 'kWp');
  drawTopKpiCard(gridStartX + 1 * (colW + colGap), 'Generación', nf(produccionMensual), 'kWh/mes');
  drawTopKpiCard(gridStartX + 2 * (colW + colGap), 'Ahorro', `${ahorroPct}*`, '%');
  drawTopKpiCard(gridStartX + 3 * (colW + colGap), 'Ocupación', `${areaReq}`, 'Metros 2');

  // Row 2: 2 Sage Green Cards (CO2 & Árboles)
  const row2Y = 71;
  const row2W = colW * 2 + colGap; // 85.5 mm
  const row2H = 22;

  const drawGreenCard = (x: number, title: string, val: string, unit: string) => {
    doc.setFillColor(194, 206, 195); // #C2CEC3
    doc.roundedRect(x, row2Y, row2W, row2H, 3.5, 3.5, 'F');
    doc.setDrawColor(70, 87, 72); // #465748
    doc.setLineWidth(0.5);
    doc.roundedRect(x, row2Y, row2W, row2H, 3.5, 3.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(28, 28, 26);
    doc.text(title, x + row2W / 2, row2Y + 6.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text(val, x + row2W / 2, row2Y + 13.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 87, 72);
    doc.text(unit, x + row2W / 2, row2Y + 19, { align: 'center' });
  };

  drawGreenCard(gridStartX, 'CO2', nf(ahorroCo2, 2), 'T/año');
  drawGreenCard(gridStartX + row2W + colGap, 'Árboles', `${arboles}`, 'Unidades');

  // Row 3: Two Dotted Groups (Conectado a la red & Desconectado a la red)
  const row3Y = 98;
  const boxW = row2W; // 85.5 mm
  const boxH = 50;

  const drawDottedContainer = (
    startX: number,
    label: string,
    c1Title: string,
    c1Sub: string,
    c2Title: string,
    c2Sub: string
  ) => {
    // Dotted rounded outline
    doc.setDrawColor(43, 98, 133); // #2B6285
    doc.setLineWidth(0.6);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.roundedRect(startX, row3Y, boxW, boxH, 4, 4, 'S');
    doc.setLineDashPattern([], 0); // reset to solid

    // 2 Internal Gray Cards
    const innerCardW = 37.5;
    const innerCardH = 40;
    const innerY = row3Y + 5;

    const drawInnerGrayCard = (cx: number, title: string, subtitle: string) => {
      doc.setFillColor(165, 173, 181); // #A5ADB5
      doc.roundedRect(cx, innerY, innerCardW, innerCardH, 4, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(28, 28, 26);
      doc.text(title, cx + innerCardW / 2, innerY + 18, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 50, 60);
      doc.text(subtitle, cx + innerCardW / 2, innerY + 26, { align: 'center' });
    };

    drawInnerGrayCard(startX + 3.5, c1Title, c1Sub);
    drawInnerGrayCard(startX + boxW - innerCardW - 3.5, c2Title, c2Sub);

    // Label Underneath
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(28, 28, 26);
    doc.text(label, startX + boxW / 2, row3Y + boxH + 6, { align: 'center' });
  };

  // Left Box: Conectado a la red (Paneles & Micro-Inversor)
  drawDottedContainer(
    gridStartX,
    'Conectado a la red',
    'Paneles',
    `${paneles} Unidades`,
    'Micro-Inversor',
    `${microInversoresCount} Unidad`
  );

  // Right Box: Desconectado a la red (Controlador & Baterías)
  drawDottedContainer(
    gridStartX + boxW + colGap,
    'Desconectado a la red',
    'Controlador',
    '0 Unidades',
    'Baterías',
    '0 Unidad'
  );

  // =========================================================================
  // PÁGINA 5: ANÁLISIS DE INVERSIÓN Y RETORNO
  // =========================================================================
  doc.addPage('letter', 'landscape');
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  drawStandardHeader('Análisis de Inversión y Retorno');

  // Chart Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(28, 28, 26);
  doc.text('Saldo durante la vida del proyecto', 100, 32, { align: 'center' });

  // Chart Grid
  const chartX = 38;
  const chartY = 36;
  const chartW = 142;
  const chartH = 68;

  // Y-Axis Labels
  const maxY = Math.max(ahorro30Anios * 1.15, costoSolucion * 3, 2000000000);
  const yTicks = [2000000000, 1500000000, 1000000000, 500000000, 0];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);

  yTicks.forEach((val, idx) => {
    const yPos = chartY + (idx / (yTicks.length - 1)) * chartH;
    const label = val === 0 ? '$ -' : `$ ${nf(val)}`;
    doc.text(label, chartX - 3, yPos + 1.5, { align: 'right' });

    // Grid horizontal line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(chartX, yPos, chartX + chartW, yPos);
  });

  // Dynamic Cashflow Curve (Blue Line) & Investment Line (Red Dashed Line)
  const pts = data.flujoAnual && data.flujoAnual.length >= 30
    ? data.flujoAnual
    : Array.from({ length: 31 }, (_, yr) => {
        const cum = yr === 0 ? -costoSolucion : -costoSolucion + (ahorro30Anios / 30) * yr;
        return { anio: yr, flujo: cum, acumulado: cum };
      });

  const getCanvasY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxY, val));
    return chartY + chartH - (clamped / maxY) * chartH;
  };

  // Draw Blue Line: Saldo en caja integrado
  doc.setDrawColor(31, 63, 154); // #1F3F9A
  doc.setLineWidth(0.9);
  pts.forEach((pt, i) => {
    if (i === 0) return;
    const prevPt = pts[i - 1];
    const x1 = chartX + ((i - 1) / (pts.length - 1)) * chartW;
    const y1 = getCanvasY(prevPt.acumulado);
    const x2 = chartX + (i / (pts.length - 1)) * chartW;
    const y2 = getCanvasY(pt.acumulado);
    doc.line(x1, y1, x2, y2);
  });

  // Draw Red Dashed Line: Saldo por pagar (Inversión)
  doc.setDrawColor(255, 0, 0); // #FF0000
  doc.setLineWidth(0.6);
  doc.setLineDashPattern([2, 1.5], 0);
  const redY = getCanvasY(costoSolucion);
  doc.line(chartX, redY, chartX + chartW, redY);
  doc.setLineDashPattern([], 0);

  // X-Axis Month Ticks: 0, 9, 18, 27, 36 ... 360
  doc.setFontSize(6.5);
  doc.setTextColor(75, 85, 99);
  const xTicks = [0, 9, 18, 27, 36, 45, 54, 63, 72, 81, 90, 99, 108, 117, 126, 135, 144, 153, 162, 171, 180, 189, 198, 207, 216, 225, 234, 243, 252, 261, 270, 279, 288, 297, 306, 315, 324, 333, 342, 351, 360];
  xTicks.forEach((m, idx) => {
    const xPos = chartX + (idx / (xTicks.length - 1)) * chartW;
    doc.text(`${m}`, xPos, chartY + chartH + 5, { align: 'center', angle: 90 });
  });

  // Chart Legend & Footnote
  const legY = chartY + chartH + 18;
  doc.setDrawColor(31, 63, 154);
  doc.setLineWidth(1.2);
  doc.line(60, legY, 68, legY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(28, 28, 26);
  doc.text('Saldo en caja integrado', 71, legY + 1.2);

  doc.setDrawColor(255, 0, 0);
  doc.setLineWidth(0.8);
  doc.setLineDashPattern([2, 1.5], 0);
  doc.line(115, legY, 123, legY);
  doc.setLineDashPattern([], 0);
  doc.text('Saldo por pagar', 126, legY + 1.2);

  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('*La línea roja corresponde al saldo invertido en el proyecto por caja propia', 100, legY + 8, { align: 'center' });

  // Right Side Solar Field Photo
  if (img52) {
    doc.addImage(img52, 'JPEG', 188, 24, pageWidth - 188, 124);
  }

  // Bottom 4 Rounded Gray Cards
  const bY = 154;
  const bH = 46;
  const bGap = 4;
  const bW1 = 43;
  const bW2 = 43;
  const bW3 = 43;
  const bW4 = 96;

  const drawBottomGrayCard = (bx: number, bw: number, title: string, mainVal: string, subVal?: string) => {
    doc.setFillColor(124, 124, 128); // #7C7C80
    doc.roundedRect(bx, bY, bw, bH, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title, bx + bw / 2, bY + 12, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(mainVal.length > 15 ? 10.5 : 12);
    doc.text(mainVal, bx + bw / 2, bY + 25, { align: 'center' });

    if (subVal) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(subVal, bx + bw / 2, bY + 34, { align: 'center' });
    }
  };

  drawBottomGrayCard(14, bW1, 'Ahorro en 30 años', cop(ahorro30Anios));
  drawBottomGrayCard(14 + bW1 + bGap, bW2, 'ROI', `${retornoAnios} Años`, `(${retornoMeses} Meses)`);
  drawBottomGrayCard(14 + 2 * (bW1 + bGap), bW3, 'TIR', `${tirPct}%`);
  drawBottomGrayCard(14 + 3 * (bW1 + bGap), bW4, 'Precio del sistema', cop(costoSolucion));

  // =========================================================================
  // PÁGINA 6: DETALLE DE LA PROPUESTA (Condiciones 1 a 7)
  // =========================================================================
  doc.addPage('letter', 'landscape');
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  drawStandardHeader('Detalle de la propuesta');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(28, 28, 26);
  doc.text('Condiciones de la Propuesta', 16, 36);

  const cond1 = [
    '1.   Validez: 15 días calendario a partir de la fecha de emisión.',
    '2.   Tiempo de Entrega: Hasta 90 días calendario tras la firma del contrato y acta de inicio.',
    '3.   Términos de Pago:',
    '       o   60% de anticipo.',
    '       o   30% al poner en marcha el sistema.',
    '       o   10% tras la emisión del permiso por el OR.',
    '4.   Garantías:',
    '       o   Instalación: 2 años.',
    '       o   Inversores: 5 años (opción de extensión a 10 años por costo adicional).',
    '       o   Paneles solares: 30 años en generación y 12 años por defectos de fabricación.',
  ];

  let curY = 44;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  cond1.forEach((line) => {
    doc.text(line, 16, curY);
    curY += line.startsWith('       o') ? 5 : 6;
  });

  curY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(28, 28, 26);
  doc.text('Alcance y Beneficios del Proyecto', 16, curY);
  curY += 8;

  const cond2 = [
    '5.   Instalación llave en mano, incluye certificación RETIE y permiso de conexión según CREG 174 de 2021.',
    '6.   Beneficios tributarios:',
    '       o   Exoneración de IVA en paneles solares e inversores (Ley 1955 de 2019).',
    '       o   Exoneración de aranceles, depreciación acelerada en 3 años y exoneración del 50% del pago de renta (Ley 1715 de 2014).',
    '            La gestión de estos beneficios está incluida, salvo el cobro de la UPME por el certificado.',
    '7.   Esquema de protección anti isla obligatorio por ley, lo que impide el funcionamiento en caso de caída de la red.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  cond2.forEach((line) => {
    doc.text(line, 16, curY);
    curY += line.startsWith('       o') ? 5 : 6;
  });

  // =========================================================================
  // PÁGINA 7: REQUERIMIENTOS DEL CLIENTE, ALCANCE ADICIONAL Y CIERRE
  // =========================================================================
  doc.addPage('letter', 'landscape');
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(28, 28, 26);
  doc.text('Requerimientos del Cliente', 16, 22);

  const reqClient = [
    '8.   Disponer de estructuras adecuadas (techos, muros, pisos) para la instalación de los paneles. Mejoras necesarias podrán ofertarse por separado.',
    '9.   Proveer un espacio seguro y techado con acceso controlado para los equipos electrónicos.',
    '10. Facilitar un punto de conexión ethernet o WiFi con acceso a internet para el monitoreo en línea.',
  ];

  let p7Y = 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  reqClient.forEach((line) => {
    doc.text(line, 16, p7Y);
    p7Y += 7;
  });

  p7Y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(28, 28, 26);
  doc.text('Alcance Adicional', 16, p7Y);
  p7Y += 8;

  const addScope = [
    '11. No incluye: movimientos de tierra, traslado de acometidas eléctricas, instalación de apantallamiento ni compensación reactiva. Estos servicios pueden ofrecerse por separado.',
    '12. Monitoreo en línea: Permite visualizar la generación y balance energético del sistema.',
    '13. Soporte técnico remoto: 8 horas diarias, 5 días a la semana durante la vida útil del sistema.',
    '14. Mantenimiento preventivo: Sin costo el primer año (2 visitas anuales).',
    '15. Póliza de generación mínima: Opción de contratación por 5 años con costo adicional.',
    '16. Equipos incluidos:',
    '       o   Inversores (Solis o Goodwe) o Microinversores (Hoymiles o Enphase).',
    '       o   Paneles solares Tier-1 (JA Solar, Longi Solar, Trina Solar o Jinko Solar).',
    '       o   Estructura de aluminio.',
    '       o   Cualquier cambio en las marcas será notificado al cliente.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  addScope.forEach((line) => {
    doc.text(line, 16, p7Y);
    p7Y += line.startsWith('       o') ? 5 : 6;
  });

  // Bottom Banner across entire page width: fill #7C7C80, height 42mm
  const bannerY = pageHeight - 42;
  doc.setFillColor(124, 124, 128); // #7C7C80
  doc.rect(0, bannerY, pageWidth, 42, 'F');

  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Gracias por confiar en nosotros y por', 16, bannerY + 18);
  doc.text('apostar por la energía sostenible.', 16, bannerY + 28);

  if (img54) {
    doc.addImage(img54, 'JPEG', pageWidth - 55, bannerY + 12, 44, 18);
  }

  // Clean filename with project/client name
  const safeTitle = (clientName || projectName || 'Cotizacion').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Cotizacion_${safeTitle}_Ticline.pdf`);
}
