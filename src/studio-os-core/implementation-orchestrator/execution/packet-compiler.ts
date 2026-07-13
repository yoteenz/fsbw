import type { ImplementationPacket, ImplementationTask } from '../schemas/implementation-task';
import { IMPLEMENTATION_ORCHESTRATOR_VERSION } from '../schemas/implementation-task';

export function compileImplementationPacket(task: ImplementationTask): ImplementationPacket {
  const risk: ImplementationPacket['risk'] =
    task.category === 'architecture' || task.category === 'governance' || task.category === 'permissions'
      ? 'high'
      : task.category === 'pipeline' || task.category === 'marketplace'
        ? 'medium'
        : 'low';

  return {
    packetVersion: IMPLEMENTATION_ORCHESTRATOR_VERSION,
    taskId: task.taskId,
    title: task.title,
    purpose: task.description,
    dependencies: [...task.dependencies, ...task.blockedBy],
    acceptanceCriteria: task.acceptanceCriteria,
    tests: task.requiredTests,
    implementationSpec: task.implementationSpec,
    blockedItems: task.blockedBy,
    expectedOutputs: task.verificationCriteria,
    risk,
    estimatedDuration: task.estimatedEffort,
    executionMode: task.executionMode,
    founderApprovalRequired: task.founderApprovalRequired,
  };
}

export function compilePacketsForReadyTasks(tasks: ImplementationTask[]): ImplementationPacket[] {
  return tasks.filter((t) => t.status === 'READY').map(compileImplementationPacket);
}
