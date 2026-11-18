'use client';

import { useEffect, useState } from 'react';

async function readDashboard(signal) {
  const response = await fetch('/api/events', { signal });
  if (!response.ok) throw new Error('NestJS API unavailable');
  return response.json();
}

export default function Page() {
  const [data, setData] = useState({ ready: false, events: [], queues: {} });
  const [connection, setConnection] = useState('Connecting to NestJS API');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    async function refresh() {
      try {
        const dashboard = await readDashboard(controller.signal);
        setData(dashboard);
        setConnection(dashboard.ready ? 'Solace · Ready' : 'Solace · Waiting for broker');
      } catch {
        if (!controller.signal.aborted) setConnection('NestJS API unavailable');
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, 1500);
      }
    }
    refresh();
    return () => { controller.abort(); clearTimeout(timer); };
  }, []);

  async function submit(event) {
    event.preventDefault();
    const input = Object.fromEntries(new FormData(event.currentTarget));
    setSubmitting(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (!response.ok) throw new Error('Submission failed (' + response.status + ')');
      const item = await response.json();
      setFeedback('Accepted event ' + item.id);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const complete = data.events.filter(event => event.status === 'Completed');
  const within = complete.filter(event => event.updated - event.created <= data.queues[event.kind]?.target);
  const rejected = data.events.filter(event => event.status === 'Rejected').length;
  return <>
    <header><strong>EventFlow Lab</strong><span className="tag" role="status">{connection}</span></header>
    <main>
      <section className="hero">
        <small>MESSAGING OPERATIONS / PAYMENTS &amp; ONBOARDING</small>
        <h1>Follow the event.</h1>
        <p>Submit synthetic requests and trace processing across Solace queues.</p>
        <a href="/eventflow-lab.html">Open browser simulation ↗</a>
      </section>
      <section className="grid" aria-label="Workflow metrics">
        <div className="card"><small>Completed / tracked</small><p className="stat">{complete.length} / {data.events.length}</p></div>
        <div className="card"><small>Within target / completed</small><p className="stat">{complete.length ? within.length + ' / ' + complete.length : '—'}</p></div>
        <div className="card"><small>Rejected</small><p className="stat">{rejected}</p></div>
      </section>
      <section className="card">
        <h2>Submit a synthetic event</h2>
        <form onSubmit={submit}>
          <label>Workflow<select name="kind"><option value="payment">Payment authorization</option><option value="onboarding">Entity onboarding</option></select></label>
          <label>Delivery scenario<select name="scenario"><option value="normal">Normal delivery</option><option value="transient">Transient failure → retry</option><option value="reject">Invalid request → dead message</option></select></label>
          <button disabled={submitting}>Submit event</button>
        </form>
        <div id="feedback" role="status">{feedback}</div>
      </section>
      <section className="card">
        <h2>Event journal</h2>
        <div className="table"><table><thead><tr><th>Correlation ID</th><th>Workflow</th><th>Attempts</th><th>Elapsed</th><th>Status</th></tr></thead>
          <tbody>{data.events.length ? data.events.map(event => <tr key={event.id}>
            <td>{event.id}</td><td>{event.kind}</td><td>{event.attempts}</td><td>{event.updated - event.created} ms</td><td>{event.status}</td>
          </tr>) : <tr><td colSpan={5}>Submit an event to start a trace.</td></tr>}</tbody>
        </table></div>
      </section>
      <section className="grid" aria-label="Queue routes">
        {Object.entries(data.queues).map(([kind, queue]) => <div className="card route" key={kind}>
          <h2>{queue.name}</h2><code>{queue.topic}</code><p>Dead-message route {queue.name.replace('.V1', '.DMQ')}</p>
          <small>Completion target ≤ {queue.target / 1000} seconds</small>
        </div>)}
      </section>
      <footer>Metrics cover the latest 100 events.</footer>
    </main>
  </>;
}
