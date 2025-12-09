from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import math
import time
import passiogo
from datetime import datetime 

# UGA is system id 3994 in Passio GO
UGA_SYSTEM_ID = 3994

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    system = passiogo.getSystemFromID(UGA_SYSTEM_ID)
except Exception as e:
    print("Error loading Passio system:", e)
    system = None

# Cached Passio objects (refreshed every _REFRESH_SECONDS seconds)
_ROUTES = None
_STOPS = None
_VEHICLES = None
_ALERTS = None 
_LAST_REFRESH = 0.0
_REFRESH_SECONDS = 25.0  


def _ensure_system():
    if system is None:
        raise HTTPException(status_code=500, detail="Passio system not loaded")


def _refresh_system_data(force: bool = False):
    """
    Refresh routes / stops / vehicles / alerts every _REFRESH_SECONDS seconds.
    """
    global _ROUTES, _STOPS, _VEHICLES, _ALERTS, _LAST_REFRESH
    _ensure_system()

    now = time.time()
    if not force and now - _LAST_REFRESH < _REFRESH_SECONDS and _ROUTES is not None:
        return

    _ROUTES = system.getRoutes()
    _STOPS = system.getStops()
    _VEHICLES = system.getVehicles()
    _ALERTS = system.getSystemAlerts()
    _LAST_REFRESH = now


def _get_data():
    _refresh_system_data()

    return _ROUTES or [], _STOPS or [], _VEHICLES or [], _ALERTS or []


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Straight-line distance between two coordinates, in meters.
    """
    R = 6371000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def _build_vehicle_index(vehicles):
    """
    Build a dict mapping route IDs -> number of active vehicles.

    Different systems sometimes use different IDs; here we just key by
    whatever `vehicle.routeId` is, as a string.
    """
    counts: dict[str, int] = {}
    for v in vehicles:
        rid = getattr(v, "routeId", None)
        if not rid:
            continue
        key = str(rid)
        counts[key] = counts.get(key, 0) + 1
    return counts


def _build_route_payloads(routes, vehicles):
    """
    Build base payload for every route and a lookup dict that can be accessed by
    either route.id or route.myid (because stops.routesAndPositions uses myid).
    """
    vehicles_by_route_id = _build_vehicle_index(vehicles)

    base_routes = []
    route_by_any_id: dict[str, dict] = {}

    for r in routes:
        # Passio Route objects typically have both `id` and `myid`.
        rid = getattr(r, "id", None)
        myid = getattr(r, "myid", None)

        # Active vehicles: try to match both id and myid to whatever vehicle.routeId is.
        active = 0
        if rid is not None:
            active += vehicles_by_route_id.get(str(rid), 0)
        if myid is not None and myid != rid:
            active += vehicles_by_route_id.get(str(myid), 0)

        payload = {
            "id": str(rid) if rid is not None else str(myid),
            "name": getattr(r, "name", "Unnamed route"),
            "shortName": getattr(r, "shortName", None),
            "serviceTime": getattr(r, "serviceTime", None),
            "activeVehicles": active,
            "status": "Buses on route" if active > 0 else "No buses currently on route",
            # We are NOT computing true next-stop ETAs here; leave these null so the
            # frontend falls back to the status text.
            "nextStopName": None,
            "nextStopEtaMinutes": None,
        }

        base_routes.append(payload)

        # Lookups by both `id` and `myid` so stops can match them.
        if rid is not None:
            route_by_any_id[str(rid)] = payload
        if myid is not None:
            route_by_any_id[str(myid)] = payload

    return base_routes, route_by_any_id


@app.get("/routes/nearby")
def get_nearby_routes(
    lat: float | None = Query(default=None),
    lng: float | None = Query(default=None),
    radius_m: float = Query(default=1600, description="Search radius (~1 mile)"),
    max_stops: int = Query(default=15, description="Max nearby stops to include"),
):
    """
    If lat/lng are provided:
      • compute nearby stops within the radius
      • for each stop, attach the routes that serve it
    If lat/lng are not provided:
      • just return all routes with active vehicle counts
    """
    routes, stops, vehicles, _ = _get_data() 

    base_routes, route_by_any_id = _build_route_payloads(routes, vehicles)

    # No location → list of routes only.
    if lat is None or lng is None:
        return {"routes": base_routes}

    nearby_stops = []

    for s in stops:
        s_lat = getattr(s, "latitude", None)
        s_lng = getattr(s, "longitude", None)
        if s_lat is None or s_lng is None:
            continue

        d_m = _haversine(lat, lng, s_lat, s_lng)
        if d_m > radius_m:
            continue

        routes_and_positions = getattr(s, "routesAndPositions", {}) or {}
        stop_routes = []

        # routesAndPositions uses the route's internal ID (often myid),
        # so we look it up in route_by_any_id.
        for key in routes_and_positions.keys():
            r_payload = route_by_any_id.get(str(key))
            if r_payload:
                stop_routes.append(r_payload)

        if not stop_routes:
            continue

        nearby_stops.append(
            {
                "id": getattr(s, "id", None),
                "name": getattr(s, "name", "Unnamed stop"),
                "latitude": s_lat,
                "longitude": s_lng,
                "distanceMeters": d_m,
                "distanceMiles": d_m / 1609.34,
                "routes": stop_routes,
            }
        )

    nearby_stops.sort(key=lambda st: st["distanceMeters"])
    nearby_stops = nearby_stops[:max_stops]

    return {
        "routes": base_routes,
        "stops": nearby_stops,
    }


@app.get("/stops/all")
def get_all_stops():
    """
    All stops for UGA system (used to populate the Saved Stops checklist).
    """
    routes, stops, vehicles, _ = _get_data()  

    payload = []
    for s in stops:
        payload.append(
            {
                "id": getattr(s, "id", None),
                "name": getattr(s, "name", "Unnamed stop"),
                "latitude": getattr(s, "latitude", None),
                "longitude": getattr(s, "longitude", None),
            }
        )

    return {"stops": payload}


@app.get("/stops/details")
def get_stops_details(
    ids: str = Query(..., description="Comma-separated Passio stop IDs"),
):
    """
    Detailed info for specific stops, including the routes that serve each stop
    and the number of active buses on those routes.

    This powers the Saved Stops panel in the authenticated view.
    """
    routes, stops, vehicles, _ = _get_data() 

    wanted_ids = {s for s in ids.split(",") if s}

    base_routes, route_by_any_id = _build_route_payloads(routes, vehicles)

    result = []

    for s in stops:
        sid = getattr(s, "id", None)
        if sid is None or str(sid) not in wanted_ids:
            continue

        routes_and_positions = getattr(s, "routesAndPositions", {}) or {}
        stop_routes = []

        for key in routes_and_positions.keys():
            r_payload = route_by_any_id.get(str(key))
            if r_payload:
                stop_routes.append(r_payload)

        result.append(
            {
                "id": sid,
                "name": getattr(s, "name", "Unnamed stop"),
                "latitude": getattr(s, "latitude", None),
                "longitude": getattr(s, "longitude", None),
                "routes": stop_routes,
            }
        )

    return {"stops": result}


@app.get("/alerts")
def get_system_alerts():
    """
    Returns a list of active system alerts.
    """
    _, _, _, alerts = _get_data() 
    
    current_time = datetime.now()
    active_alerts = []

    for alert in alerts:
       
        if getattr(alert, "archive", "0") != "1":
            try:
                
                date_from = datetime.strptime(getattr(alert, "dateTimeFrom"), "%Y-%m-%d %H:%M:%S")
                date_to = datetime.strptime(getattr(alert, "dateTimeTo"), "%Y-%m-%d %H:%M:%S")

                if date_from <= current_time <= date_to:
                   
                    header = getattr(alert, "gtfsAlertHeaderText", None) or getattr(alert, "name", "System Alert")
                    description = getattr(alert, "gtfsAlertDescriptionText", None) or getattr(alert, "html", "")
                    
                    active_alerts.append({
                        "id": getattr(alert, "id"),
                        "header": header,
                        "description": description,
                        "dateTimeCreated": getattr(alert, "dateTimeCreated"),
                        "routeId": getattr(alert, "routeId"),
                        "important": getattr(alert, "important") == "1",
                    })
            except (ValueError, TypeError):
                
                pass

    return {"alerts": active_alerts}