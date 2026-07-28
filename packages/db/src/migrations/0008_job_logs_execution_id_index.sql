-- Migration: 0008_job_logs_execution_id_index
--
-- Phase 6 (n8n Workflow Engine) looks up job_logs rows by execution_id
-- (the BullMQ job id) to update status as a job progresses through
-- started -> retrying -> completed/failed -- see
-- apps/api/src/repositories/job-log.repository.ts. No index existed on
-- this column (0001_initial_schema.sql only indexed workflow_name and
-- status), so every status update was a sequential scan per partition.
-- Created on the parent partitioned table: Postgres automatically applies
-- a partitioned index like this to every existing partition immediately
-- and to any future partition created via PARTITION OF afterward.

-- Up

CREATE INDEX idx_job_logs_execution_id ON job_logs (execution_id);

-- Down

DROP INDEX IF EXISTS idx_job_logs_execution_id;
