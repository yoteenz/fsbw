# 18 — Runtime API

**Engine Module:** `studio.department-runtime.v1.api`  
**Status:** Public service contract (architecture only)

---

## Definition

The **Runtime API** exposes department lifecycle, interaction, state, and integration services to Cursor, Studio Engine, Command Dock, and platform modules.

> Implementation abstract — contracts defined here.

---

## Service Catalog

### DepartmentLifecycleService

```yaml
load(request: LoadRequest) → Promise<DepartmentWorkspace>
activate(departmentId) → void                    # begin arrival
background(departmentId) → void
resume(departmentId) → void
unload(departmentId) → Promise<void>
getLifecycleState(departmentId) → LifecycleState
```

### InteractionService

```yaml
executeVerb(request: VerbRequest) → Promise<VerbResult>
getAllowedVerbs(instanceId, userId) → string[]
registerHandler(verb, handler) → void              # Cursor registers
subscribeToVerbs(callback) → Unsubscribe
```

### ObjectService

```yaml
getObject(instanceId) → RuntimeObject
listObjects(filter) → RuntimeObject[]
getContent(instanceId) → any
setContent(instanceId, payload) → void
hotSwapAsset(instanceId, assetVersion) → Promise<void>
```

### NavigationService

```yaml
travelTo(request: TravelRequest) → Promise<void>
travelToZone(zoneId) → void
getHistory() → NavigationHistory
getConnections(departmentId) → Connection[]
```

### CameraService

```yaml
setPreset(presetId) → void
focusObject(instanceId) → void
enableUserOrbit(enabled) → void
getState() → CameraState
```

### GenomeService

```yaml
inject(snapshotId?) → Promise<InjectionResult>
refresh() → Promise<void>                        # live Genome update
getAdaptationState(instanceId) → GenomeAdaptationState
```

### ProjectService

```yaml
bindProject(projectId) → void
getContext() → ProjectRuntimeContext
hydrateObjects() → void
onProjectEvent(callback) → Unsubscribe
```

### StateService

```yaml
getSnapshot() → RuntimeStateSnapshot
restoreSnapshot(snapshot) → void
subscribe(domain, callback) → Unsubscribe
persist() → Promise<void>
```

### ConciergeService

```yaml
getConcierge(instanceId) → ConciergeActor
dispatchToRole(roleId, message) → void
getCollaborationLog() → CollaborationExchange[]
```

### OrbService

```yaml
getState() → OrbState
activate() → void
speak(text) → void
dispatch(command) → void
subscribe(callback) → Unsubscribe
```

### MarketplaceService

```yaml
install(request: InstallRequest) → Promise<InstallResult>
update(packageId) → Promise<void>
rollback(packageId, version) → Promise<void>
listInstalled() → InstalledPackage[]
```

### EventService

```yaml
emit(event: RuntimeEvent) → void
subscribe(eventType, callback) → Unsubscribe
```

---

## Event Types

| Event | Payload |
|-------|---------|
| `runtime-loaded` | departmentId, loadTimeMs |
| `runtime-active` | departmentId |
| `verb-executed` | verb, instanceId, result |
| `genome-injected` | snapshotId, hooksApplied |
| `project-hydrated` | projectId |
| `approval-completed` | assetId, approver |
| `marketplace-installed` | packageId |
| `runtime-error` | error, recovery |

---

## Cursor Registration Pattern

```
1. DepartmentRuntime.load() — Runtime owns world
2. Cursor registers verb handlers via InteractionService
3. Cursor registers Command Dock via platform API
4. Cursor subscribes to EventService for persistence
5. User interacts — Runtime routes — Cursor handles business logic
```

---

## Permission Model

All mutating APIs check `userSession.permissions` before execution. Denied → structured error + Orb explanation.

---

## Versioning

API namespace: `studio.department-runtime.v1`

Breaking changes require major version bump + Studio Engine compatibility gate.

---

_Next: [19 — Error Recovery](./19_ERROR_RECOVERY.md)_
