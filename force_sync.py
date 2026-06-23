from sync_data import sync_data
import os

if __name__ == "__main__":
    # Full re-crawl of every season (2010~now) to backfill past seasons that
    # were saved by an older crawler with fewer stat fields.
    sync_data(force=True, full=True)
