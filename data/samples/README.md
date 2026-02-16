# Smart Meter Sample Data

## Source
- Dataset: “Individual household electric power consumption” (UCI Machine Learning Repository)
- Frequency: 1-minute readings (Global_active_power, kW)
- License: CC BY 4.0 (see UCI dataset page)

## Generated Output
- `smartmeter_week_5min.csv` contains one week of data aggregated to 5-minute intervals (2016 rows).
- Columns: `ts_iso`, `powerW`, `energyKWh`

## Generate

```bash
python3 scripts/data/build_smartmeter_week_5min.py --start 2007-01-01
```

The script will download the dataset to `data/raw/` (gitignored) and output the aggregated CSV into `data/samples/`.
