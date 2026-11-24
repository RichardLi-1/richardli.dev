"""Record what the experiments-card visual replays, straight from the real sim.

1. A full /state snapshot at SNAP_CLOCK (AM peak), exactly as the API serializes it.
2. One train's complete lap: from a departure until it next departs the same platform, sampled
   every second through `train_payload` (the /state serializer), so the loop closes on itself.

usage: <cbtc>/backend/venv/bin/python record.py <out.json>   (CBTC_DIR overrides where cbtc lives;
       default: a cbtc checkout next to this repo). See build-data.mjs for the full pipeline.
"""
from __future__ import annotations

import json
import os
import sys

os.environ.setdefault("DISPATCH_ML_DISABLED", "1")
CBTC_DIR = os.environ.get("CBTC_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../cbtc"))
BACKEND = os.path.join(CBTC_DIR, "backend")
sys.path.insert(0, BACKEND)

import commands  # noqa: E402
import sim as simmod  # noqa: E402
import train as trainmod  # noqa: E402
from ma_constants import ZC_SAFETY_MARGIN_M  # noqa: E402

SNAP_CLOCK = 7 * 3600 + 45 * 60   # 07:45:00 — mid AM peak
LAP_FROM_CLOCK = 6 * 3600 + 25 * 60  # start looking for the lap's first departure after warm-up
REF_RUN = 0
SAMPLE_S = 1.0

out_path = sys.argv[1]
commands.reset_overrides()
line = trainmod.Line("YUS", [])
s = simmod.Simulation(lines=[line], seed=simmod.DEFAULT_SEED, populate=True)
steps_per_sample = round(SAMPLE_S / simmod.DT)


def ref_train():
    return next((t for t in line.trains if t.run_number is not None and int(t.run_number) == REF_RUN), None)


snapshot = None
lap = []          # one row per second, from the lap's first departure
lap_start = None  # (clock_s, station, leg) of the departure the lap starts with
prev = None
done = False
while not done:
    for _ in range(steps_per_sample):
        s.step(simmod.DT)
    clock = s.clock_s
    if snapshot is None and clock >= SNAP_CLOCK:
        snapshot = s.snapshot()
    tr = ref_train()
    if tr is None:
        raise SystemExit(f"run {REF_RUN} missing at {simmod.format_clock(clock)}")
    p = s.train_payload(tr)
    row = {
        "clock_s": round(clock, 1),
        "chainage_m": p["chainage_m"],
        "speed": p["speed"],
        "state": p["state"],
        "station_name": p["station_name"],
        "next_station_name": p["next_station_name"],
        "stop_reason": p["stop_reason"],
        "leg": p["leg"],
        "in_service": p["in_service"],
        "e_brake": p["e_brake"],
        # authority: ATP stopping distance (safe_zone_front = s_stop + ZC margin) and, when a red
        # signal is the binding limit, where the train must stop for it
        "s_stop": p["safe_zone_front"] - ZC_SAFETY_MARGIN_M,
        "eoa_src": tr.eoa_source,
        "eoa_sig_c": (tr.chainage_front_m + tr.eoa_dist_m) % simmod.ROUTE_LEN_M if tr.eoa_source == "signal" else None,
    }
    departed = prev is not None and prev["state"] == "dwelling" and row["state"] != "dwelling"
    if lap_start is None:
        if clock >= LAP_FROM_CLOCK and departed:
            lap_start = (clock, prev["station_name"], prev["leg"])
            lap.append(row)
    else:
        lap.append(row)
        if departed and prev["station_name"] == lap_start[1] and prev["leg"] == lap_start[2] and clock - lap_start[0] > 600:
            lap.pop()  # this row is the next lap's first sample
            done = snapshot is not None
            if not done:
                raise SystemExit("lap closed before the snapshot was taken; move SNAP_CLOCK earlier")
    prev = row

json.dump({
    "snapshot_clock_s": SNAP_CLOCK,
    "snapshot": snapshot,
    "ref_run": REF_RUN,
    "lap_start": {"clock_s": lap_start[0], "station": lap_start[1], "leg": lap_start[2]},
    "lap_period_s": len(lap) * SAMPLE_S,
    "sample_s": SAMPLE_S,
    "lap": lap,
}, open(out_path, "w"))
print("snapshot trains:", len(snapshot["trains"]), "service:", snapshot["ops"]["service"])
print("lap from", simmod.format_clock(lap_start[0]), lap_start[1], lap_start[2], "period", len(lap), "s =", round(len(lap) / 60, 1), "min")
