import { runPipeline } from './pipeline.js';

runPipeline().catch((err) => {
  console.error('[error] pipeline failed');
  console.error(err);
  process.exitCode = 1;
});
