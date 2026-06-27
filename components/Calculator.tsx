import { useState } from 'react';

export default function Calculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ expression: string; result: number }[]>([]);

  const append = (char: string) => {
    setExpression((prev) => prev + char);
    setError('');
  };

  const clear = () => {
    setExpression('');
    setResult(null);
    setError('');
  };

  const calculate = async () => {
    if (!expression) return;

    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression }),
    });

    const data = await res.json();

    if (res.ok) {
      setResult(data.result);
      setHistory((prev) => [{ expression, result: data.result }, ...prev]);
      setError('');
    } else {
      setError(data.error);
      setResult(null);
    }
  };

  const loadHistory = async () => {
    const res = await fetch('/api/calculate');
    const data = await res.json();
    setHistory(data.history || []);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Calculator</h1>

      <div style={styles.display}>
        <div style={styles.expression}>{expression || '0'}</div>
        {result !== null && <div style={styles.result}>= {result}</div>}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((char) => (
          <button
            key={char}
            style={{
              ...styles.btn,
              ...(char === '=' ? styles.equals : {}),
              ...(['/', '*', '-', '+'].includes(char) ? styles.operator : {}),
            }}
            onClick={() => (char === '=' ? calculate() : append(char))}
          >
            {char}
          </button>
        ))}
      </div>

      <div style={styles.actions}>
        <button style={styles.actionBtn} onClick={clear}>Clear</button>
        <button style={styles.actionBtn} onClick={loadHistory}>History</button>
      </div>

      {history.length > 0 && (
        <div style={styles.history}>
          <h3>History</h3>
          {history.map((item, i) => (
            <div key={i} style={styles.historyItem}>
              {item.expression} = {item.result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'white',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    width: 340,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  display: {
    background: '#f8f9fa',
    borderRadius: 8,
    padding: '12px 16px',
    marginBottom: 8,
    minHeight: 72,
    textAlign: 'right',
  },
  expression: {
    fontSize: 20,
    color: '#333',
    wordBreak: 'break-all',
  },
  result: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0070f3',
    marginTop: 4,
  },
  error: {
    color: '#e00',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
    marginBottom: 12,
  },
  btn: {
    padding: 16,
    fontSize: 18,
    border: '1px solid #ddd',
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer',
  },
  operator: {
    background: '#f0f0f0',
    color: '#0070f3',
  },
  equals: {
    background: '#0070f3',
    color: 'white',
    border: 'none',
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    border: '1px solid #ddd',
    borderRadius: 8,
    background: '#f8f9fa',
    cursor: 'pointer',
  },
  history: {
    borderTop: '1px solid #eee',
    paddingTop: 12,
  },
  historyItem: {
    padding: '4px 0',
    fontSize: 14,
    color: '#555',
  },
};
