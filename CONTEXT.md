# Church volunteer management

Language for volunteers, ministries, and rosters across one or more **Churches**. Bounded contexts include **Identity** (who is signed in), **Organization** (churches, campuses, ministries, membership, catalogs, and leaders), **Availability** (when people cannot serve for a ministry), and **Scheduling** (assignments and time conflicts).

## Language

**Availability**:
The bounded context that owns facts about when a Volunteer is not available to be assigned.
_Avoid_: Using “availability” alone to mean “free”; we record **Unavailability** periods.

**Time away**:
Public navigation label for experiences backed by **Availability** (that is, managing **Unavailability** in the model).
_Avoid_: Treating **Time away** as a different concept from **Unavailability** rows; implying “availability” means “free.”

**Church**:
A distinct congregation using the product; carries a configured timezone used as the default frame for presenting that community’s schedules and printed rosters.

**Default UI language**:
The interface defaults to **Brazilian Portuguese (`pt-BR`)** at first use, with **English** supported alongside it in the internationalization scaffold; saved personal preferences or future **Church** settings may override this default when introduced.
_Avoid_: Treating the default locale as a domain fact about any specific **Church**, **Volunteer**, or congregation identity.

**Language switcher**:
The signed-in shell exposes **Brazilian Portuguese** and **English** from account or footer surfaces so a viewer can override **Default UI language** without changing domain facts such as **Church** or **Ministry** names as stored in **Organization**.
_Avoid_: Implying a locale choice changes canonical **UTC** scheduling records; it only changes presentation language (and related formatting conventions).

**Onda** (product brand):
The application’s fixed public identity and wordmark in global chrome (for example **Onda** or **Onda Dura Church**), separate from the name of any **Church** in **Organization**.
_Avoid_: Using the product brand interchangeably with a **Church** entity; the active **Church** name appears in context selectors and church-scoped workflows, not as a substitute for the global product wordmark unless a future white-label decision changes that.

**Campus**:
A site or regional subdivision of a **Church** when schedules differ by location; carries its own configured timezone when **Campuses** are used.

**Ministry**:
A serving team or area within a **Church** that has its own volunteers and leaders.

**Organization**:
The bounded context that owns **Church** and **Campus** structure, **Ministry** structure, **Ministry membership**, each **Ministry**’s **Role** catalog, and delegation of **Leaders**.

**Ministry membership**:
A **Volunteer**’s affiliation with a **Ministry**, carried as a **status** (at least **Pending** or **Active**).
_Avoid_: Treating someone as “in the ministry” in data without a membership row — pipeline cases use **Pending** membership instead of **Unavailability** alone.

**Pending** (membership status):
The person is linked to the **Ministry** for onboarding or pipeline work; they are not eligible for **Assignments** in that **Ministry** until **Active**.

**Active** (membership status):
The person is a full participant in that **Ministry** and may be placed on schedules for that **Ministry** according to **Scheduling** rules.

**Unavailability**:
A defined period during which a Volunteer must not receive new assignments **for a specific Ministry**.
_Avoid_: “Blockout” in public copy if the glossary uses **Unavailability** in code and admin UI.

**Identity**:
The bounded context that establishes who is authenticated in the product and which person that sign-in represents.

**Volunteer**:
A person who may be assigned to serve and may record when they cannot serve; in the current scope, each **Volunteer** is exactly one sign-in person (no roster entries without their own account) and may hold **Ministry membership** in **Ministries** that belong to **more than one Church**.
_Avoid_: Implying one human may own several **Volunteer** profiles without an explicit future decision.

**Admin**:
A permission level granted in **Organization** for one or more explicitly named **Churches**; within those **Churches** it covers ministries, leaders, support tasks including **Unavailability** where allowed, and **Assignments** across **Events**.
_Avoid_: Treating **Admin** as mutually exclusive with being a **Volunteer** or **Leader** on the same sign-in; assuming an **Admin** may act in a **Church** they have not been accredited for.

**Leader**:
A permission level granted in **Organization** for stewardship of explicitly assigned **Ministries** (which may belong to **more than one Church**); may create, change, or remove **Unavailability** scoped to a **Ministry** they lead, for **Volunteers** who have **Ministry membership** in that **Ministry**, and may manage **Assignments** tied to **Ministries** they lead (for **Events** they may access).
_Avoid_: Using “**Leader**” to mean the serving **Role** on an **Event** (e.g. “team lead” slot) unless you rename that slot in **Scheduling**; assuming a **Leader** may act for a **Ministry** they have not been assigned to lead.

**System Admin**:
A platform operator grant on an existing **Volunteer** (many allowed) for network-wide onboarding and support: create **Churches**, invite church **Admins** by email, adjust **Organization** grants across **Churches**, and **read** scheduling data for diagnosis. **System Admin** is **not** church-scoped **Admin** accreditation; v1 grants **System Admin** only via seed (no in-app bootstrap). Operator UX lives under `/system-admin/*`, separate from the volunteer/leader shell. **Scheduling** writes are forbidden for **System Admin** (read-only support).
_Avoid_: Calling **System Admin** “super **Admin**” or treating it as automatic **Admin** accreditation for every **Church**; using operator APIs for day-to-day church roster work; expecting **System Admin** to edit **Church** display metadata (church-scoped **Admin** may do that per product slice `CHURCH-META-01`).

**Scheduling**:
The bounded context that owns **Assignments** of **Volunteers** to **Events** and enforces time-overlap rules across ministries using a single canonical timeline shared by all **Churches**.

**Event**:
A dated occurrence with a defined time window that **Assignments** attach to and must fall within.

**Private event**:
An **Event** owned by a **Ministry** for that team’s work; visible to that **Ministry**’s **Leaders** and **Volunteers** for scheduling needs, and always visible to an **Admin** accredited for that **Church** for support; created by **Admin** or a **Leader** of that **Ministry**.

**Public event**:
An **Event** for a whole **Church** where multiple **Ministries** in that **Church** each roster their own people; visible to the **Leaders** and **Volunteers** who must coordinate on that **Event**, plus an **Admin** accredited for that **Church**; only such an **Admin** creates **Public events**.
_Avoid_: Treating one **Public event** as spanning multiple **Churches**—that is out of scope until explicitly redesigned.

**Role**:
A named serving capacity chosen from that **Ministry**’s catalog (not ad-hoc free text); **Assignments** always reference a catalog entry.
_Avoid_: Using “role” to mean **Admin**, **Leader**, or **Volunteer** permissions — those are permission levels in **Organization**, not **Roles** on an **Event**.

**Retired** (catalog **Role**):
A **Role** entry that must not be selected for new **Assignments**; past **Assignments** and reports keep the **Role** as recorded so volunteer history stays intact.

**Assignment**:
A time-bounded commitment that a given **Volunteer** will fill a **Role** during a specific interval on an **Event** for a specific **Ministry**; that interval must lie within the **Event**’s time window. An **Assignment** is allowed only when that **Volunteer** has **Active** **Ministry membership** in that **Ministry**.

## Relationships

- The same person behind a sign-in may hold **Admin**, **Leader**, and **Volunteer** permissions together, as granted by **Organization**; these are not mutually exclusive “hats.”
- An **Admin** is accredited for one or more specific **Churches**; stewardship actions apply only within those **Churches** (and their **Ministries**, **Events**, and people).
- A **System Admin** is a separate platform grant on a **Volunteer** (see ADR [`docs/adr/0005-system-admin-operator-role.md`](docs/adr/0005-system-admin-operator-role.md)): cross-church onboarding, user stewardship, and read-only scheduling support — not a substitute for church **Admin** accreditation inside the shell.
- A **Leader** may steward **Ministries** that belong to **more than one Church** when **Organization** assigns those ministries to them; their authority still attaches ministry-by-ministry, not church-wide by default.
- Each **Volunteer** corresponds to exactly one authenticated person via **Identity** (current scope).
- **Events**, **Assignments**, and **Unavailability** intervals are recorded as **UTC** instants so conflicts and reports compare one global timeline across **Churches**; each **Church** has a configured timezone used as the default for presenting that **Church**’s schedules, and a **Campus** may supply its own timezone when **Campuses** are used.
- The product may present those instants in a viewer’s local timezone while keeping the canonical **UTC** record unchanged; when a **Volunteer** or **Leader** works across **more than one Church**, schedule screens default to the active **Church** context’s timezone unless the viewer opts into a personal local presentation.
- A **Public event** always belongs to exactly one **Church** in the current scope (it never spans multiple **Churches** on one roster row).
- **Scheduling** depends on **Availability** to know **Unavailability** when validating or creating assignments, using the **Ministry** attached to the assignment.
- **Scheduling** treats time windows as **half-open**: if one window **ends** exactly when another **begins**, that is **not** overlap, including when comparing **Assignments** to **Unavailability** (comparisons use the canonical **UTC** instants).
- Each **Assignment** has its own start and end within the parent **Event**’s window; overlap checks use those **Assignment** times (which may equal the full **Event** span when appropriate), expressed as **UTC** instants.
- An **Assignment** requires **Active** **Ministry membership** for its **Ministry**; **Pending** membership does not authorize rostering for that **Ministry**.
- When **Ministry membership** for a **Volunteer** in a **Ministry** ceases to be **Active**, **Assignments** on **Events** whose **scheduled end** instant is still in the future are **voided**; **Assignments** on **Events** whose **scheduled end** instant is already in the past remain as recorded for history and reporting (an **Event** still underway counts as not yet past).
- Each **Unavailability** applies to exactly one **Volunteer** and exactly one **Ministry**; it does not block assignments for other ministries. A row exists only if that **Volunteer** has **Ministry membership** to that **Ministry** (including **Pending**); pipeline cases are modeled with **Pending** membership in **Organization**, not “orphan” unavailability.
- A **Volunteer** may have zero or more periods of **Unavailability** (including several for the same **Ministry** over time).
- A **Volunteer** may use one guided action to apply the same dates across every **Ministry** where they have **Ministry membership**; **Availability** still stores separate **Unavailability** records per **Ministry** (no church-wide row).
- A **Volunteer** may **release** or **decline** their own **Assignment**; **Leader** and **Admin** may create, change, or remove **Assignments** according to stewardship scope (**Leader** for their **Ministries**, **Admin** only for **Churches** where they are accredited). After **decline** or **release**, the person may be **offered** (not required) a path to add matching **Unavailability** for that **Ministry** over the same interval as the released **Assignment** in **Availability**.
- When an **Event** is **cancelled** or otherwise does not run as planned, its **Assignments** are **voided** so no **Volunteer** remains rostered for that occurrence.
- Each **Ministry** maintains a catalog of **Roles**; an **Admin** accredited for that **Ministry**’s **Church** and a **Leader** of that **Ministry** may add, rename, or **retire** catalog entries. **Retiring** a **Role** forbids new **Assignments** to that entry and does not alter existing historical **Assignments** on past **Events**, so reporting and volunteer history stay faithful.
- In **Availability**, **Volunteer**, **Admin**, and **Leader** may establish or change **Unavailability**; a **Leader** may do so only for **Unavailability** records tied to a **Ministry** they lead, and an **Admin** may do so only within **Churches** where they are accredited.

## Example dialogue

> **Dev:** “Does **Scheduling** store **Unavailability**, or only read it?”  
> **Domain expert:** “Only **Availability** records **Unavailability**. **Scheduling** asks **Availability** when checking if an assignment is allowed.”  
> **Dev:** “If they’re out for **Band** only, can we still roster them for **Kids**?”  
> **Dev:** “Can we add **Unavailability** for someone who isn’t in **Band** yet?”  
> **Domain expert:** “No — put them on **Band** as **Pending** in **Organization** first, then record **Unavailability** for **Band**.”  
> **Dev:** “We’re multi-site — do we store service times in Eastern?”  
> **Domain expert:** “We store **UTC** for every **Event** and **Assignment**; each **Church** or **Campus** picks its default timezone for display, and people away from home still see their own local time without corrupting the roster.”  
> **Dev:** “Same login serves two congregations — is that allowed?”  
> **Domain expert:** “Yes — one **Volunteer** can have **Ministry membership** in **Churches** A and B; whichever **Church** you’re working in drives the default clock on that screen, with personal local view still available.”

## Flagged ambiguities

- **Volunteers** without their own sign-in, or one sign-in managing several **Volunteers** (household-style), is explicitly out of scope for the current glossary until revisited.
- **Public events** (or other shared calendars) that intentionally span multiple **Churches** in one occurrence are deferred beyond the current scope.
