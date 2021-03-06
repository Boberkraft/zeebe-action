import {ZBClient, ZBWorkerTaskHandler} from 'zeebe-node'
import {getActionLogger, Logger} from './log/logger'

export async function bootstrapWorkers(
  workerCode: string,
  lifetime: number,
  zbc: ZBClient,
  logger: Logger
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const __module: {
      exports?: {tasks?: {[key: string]: ZBWorkerTaskHandler}}
    } = {}
    const log = getActionLogger('WorkerHandler', false)
    try {
      eval(`(function(module){${workerCode}})(__module)`)
    } catch (e) {
      reject(new Error(`Error in handler file: ${e.message}`))
    }
    const tasks = __module.exports?.tasks
    if (tasks) {
      for (const tasktype of Object.keys(tasks)) {
        logger.info(`Starting worker for task type ${tasktype}...`)
        zbc.createWorker(null, tasktype, tasks[tasktype])
      }

      setTimeout(async () => {
        logger.info('Shutting down workers...')
        await zbc.close()
        resolve()
      }, lifetime * 60 * 1000)
    } else {
      await zbc.close()
      reject(new Error(`No export 'tasks' found in handler file`))
    }
  })
}
