-- Migration: 0004_partitioning
--
-- usage_events and job_logs were declared PARTITION BY RANGE (created_at)
-- in 0001 (Postgres cannot convert a plain table into a partitioned one
-- after the fact, so the declaration had to be there from creation). This
-- migration creates the initial monthly partitions so the tables can
-- actually accept rows. Ongoing partition creation/rotation (next month's
-- partition, dropping partitions past the retention window) is an
-- operational/business-logic concern -- a scheduled job, not a schema
-- migration -- and is explicitly out of scope for Phase 3 (see
-- PROJECT_STATUS.md technical debt log).

-- Up

CREATE TABLE usage_events_2026_07 PARTITION OF usage_events
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE usage_events_2026_08 PARTITION OF usage_events
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE job_logs_2026_07 PARTITION OF job_logs
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE job_logs_2026_08 PARTITION OF job_logs
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- Down

DROP TABLE IF EXISTS job_logs_2026_08;
DROP TABLE IF EXISTS job_logs_2026_07;
DROP TABLE IF EXISTS usage_events_2026_08;
DROP TABLE IF EXISTS usage_events_2026_07;
