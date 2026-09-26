import type { NextApiRequest, NextApiResponse } from 'next';
import { saveCalculation, getHistory } from '../../lib/db';

type Data = { result?: number; error?: string; history?: unknown[] };

// Only digits, basic operators, decimal points, parentheses and spaces.
const ALLOWED = /^[0-9+\-*/.()% ]+$/;

function evaluate(expression: string): number | null {
  try {
    // Safe: ALLOWED guarantees no identifiers, so no code can be executed.
    const result = Function(`"use strict"; return (${expression})`)();
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { expression } = req.body ?? {};

    if (!expression || typeof expression !== 'string' || !expression.trim()) {
      return res.status(400).json({ error: 'Invalid expression' });
    }

    const trimmed = expression.trim();
    // Reject instead of silently stripping, so "2a3" isn't turned into "23".
    if (!ALLOWED.test(trimmed)) {
      return res.status(400).json({ error: 'Invalid characters' });
    }

    const result = evaluate(trimmed);
    if (result === null) {
      return res.status(400).json({ error: 'Invalid calculation' });
    }

    try {
      await saveCalculation(trimmed, result);
    } catch (err) {
      console.error('Failed to save calculation:', err);
      return res.status(503).json({ error: 'Database unavailable, calculation not saved' });
    }

    return res.status(200).json({ result });
  }

  if (req.method === 'GET') {
    try {
      const history = await getHistory();
      return res.status(200).json({ history });
    } catch (err) {
      console.error('Failed to load history:', err);
      return res.status(503).json({ error: 'Database unavailable, could not load history' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
