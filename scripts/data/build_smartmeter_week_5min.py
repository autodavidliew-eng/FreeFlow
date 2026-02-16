#!/usr/bin/env python3
import argparse
import csv
import datetime as dt
import os
import sys
import urllib.request
import zipfile

DEFAULT_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/00235/household_power_consumption.zip"
DEFAULT_START = "2007-01-01"


def download_file(url: str, dest: str):
    print(f"Downloading {url} -> {dest}")
    urllib.request.urlretrieve(url, dest)


def ensure_dataset(raw_dir: str, url: str) -> str:
    os.makedirs(raw_dir, exist_ok=True)
    zip_path = os.path.join(raw_dir, "household_power_consumption.zip")
    txt_path = os.path.join(raw_dir, "household_power_consumption.txt")

    if not os.path.exists(txt_path):
        if not os.path.exists(zip_path):
            download_file(url, zip_path)
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(raw_dir)

    if not os.path.exists(txt_path):
        raise FileNotFoundError("Dataset not found after extraction")

    return txt_path


def parse_week(txt_path: str, start_date: dt.datetime):
    end_date = start_date + dt.timedelta(days=7)
    buckets = {}

    with open(txt_path, "r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter=";")
        for row in reader:
            date_str = row.get("Date")
            time_str = row.get("Time")
            if not date_str or not time_str:
                continue
            try:
                timestamp = dt.datetime.strptime(f"{date_str} {time_str}", "%d/%m/%Y %H:%M:%S")
            except ValueError:
                continue

            if timestamp < start_date or timestamp >= end_date:
                continue

            power_kw = row.get("Global_active_power")
            if power_kw in (None, "?"):
                continue

            try:
                power_kw_value = float(power_kw)
            except ValueError:
                continue

            bucket_start = timestamp.replace(second=0, microsecond=0)
            minute_bucket = (bucket_start.minute // 5) * 5
            bucket_start = bucket_start.replace(minute=minute_bucket)

            buckets.setdefault(bucket_start, []).append(power_kw_value)

    return buckets


def generate_series(start_date: dt.datetime, buckets: dict):
    results = []
    last_kw = 0.0

    for i in range(7 * 24 * 12):
        bucket_start = start_date + dt.timedelta(minutes=5 * i)
        values = buckets.get(bucket_start, [])
        if values:
            avg_kw = sum(values) / len(values)
            last_kw = avg_kw
        else:
            avg_kw = last_kw

        power_w = round(avg_kw * 1000.0, 3)
        energy_kwh = round(avg_kw * (5.0 / 60.0), 6)
        results.append(
            {
                "ts_iso": bucket_start.replace(tzinfo=dt.timezone.utc).isoformat().replace("+00:00", "Z"),
                "powerW": power_w,
                "energyKWh": energy_kwh,
            }
        )

    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw-dir", default="data/raw")
    parser.add_argument("--output", default="data/samples/smartmeter_week_5min.csv")
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--start", default=DEFAULT_START)
    args = parser.parse_args()

    start_date = dt.datetime.strptime(args.start, "%Y-%m-%d")

    try:
        txt_path = ensure_dataset(args.raw_dir, args.url)
    except Exception as exc:
        print(f"Failed to prepare dataset: {exc}")
        print("Download the dataset manually and retry.")
        sys.exit(1)

    buckets = parse_week(txt_path, start_date)
    results = generate_series(start_date, buckets)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["ts_iso", "powerW", "energyKWh"])
        writer.writeheader()
        writer.writerows(results)

    print(f"Wrote {len(results)} rows to {args.output}")


if __name__ == "__main__":
    main()
