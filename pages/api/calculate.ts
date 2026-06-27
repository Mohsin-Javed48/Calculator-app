import type { NextApiRequest, NextApiResponse } from 'next';
import { saveCalculation, getHistory } from '../../lib/db';

type Data = { result?: number; error?: string; history?: unknown[] };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { expression } = req.body;

    if (!expression || typeof expression !== 'string') {
      return res.status(400).json({ error: 'Invalid expression' });
    }

    const sanitized = expression.replace(/[^0-9+\-*/.()% ]/g, '');
    if (!sanitized) {
      return res.status(400).json({ error: 'Invalid characters' });
    }

    try {
      const result = Function(`"use strict"; return (${sanitized})`)();

      if (typeof result !== 'number' || !isFinite(result)) {
        return res.status(400).json({ error: 'Invalid calculation' });
      }

      await saveCalculation(expression, result);

      return res.status(200).json({ result });
    } catch {
      return res.status(400).json({ error: 'Calculation error' });
    }
  }

  if (req.method === 'GET') {
    const history = await getHistory();
    return res.status(200).json({ history });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
