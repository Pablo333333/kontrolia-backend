import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    });
  }

  async summarize(text: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return "IA: (Simulación) El hilo de conversación trata sobre la gestión técnica del ticket, destacando los puntos clave de la comunicación entre el usuario y el sistema.";
    }

    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Eres un asistente experto en gestión documental. Resume la siguiente conversación de un ticket de soporte en máximo 100 palabras." },
        { role: "user", content: text }
      ],
    });

    return response.choices[0].message.content || 'No se pudo generar el resumen.';
  }

  async classifyPriority(text: string): Promise<'ALTA' | 'BAJA'> {
    const urgentWords = ['urgente', 'peligro', 'rotura', 'emergencia', 'inmediato', 'crítico'];
    const lowerText = text.toLowerCase();
    const isUrgent = urgentWords.some(word => lowerText.includes(word));
    return isUrgent ? 'ALTA' : 'BAJA';
  }

  async draftFormalDocument(baseDraft: string, metadata: Record<string, unknown>): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return baseDraft;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente de redacción formal para comunicaciones institucionales. ' +
              'Estructura el borrador en español con encabezado, cuerpo y cierre. Mantén los datos factuales.',
          },
          {
            role: 'user',
            content: `Metadatos: ${JSON.stringify(metadata)}\n\nBorrador base:\n${baseDraft}`,
          },
        ],
      });

      return response.choices[0].message.content || baseDraft;
    } catch {
      return baseDraft;
    }
  }

  /**
   * Expande una consulta a términos relacionados (sinónimos, contexto) para búsqueda semántica.
   */
  async expandSearchQuery(query: string): Promise<string[]> {
    const base = this.fallbackExpand(query);
    if (!process.env.OPENAI_API_KEY) {
      return base;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente de búsqueda documental institucional en español. ' +
              'Dada una consulta, responde SOLO un JSON {"terms":["..."]} con 5 a 12 términos o frases cortas ' +
              'relacionadas por sentido (sinónimos, hiperónimos, variantes). Incluye la consulta original.',
          },
          { role: 'user', content: query },
        ],
        response_format: { type: 'json_object' },
      });

      const raw = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(raw) as { terms?: string[] };
      const terms = (parsed.terms || [])
        .map((t) => String(t).trim())
        .filter(Boolean);
      return Array.from(new Set([...base, ...terms])).slice(0, 16);
    } catch {
      return base;
    }
  }

  private fallbackExpand(query: string): string[] {
    const q = query.trim().toLowerCase();
    const synonyms: Record<string, string[]> = {
      oficio: ['comunicación formal', 'documento oficial', 'tramite'],
      carta: ['correspondencia', 'comunicación escrita', 'tramite'],
      solicitud: ['pedido', 'requerimiento', 'petición', 'tramite'],
      convenio: ['acuerdo', 'contrato', 'alianza'],
      urgencia: ['urgente', 'prioridad alta', 'vencido', 'plazo'],
      vencido: ['atrasado', 'fuera de plazo', 'pendiente'],
      coordinacion: ['coordinación', 'reunión', 'chat', 'seguimiento'],
      obra: ['construcción', 'expediente técnico', 'documentos técnicos'],
      mapa: ['ubicación', 'geolocalización', 'lugar', 'coordenadas'],
      respuesta: ['contestación', 'comentario', 'réplica'],
    };

    const extra: string[] = [query.trim()];
    for (const [key, values] of Object.entries(synonyms)) {
      if (q.includes(key) || values.some((v) => q.includes(v))) {
        extra.push(key, ...values);
      }
    }

    // Tokens individuales de la consulta
    q.split(/\s+/).filter((t) => t.length > 2).forEach((t) => extra.push(t));

    return Array.from(new Set(extra.map((t) => t.trim()).filter(Boolean))).slice(0, 12);
  }
}
