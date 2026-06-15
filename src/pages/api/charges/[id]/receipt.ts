import type { APIRoute } from 'astro';
import { PDFDocument, StandardFonts, rgb, type PDFImage } from 'pdf-lib';

// Los padres también pueden descargar recibos: el RLS de charges/payments
// garantiza que solo vean los de sus propios hijos.
const ALLOWED = ['superadmin', 'branch_admin', 'coordinator', 'parent'];

const METHOD_LABELS: Record<string, string> = {
  card: 'Tarjeta',
  spei: 'SPEI',
  oxxo: 'OXXO',
  cash: 'Efectivo',
  transfer: 'Transferencia',
};

const one = <T,>(v: T | T[] | null): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : v;

/** Recibo PDF del último pago de un cargo. */
export const GET: APIRoute = async ({ params, locals }) => {
  const { session, supabase } = locals;
  const chargeId = params.id;

  if (!session || !ALLOWED.includes(session.profile.role)) {
    return new Response('No autorizado', { status: 401 });
  }
  if (!chargeId) return new Response('Falta el id.', { status: 400 });

  const { data: charge } = await supabase
    .from('charges')
    .select(
      'id, concept, amount_due, status, students(first_name, last_name), branches(name, address, phone)',
    )
    .eq('id', chargeId)
    .single();

  if (!charge) return new Response('Cargo no encontrado.', { status: 404 });

  const { data: payment } = await supabase
    .from('payments')
    .select('id, amount, method, provider_ref, paid_at')
    .eq('charge_id', chargeId)
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment) return new Response('Este cargo no tiene pagos.', { status: 404 });

  // Datos globales de la escuela (nombre + logo)
  const { data: org } = await supabase
    .from('org_settings')
    .select('school_name, logo_url')
    .eq('id', true)
    .single();
  const schoolName = org?.school_name ?? 'Escuela de Natación';

  const student = one(charge.students) as
    | { first_name: string; last_name: string }
    | null;
  const branch = one(charge.branches) as
    | { name: string; address: string | null; phone: string | null }
    | null;

  // --- Construir PDF (media carta) ---
  const doc = await PDFDocument.create();
  const page = doc.addPage([432, 560]);
  const { width, height } = page.getSize();
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const navy = rgb(0.03, 0.14, 0.21);
  const teal = rgb(0.05, 0.48, 0.72);
  const gray = rgb(0.45, 0.5, 0.55);

  // Logo de la escuela (si está configurado)
  let logoImg: PDFImage | null = null;
  if (org?.logo_url) {
    try {
      const resp = await fetch(org.logo_url);
      if (resp.ok) {
        const buf = new Uint8Array(await resp.arrayBuffer());
        const ct = resp.headers.get('content-type') ?? '';
        logoImg = ct.includes('png')
          ? await doc.embedPng(buf)
          : await doc.embedJpg(buf);
      }
    } catch (err) {
      console.error('embed logo:', err);
    }
  }

  // Encabezado
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: navy });
  if (logoImg) {
    // Con logo: solo el logo (ya incluye el nombre); la sucursal va debajo
    const d = logoImg.scaleToFit(190, 62);
    page.drawImage(logoImg, {
      x: 28,
      y: height - 45 - d.height / 2,
      width: d.width,
      height: d.height,
    });
  } else {
    // Sin logo: nombre de la escuela + sucursal dentro del encabezado
    page.drawText(schoolName, {
      x: 28, y: height - 42, size: 18, font: bold, color: rgb(1, 1, 1),
    });
    page.drawText(branch?.name ?? '', {
      x: 28, y: height - 62, size: 10, font, color: rgb(0.8, 0.87, 0.92),
    });
  }
  page.drawText('RECIBO DE PAGO', {
    x: width - 138, y: height - 42, size: 11, font: bold, color: rgb(1, 1, 1),
  });
  page.drawText(`Folio: ${payment.id.slice(0, 8).toUpperCase()}`, {
    x: width - 138, y: height - 60, size: 9, font, color: rgb(0.8, 0.87, 0.92),
  });

  // Con logo, la sucursal se imprime debajo del encabezado para no encimarse
  if (logoImg && branch?.name) {
    page.drawText(branch.name, { x: 28, y: height - 108, size: 10, font, color: gray });
  }

  // Datos
  const paidAt = new Date(payment.paid_at);
  const fecha = paidAt.toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const lines: [string, string][] = [
    ['Fecha', fecha],
    ['Alumno', student ? `${student.first_name} ${student.last_name}` : '—'],
    ['Concepto', charge.concept],
    ['Método de pago', METHOD_LABELS[payment.method] ?? payment.method],
  ];
  if (payment.provider_ref) lines.push(['Referencia', payment.provider_ref]);

  let y = height - 130;
  for (const [label, value] of lines) {
    page.drawText(label.toUpperCase(), { x: 28, y, size: 8, font: bold, color: gray });
    page.drawText(value, { x: 28, y: y - 14, size: 11, font, color: navy });
    y -= 42;
  }

  // Monto
  page.drawRectangle({
    x: 28, y: y - 36, width: width - 56, height: 52,
    color: rgb(0.95, 0.96, 0.97),
  });
  page.drawText('MONTO PAGADO', { x: 44, y: y - 4, size: 8, font: bold, color: gray });
  page.drawText(
    `$${Number(payment.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
    { x: 44, y: y - 26, size: 18, font: bold, color: teal },
  );

  // Pie
  const footer = [
    branch?.address ?? '',
    branch?.phone ? `Tel. ${branch.phone}` : '',
    'Gracias por su pago. Este recibo es comprobante del pago registrado.',
  ].filter(Boolean);
  let fy = 60;
  for (const line of footer) {
    page.drawText(line, { x: 28, y: fy, size: 8, font, color: gray });
    fy -= 12;
  }

  const bytes = await doc.save();
  return new Response(bytes as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="recibo_${payment.id.slice(0, 8)}.pdf"`,
    },
  });
};
