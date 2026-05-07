const { v4: uuidv4 } = require('uuid');
const { sendSuccess, sendError } = require('../utils/responseUtils');
const logger = require('../utils/logger');
const { delay } = require('../utils/delayUtils');

const jobsStore = new Map();

// Background job processor simulation
const processJob = async (jobId) => {
  const job = jobsStore.get(jobId);
  if (!job) return;

  job.status = 'processing';
  logger.info(`Job ${jobId} started processing`);

  // Simulate long running task
  await delay(10000); // 10s processing

  if (Math.random() < 0.2) {
    job.status = 'failed';
    job.result = 'Processing failed due to internal error';
    logger.error(`Job ${jobId} failed`);
  } else {
    job.status = 'completed';
    job.result = `Successfully generated report for ${job.type}`;
    logger.info(`Job ${jobId} completed successfully`);
  }
};

const createJob = (req, res) => {
  const jobId = uuidv4();
  const jobType = req.body.type || 'generic_export';
  
  jobsStore.set(jobId, {
    id: jobId,
    type: jobType,
    status: 'queued',
    createdAt: new Date().toISOString(),
    result: null
  });

  // Start async processing without awaiting
  processJob(jobId);

  sendSuccess(res, 202, 'Job accepted for processing', { jobId, statusUrl: `/api/jobs/${jobId}/status` });
};

const getJobStatus = (req, res) => {
  const job = jobsStore.get(req.params.id);
  if (!job) return sendError(res, 404, 'Job not found');

  sendSuccess(res, 200, 'Job status retrieved', { id: job.id, status: job.status, createdAt: job.createdAt });
};

const getJobResult = (req, res) => {
  const job = jobsStore.get(req.params.id);
  if (!job) return sendError(res, 404, 'Job not found');
  
  if (job.status !== 'completed' && job.status !== 'failed') {
    return sendError(res, 400, 'Job is not finished yet');
  }

  sendSuccess(res, 200, 'Job result retrieved', { id: job.id, status: job.status, result: job.result });
};

module.exports = { createJob, getJobStatus, getJobResult };
