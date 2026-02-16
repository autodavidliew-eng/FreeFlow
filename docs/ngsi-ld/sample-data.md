# Sample Data Pipeline

This pipeline builds a reproducible smart-meter dataset for 1 week at 5-minute intervals (2016 rows).

## Source
- UCI “Individual household electric power consumption” dataset (1-minute resolution).
- The script downloads the dataset and aggregates `Global_active_power` (kW) to 5-minute averages.

## Output
- `data/samples/smartmeter_week_5min.csv`
- Columns: `ts_iso`, `powerW`, `energyKWh`

## Generate

```bash
python3 scripts/data/build_smartmeter_week_5min.py --start 2007-01-01
```

## Aggregation details
- `powerW`: average kW in each 5-minute bucket * 1000
- `energyKWh`: average kW * (5/60)
- If a bucket has no data, the previous bucket value is reused.
