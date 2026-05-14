import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import type { EventDetailPayload } from './eventDetailPayload';

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
