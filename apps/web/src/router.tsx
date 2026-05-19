import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  useRouter,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthPanel } from "./AuthPanel";
import { buildProtectedHeaders } from "./apiAuthHeaders";
import { demoVolunteerId } from "./auth/authSession";
import { fetchEventDetail } from "./events/fetchEventDetail";
import { Button } from "./components/ui/button";
import type { EventDetailPayload } from "./eventDetailPayload";
import { DesignFoundationPreview } from "./routes/designFoundationPreview";
import { PRIMARY_NAV_MANIFEST } from "./navigation/manifest";
import { DashboardPage } from "./routes/dashboard";
import { PlaceholderPage } from "./routes/placeholderPage";
import { SchedulingPage } from "./routes/scheduling";
import { TimeAwayPage } from "./routes/timeAway";
import { RouteErrorPanel } from "./shell/RouteErrorPanel";
import { ProtectedAppShell } from "./shell/ProtectedAppShell";
import { shellPage } from "./shell/shellPage";

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
    return res.statusText || "Request failed";
  }
  try {
    const j = JSON.parse(raw) as {
      message?: unknown;
      code?: string;
    };
    if (typeof j.message === "string") {
      return typeof j.code === "string"
        ? `${j.message} (${j.code})`
        : j.message;
    }
    if (j.message && typeof j.message === "object" && j.message !== null) {
      const m = j.message as { message?: string };
      if (typeof m.message === "string") {
        return m.message;
      }
    }
    if (typeof j.code === "string") {
      return j.code;
    }
    return res.statusText || "Request failed";
  } catch {
    return raw || res.statusText || "Request failed";
  }
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const legacyLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "legacy",
  component: () => (
    <div className="mx-auto min-h-screen max-w-2xl p-6">
      <AuthPanel variant="legacy" />
      <Outlet />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => legacyLayoutRoute,
  path: "/",
  component: function Home() {
    const id = import.meta.env.VITE_DEMO_EVENT_ID ?? "seed-event-public";
    return (
      <main className="flex min-h-[80vh] flex-col justify-center gap-8">
        <section className="border border-border bg-background p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Onda Dura Church
          </p>
          <h1 className="max-w-2xl font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl">
            Volunteer roster
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            A disciplined workspace for church teams to coordinate volunteers,
            ministries, and service schedules with clarity.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/events/$eventId" params={{ eventId: id }}>
                View demo event
              </Link>
            </Button>
          </div>
        </section>
        <DesignFoundationPreview />
      </main>
    );
  },
});

export type EventDetailLoader = (ctx: {
  params: { eventId: string };
}) => Promise<EventDetailPayload>;

async function defaultEventLoader({
  params,
}: {
  params: { eventId: string };
}): Promise<EventDetailPayload> {
  const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  try {
    return await fetchEventDetail({
      eventId: params.eventId,
      volunteerId: demoVolunteerId(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load event";
    if (message.toLowerCase().includes("not found")) {
      throw new Error("Event not found");
    }
    if (message.includes("fetch")) {
      throw new Error(
        `Cannot reach the API at ${base}. Start Postgres (docker compose up -d), then run pnpm dev:api in another terminal.`,
      );
    }
    throw new Error(message);
  }
}

export type BuildRouteTreeOptions = {
  eventLoader?: EventDetailLoader;
};

function createEventRoute(eventLoader: EventDetailLoader) {
  const eventRoute = createRoute({
    getParentRoute: () => legacyLayoutRoute,
    path: "/events/$eventId",
    loader: ({ params }) => eventLoader({ params }),
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
        data.event.kind === "PUBLIC" &&
        Boolean(demoMinistry && demoVolunteer && demoRole);

      const initialWindow = useMemo(
        () => defaultAssignmentWindow(data),
        [data],
      );
      const [startsAtUtc, setStartsAtUtc] = useState(initialWindow.startsAtUtc);
      const [endsAtUtc, setEndsAtUtc] = useState(initialWindow.endsAtUtc);
      const [busy, setBusy] = useState(false);
      const [deactivateBusy, setDeactivateBusy] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [deactivateMessage, setDeactivateMessage] = useState<string | null>(
        null,
      );
      const [releasedOffer, setReleasedOffer] = useState<{
        ministryId: string;
        startsAtUtc: string;
        endsAtUtc: string;
      } | null>(null);
      const [offerBusy, setOfferBusy] = useState(false);
      const [offerDone, setOfferDone] = useState(false);

      async function submitAssignment() {
        if (!demoMinistry || !demoVolunteer || !demoRole) {
          return;
        }
        setBusy(true);
        setError(null);
        const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
        const res = await fetch(`${base}/events/${eventId}/assignments`, {
          method: "POST",
          headers: await buildProtectedHeaders(
            { leaderMinistryId: demoMinistry },
            { json: true },
          ),
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

      async function deactivateMembership() {
        if (!demoMinistry || !demoVolunteer) {
          return;
        }
        setDeactivateBusy(true);
        setDeactivateMessage(null);
        setError(null);
        const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
        const res = await fetch(
          `${base}/ministries/${demoMinistry}/memberships/${demoVolunteer}/deactivate`,
          {
            method: "POST",
            headers: await buildProtectedHeaders({
              leaderMinistryId: demoMinistry,
            }),
          },
        );
        setDeactivateBusy(false);
        if (!res.ok) {
          setError(await errorMessageFromResponse(res));
          return;
        }
        setDeactivateMessage(
          "Membership deactivated; upcoming assignments for this ministry are voided on events whose scheduled end is still in the future.",
        );
        await router.invalidate();
      }

      async function releaseAssignment(assignmentId: string) {
        if (!demoVolunteer) {
          return;
        }
        setBusy(true);
        setError(null);
        setReleasedOffer(null);
        setOfferDone(false);
        const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
        const res = await fetch(`${base}/assignments/${assignmentId}/release`, {
          method: "POST",
          headers: await buildProtectedHeaders({ volunteerId: demoVolunteer }),
        });
        setBusy(false);
        if (!res.ok) {
          setError(await errorMessageFromResponse(res));
          return;
        }
        const body = (await res.json()) as {
          ministryId: string;
          window: { startsAtUtc: string; endsAtUtc: string };
        };
        setReleasedOffer({
          ministryId: body.ministryId,
          startsAtUtc: body.window.startsAtUtc,
          endsAtUtc: body.window.endsAtUtc,
        });
        await router.invalidate();
      }

      async function confirmUnavailabilityOffer() {
        if (!demoVolunteer || !releasedOffer) {
          return;
        }
        setOfferBusy(true);
        setError(null);
        const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
        const res = await fetch(
          `${base}/volunteers/${demoVolunteer}/unavailability`,
          {
            method: "POST",
            headers: await buildProtectedHeaders(
              { volunteerId: demoVolunteer },
              { json: true },
            ),
            body: JSON.stringify({
              ministryId: releasedOffer.ministryId,
              startsAtUtc: releasedOffer.startsAtUtc,
              endsAtUtc: releasedOffer.endsAtUtc,
            }),
          },
        );
        setOfferBusy(false);
        if (!res.ok) {
          setError(await errorMessageFromResponse(res));
          return;
        }
        setOfferDone(true);
        setReleasedOffer(null);
      }

      function dismissUnavailabilityOffer() {
        setReleasedOffer(null);
        setOfferDone(false);
      }

      const myAssignments =
        demoVolunteer != null
          ? data.assignments.filter((a) => a.volunteer.id === demoVolunteer)
          : [];

      return (
        <article>
          <header>
            <p style={{ margin: 0, color: "#555", fontSize: 14 }}>
              {data.church.name} · default TZ {data.church.defaultTimezone}
            </p>
            <h1 style={{ marginTop: 8 }}>{data.event.title}</h1>
            <p style={{ marginTop: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "#eef2ff",
                  fontSize: 13,
                }}
              >
                {data.event.kind === "PUBLIC"
                  ? "Public event"
                  : "Private event"}
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
              <dd style={{ margin: "4px 0 12px" }}>
                {data.event.window.startsAtUtc}
              </dd>
              <dt style={{ fontWeight: 600 }}>Ends</dt>
              <dd style={{ margin: "4px 0 0" }}>
                {data.event.window.endsAtUtc}
              </dd>
            </dl>
          </section>
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16 }}>
              Church framing ({data.event.framing.churchDefaultTimezone})
            </h2>
            <dl style={{ margin: 0 }}>
              <dt style={{ fontWeight: 600 }}>Starts (display)</dt>
              <dd style={{ margin: "4px 0 12px" }}>
                {data.event.framing.startsDisplayInChurchTz}
              </dd>
              <dt style={{ fontWeight: 600 }}>Ends (display)</dt>
              <dd style={{ margin: "4px 0 0" }}>
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
                    {a.volunteer.displayName} · {a.ministry.name} ·{" "}
                    {a.role.name}{" "}
                    <span style={{ color: "#555", fontSize: 13 }}>
                      ({a.window.startsAtUtc} → {a.window.endsAtUtc})
                    </span>
                    {demoVolunteer && a.volunteer.id === demoVolunteer ? (
                      <button
                        type="button"
                        onClick={() => void releaseAssignment(a.id)}
                        disabled={busy}
                        style={{
                          marginLeft: 8,
                          padding: "2px 8px",
                          fontSize: 13,
                          cursor: busy ? "wait" : "pointer",
                        }}
                      >
                        Release
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {releasedOffer ? (
            <section
              style={{
                marginTop: 24,
                padding: 16,
                border: "1px solid #c7d2fe",
                borderRadius: 8,
                background: "#eef2ff",
              }}
              aria-labelledby="unavailability-offer-heading"
            >
              <h2
                id="unavailability-offer-heading"
                style={{ fontSize: 16, marginTop: 0 }}
              >
                Mark unavailable for this ministry?
              </h2>
              <p style={{ margin: "8px 0", fontSize: 14 }}>
                Optional: record unavailability for the same UTC window you just
                released ({releasedOffer.startsAtUtc} →{" "}
                {releasedOffer.endsAtUtc}). Nothing is saved until you confirm.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => void confirmUnavailabilityOffer()}
                  disabled={offerBusy}
                  style={{
                    padding: "8px 14px",
                    cursor: offerBusy ? "wait" : "pointer",
                  }}
                >
                  {offerBusy ? "Saving…" : "Yes, mark unavailable"}
                </button>
                <button
                  type="button"
                  onClick={dismissUnavailabilityOffer}
                  disabled={offerBusy}
                  style={{
                    padding: "8px 14px",
                    cursor: offerBusy ? "wait" : "pointer",
                  }}
                >
                  No thanks
                </button>
              </div>
            </section>
          ) : null}
          {offerDone ? (
            <p style={{ marginTop: 16, fontSize: 14, color: "#166534" }}>
              Unavailability recorded for this ministry and time window.
            </p>
          ) : null}
          {myAssignments.length === 0 &&
          demoVolunteer &&
          data.assignments.length > 0 ? (
            <p style={{ marginTop: 16, fontSize: 14, color: "#555" }}>
              Assignments above belong to other volunteers. Set{" "}
              <code>VITE_DEMO_VOLUNTEER_ID</code> to your rostered volunteer to
              release your own slot.
            </p>
          ) : null}
          {canAssign ? (
            <section style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 16 }}>Assign (demo)</h2>
              <p style={{ marginTop: 0, fontSize: 14, color: "#555" }}>
                Uses seeded volunteer, ministry, and role from{" "}
                <code style={{ fontSize: 13 }}>.env</code>. Default window
                avoids the seeded morning unavailability block. If this
                volunteer is already rostered in another ministry for an
                overlapping UTC window, the API returns a conflict and the
                message below includes the domain code.
              </p>
              <label style={{ display: "block", marginTop: 8, fontSize: 14 }}>
                startsAtUtc
                <input
                  value={startsAtUtc}
                  onChange={(e) => setStartsAtUtc(e.target.value)}
                  style={{ display: "block", width: "100%", marginTop: 4 }}
                />
              </label>
              <label style={{ display: "block", marginTop: 8, fontSize: 14 }}>
                endsAtUtc
                <input
                  value={endsAtUtc}
                  onChange={(e) => setEndsAtUtc(e.target.value)}
                  style={{ display: "block", width: "100%", marginTop: 4 }}
                />
              </label>
              <button
                type="button"
                onClick={() => void submitAssignment()}
                disabled={busy}
                style={{
                  marginTop: 12,
                  padding: "8px 14px",
                  cursor: busy ? "wait" : "pointer",
                }}
              >
                {busy ? "Saving…" : "Create assignment"}
              </button>
              {error ? (
                <p
                  role="alert"
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    color: "#991b1b",
                    fontSize: 14,
                  }}
                >
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void deactivateMembership()}
                disabled={deactivateBusy || busy}
                style={{
                  marginTop: 16,
                  padding: "8px 14px",
                  cursor: deactivateBusy ? "wait" : "pointer",
                  background: "#fff",
                  border: "1px solid #d1d5db",
                }}
              >
                {deactivateBusy
                  ? "Deactivating…"
                  : "Deactivate ministry membership (demo)"}
              </button>
              {deactivateMessage ? (
                <p
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    color: "#166534",
                    fontSize: 14,
                  }}
                >
                  {deactivateMessage}
                </p>
              ) : null}
            </section>
          ) : data.event.kind === "PUBLIC" ? (
            <p style={{ marginTop: 24, fontSize: 14, color: "#555" }}>
              Set <code>VITE_DEMO_MINISTRY_ID</code>,{" "}
              <code>VITE_DEMO_VOLUNTEER_ID</code>, and{" "}
              <code>VITE_DEMO_ROLE_ID</code> in <code>apps/web/.env</code> (see{" "}
              <code>.env.example</code>) to try assigning from this page.
            </p>
          ) : null}
          <p style={{ marginTop: 32 }}>
            <Link to="/" style={{ color: "#1a56db" }}>
              ← Home
            </Link>
          </p>
        </article>
      );
    },
  });
  return eventRoute;
}

function shellErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ProtectedAppShell>
      <RouteErrorPanel message={error.message} onRetry={reset} />
    </ProtectedAppShell>
  );
}

const shellRoutes = PRIMARY_NAV_MANIFEST.map((item) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: item.path,
    component: shellPage(() => {
      if (item.id === "dashboard") {
        return <DashboardPage />;
      }
      if (item.id === "scheduling") {
        return <SchedulingPage />;
      }
      if (item.id === "timeAway") {
        return <TimeAwayPage />;
      }
      if (item.placeholder) {
        return <PlaceholderPage namespace={item.namespace} />;
      }
      return <DashboardPage />;
    }),
    errorComponent: shellErrorComponent,
  }),
);

export function buildRouteTree(options: BuildRouteTreeOptions = {}) {
  const eventRoute = createEventRoute(
    options.eventLoader ?? defaultEventLoader,
  );
  return rootRoute.addChildren([
    legacyLayoutRoute.addChildren([indexRoute, eventRoute]),
    ...shellRoutes,
  ]);
}

const routeTree = buildRouteTree();

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
