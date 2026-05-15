import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  useRouter,
} from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import type { EventDetailPayload } from './eventDetailPayload';

function defaultAssignmentWindow(payload: EventDetailPayload): {
  startsAtUtc: string;
  endsAtUtc: string;
} {
  const es = new Date(payload.event.window.startsAtUtc).getTime();
  const ee = new Date(payload.event.window.endsAtUtc).getTime();
  const slotStart = es + 60 * 60 * 1000;
  return {
    startsAtUtc: new Date(slotStart).toISOString(),
    endsAtUtc: new Date(ee).toISOString(),
  };
}

async function errorMessageFromResponse(res: Response): Promise<string> {
  let raw: string;
  try {
    raw = await res.text();
  } catch {
    return res.statusText || 'Request failed';
  }
  try {
    const j = JSON.parse(raw) as {
      message?: unknown;
      code?: string;
    };
    if (typeof j.message === 'string') {
      return typeof j.code === 'string'
        ? `${j.message} (${j.code})`
        : j.message;
    }
    if (j.message && typeof j.message === 'object' && j.message !== null) {
      const m = j.message as { message?: string };
      if (typeof m.message === 'string') {
        return m.message;
      }
    }
    if (typeof j.code === 'string') {
      return j.code;
    }
    return res.statusText || 'Request failed';
  } catch {
    return raw || res.statusText || 'Request failed';
  }
}

const rootRoute = createRootRoute({
  component: () => (
    <div style={{ fontFamily: 'system-ui', padding: '1.5rem', maxWidth: 640 }}>
      <Outlet />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Home() {
    const id = import.meta.env.VITE_DEMO_EVENT_ID ?? 'seed-event-public';
    return (
      <main>
        <h1>Volunteer roster</h1>
        <p>
          <Link
            to="/events/$eventId"
            params={{ eventId: id }}
            style={{ color: '#1a56db' }}
          >
            View demo event
          </Link>
        </p>
      </main>
    );
  },
});

const eventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId',
  loader: async ({ params }): Promise<EventDetailPayload> => {
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/events/${params.eventId}`);
    if (res.status === 404) {
      throw new Error('Event not found');
    }
    if (!res.ok) {
      throw new Error('Unable to load event');
    }
    return res.json() as Promise<EventDetailPayload>;
  },
  component: function EventDetail() {
    const data = eventRoute.useLoaderData();
    const { eventId } = eventRoute.useParams();
    const router = useRouter();
    const demoMinistry = import.meta.env.VITE_DEMO_MINISTRY_ID as
      | string
      | undefined;
    const demoVolunteer = import.meta.env.VITE_DEMO_VOLUNTEER_ID as
      | string
      | undefined;
    const demoRole = import.meta.env.VITE_DEMO_ROLE_ID as string | undefined;
    const canAssign =
      data.event.kind === 'PUBLIC' &&
      Boolean(demoMinistry && demoVolunteer && demoRole);

    const initialWindow = useMemo(() => defaultAssignmentWindow(data), [data]);
    const [startsAtUtc, setStartsAtUtc] = useState(initialWindow.startsAtUtc);
    const [endsAtUtc, setEndsAtUtc] = useState(initialWindow.endsAtUtc);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submitAssignment() {
      if (!demoMinistry || !demoVolunteer || !demoRole) {
        return;
      }
      setBusy(true);
      setError(null);
      const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
      const res = await fetch(`${base}/events/${eventId}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Leader-Ministry-Id': demoMinistry,
        },
        body: JSON.stringify({
          volunteerId: demoVolunteer,
          ministryId: demoMinistry,
          roleId: demoRole,
          startsAtUtc,
          endsAtUtc,
        }),
      });
      setBusy(false);
      if (!res.ok) {
        setError(await errorMessageFromResponse(res));
        return;
      }
      await router.invalidate();
    }

    return (
      <article>
        <header>
          <p style={{ margin: 0, color: '#555', fontSize: 14 }}>
            {data.church.name} · default TZ {data.church.defaultTimezone}
          </p>
          <h1 style={{ marginTop: 8 }}>{data.event.title}</h1>
          <p style={{ marginTop: 4 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 6,
                background: '#eef2ff',
                fontSize: 13,
              }}
            >
              {data.event.kind === 'PUBLIC' ? 'Public event' : 'Private event'}
            </span>
            {data.ministry ? (
              <span style={{ marginLeft: 8, fontSize: 14 }}>
                Ministry: {data.ministry.name}
              </span>
            ) : null}
          </p>
        </header>
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16 }}>When (canonical UTC)</h2>
          <dl style={{ margin: 0 }}>
            <dt style={{ fontWeight: 600 }}>Starts</dt>
            <dd style={{ margin: '4px 0 12px' }}>{data.event.window.startsAtUtc}</dd>
            <dt style={{ fontWeight: 600 }}>Ends</dt>
            <dd style={{ margin: '4px 0 0' }}>{data.event.window.endsAtUtc}</dd>
          </dl>
        </section>
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16 }}>
            Church framing ({data.event.framing.churchDefaultTimezone})
          </h2>
          <dl style={{ margin: 0 }}>
            <dt style={{ fontWeight: 600 }}>Starts (display)</dt>
            <dd style={{ margin: '4px 0 12px' }}>
              {data.event.framing.startsDisplayInChurchTz}
            </dd>
            <dt style={{ fontWeight: 600 }}>Ends (display)</dt>
            <dd style={{ margin: '4px 0 0' }}>
              {data.event.framing.endsDisplayInChurchTz}
            </dd>
          </dl>
        </section>
        {data.assignments.length > 0 ? (
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16 }}>Assignments</h2>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {data.assignments.map((a) => (
                <li key={a.id} style={{ marginBottom: 8 }}>
                  {a.volunteer.displayName} · {a.ministry.name} · {a.role.name}{' '}
                  <span style={{ color: '#555', fontSize: 13 }}>
                    ({a.window.startsAtUtc} → {a.window.endsAtUtc})
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {canAssign ? (
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16 }}>Assign (demo)</h2>
            <p style={{ marginTop: 0, fontSize: 14, color: '#555' }}>
              Uses seeded volunteer, ministry, and role from{' '}
              <code style={{ fontSize: 13 }}>.env</code>. Default window avoids the
              seeded morning unavailability block. If this volunteer is already
              rostered in another ministry for an overlapping UTC window, the API
              returns a conflict and the message below includes the domain code.
            </p>
            <label style={{ display: 'block', marginTop: 8, fontSize: 14 }}>
              startsAtUtc
              <input
                value={startsAtUtc}
                onChange={(e) => setStartsAtUtc(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: 4 }}
              />
            </label>
            <label style={{ display: 'block', marginTop: 8, fontSize: 14 }}>
              endsAtUtc
              <input
                value={endsAtUtc}
                onChange={(e) => setEndsAtUtc(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: 4 }}
              />
            </label>
            <button
              type="button"
              onClick={() => void submitAssignment()}
              disabled={busy}
              style={{ marginTop: 12, padding: '8px 14px', cursor: busy ? 'wait' : 'pointer' }}
            >
              {busy ? 'Saving…' : 'Create assignment'}
            </button>
            {error ? (
              <p
                role="alert"
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  color: '#991b1b',
                  fontSize: 14,
                }}
              >
                {error}
              </p>
            ) : null}
          </section>
        ) : data.event.kind === 'PUBLIC' ? (
          <p style={{ marginTop: 24, fontSize: 14, color: '#555' }}>
            Set <code>VITE_DEMO_MINISTRY_ID</code>, <code>VITE_DEMO_VOLUNTEER_ID</code>
            , and <code>VITE_DEMO_ROLE_ID</code> in <code>apps/web/.env</code> (see{' '}
            <code>.env.example</code>) to try assigning from this page.
          </p>
        ) : null}
        <p style={{ marginTop: 32 }}>
          <Link to="/" style={{ color: '#1a56db' }}>
            ← Home
          </Link>
        </p>
      </article>
    );
  },
});

const routeTree = rootRoute.addChildren([indexRoute, eventRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
