// Workflow preservation and batch operation utilities
import { ToolUsage } from '../types';

export interface WorkflowStep {
  toolId: string;
  inputData: any;
  outputData: any;
  timestamp: Date;
  duration: number;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  createdAt: Date;
  lastUsed: Date;
  totalDuration: number;
}

export interface BatchOperation {
  id: string;
  toolId: string;
  inputs: any[];
  outputs: any[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  errors: string[];
}

class WorkflowManager {
  private workflows: Map<string, Workflow> = new Map();
  private currentWorkflow: WorkflowStep[] = [];
  private batchOperations: Map<string, BatchOperation> = new Map();

  constructor() {
    this.loadWorkflows();
  }

  private loadWorkflows(): void {
    try {
      const stored = localStorage.getItem('tool-workflows');
      if (stored) {
        const workflows = JSON.parse(stored);
        workflows.forEach((workflow: Workflow) => {
          // Convert date strings back to Date objects
          workflow.createdAt = new Date(workflow.createdAt);
          workflow.lastUsed = new Date(workflow.lastUsed);
          workflow.steps.forEach(step => {
            step.timestamp = new Date(step.timestamp);
          });
          this.workflows.set(workflow.id, workflow);
        });
      }
    } catch (error) {
      console.warn('Failed to load workflows:', error);
    }
  }

  private saveWorkflows(): void {
    try {
      const workflows = Array.from(this.workflows.values());
      localStorage.setItem('tool-workflows', JSON.stringify(workflows));
    } catch (error) {
      console.warn('Failed to save workflows:', error);
    }
  }

  public startWorkflow(): void {
    this.currentWorkflow = [];
  }

  public addWorkflowStep(
    toolId: string,
    inputData: any,
    outputData: any,
    duration: number
  ): void {
    const step: WorkflowStep = {
      toolId,
      inputData,
      outputData,
      timestamp: new Date(),
      duration
    };
    
    this.currentWorkflow.push(step);
  }

  public saveCurrentWorkflow(name?: string): string {
    if (this.currentWorkflow.length === 0) {
      throw new Error('No workflow steps to save');
    }

    const workflowId = `workflow_${Date.now()}`;
    const workflow: Workflow = {
      id: workflowId,
      name: name || `Workflow ${new Date().toLocaleDateString()}`,
      steps: [...this.currentWorkflow],
      createdAt: new Date(),
      lastUsed: new Date(),
      totalDuration: this.currentWorkflow.reduce((sum, step) => sum + step.duration, 0)
    };

    this.workflows.set(workflowId, workflow);
    this.saveWorkflows();
    this.currentWorkflow = [];

    return workflowId;
  }

  public getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  public getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  }

  public deleteWorkflow(id: string): boolean {
    const deleted = this.workflows.delete(id);
    if (deleted) {
      this.saveWorkflows();
    }
    return deleted;
  }

  public replayWorkflow(id: string): WorkflowStep[] {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Update last used timestamp
    workflow.lastUsed = new Date();
    this.saveWorkflows();

    return workflow.steps;
  }

  public getCurrentWorkflow(): WorkflowStep[] {
    return [...this.currentWorkflow];
  }

  public clearCurrentWorkflow(): void {
    this.currentWorkflow = [];
  }

  // Batch Operations
  public createBatchOperation(
    toolId: string,
    inputs: any[]
  ): string {
    const batchId = `batch_${Date.now()}`;
    const batch: BatchOperation = {
      id: batchId,
      toolId,
      inputs,
      outputs: [],
      status: 'pending',
      progress: 0,
      errors: []
    };

    this.batchOperations.set(batchId, batch);
    return batchId;
  }

  public async processBatchOperation(
    batchId: string,
    processor: (input: any) => Promise<any>,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const batch = this.batchOperations.get(batchId);
    if (!batch) {
      throw new Error('Batch operation not found');
    }

    batch.status = 'processing';
    batch.startTime = new Date();
    batch.outputs = [];
    batch.errors = [];

    try {
      for (let i = 0; i < batch.inputs.length; i++) {
        try {
          const result = await processor(batch.inputs[i]);
          batch.outputs.push(result);
        } catch (error) {
          batch.errors.push(`Input ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          batch.outputs.push(null);
        }

        batch.progress = ((i + 1) / batch.inputs.length) * 100;
        if (onProgress) {
          onProgress(batch.progress);
        }
      }

      batch.status = batch.errors.length === 0 ? 'completed' : 'failed';
    } catch (error) {
      batch.status = 'failed';
      batch.errors.push(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      batch.endTime = new Date();
    }
  }

  public getBatchOperation(id: string): BatchOperation | undefined {
    return this.batchOperations.get(id);
  }

  public getAllBatchOperations(): BatchOperation[] {
    return Array.from(this.batchOperations.values())
      .sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0));
  }

  public deleteBatchOperation(id: string): boolean {
    return this.batchOperations.delete(id);
  }

  // Workflow Analysis
  public getWorkflowStats(): {
    totalWorkflows: number;
    totalSteps: number;
    averageStepsPerWorkflow: number;
    mostUsedTool: string;
    totalTimeSaved: number;
  } {
    const workflows = this.getAllWorkflows();
    const totalWorkflows = workflows.length;
    const totalSteps = workflows.reduce((sum, w) => sum + w.steps.length, 0);
    const averageStepsPerWorkflow = totalWorkflows > 0 ? totalSteps / totalWorkflows : 0;

    // Count tool usage
    const toolUsage: Record<string, number> = {};
    workflows.forEach(workflow => {
      workflow.steps.forEach(step => {
        toolUsage[step.toolId] = (toolUsage[step.toolId] || 0) + 1;
      });
    });

    const mostUsedTool = Object.entries(toolUsage)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    const totalTimeSaved = workflows.reduce((sum, w) => sum + w.totalDuration, 0);

    return {
      totalWorkflows,
      totalSteps,
      averageStepsPerWorkflow,
      mostUsedTool,
      totalTimeSaved
    };
  }

  public suggestWorkflowOptimizations(workflowId: string): string[] {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return [];

    const suggestions: string[] = [];

    // Check for redundant steps
    const toolCounts: Record<string, number> = {};
    workflow.steps.forEach(step => {
      toolCounts[step.toolId] = (toolCounts[step.toolId] || 0) + 1;
    });

    Object.entries(toolCounts).forEach(([toolId, count]) => {
      if (count > 2) {
        suggestions.push(`Consider batching ${count} operations in ${toolId}`);
      }
    });

    // Check for long-running steps
    const slowSteps = workflow.steps.filter(step => step.duration > 5000);
    if (slowSteps.length > 0) {
      suggestions.push(`${slowSteps.length} steps took longer than 5 seconds - consider optimization`);
    }

    // Check for potential integrations
    for (let i = 0; i < workflow.steps.length - 1; i++) {
      const currentStep = workflow.steps[i];
      const nextStep = workflow.steps[i + 1];
      
      // Simple heuristic: if output type matches input type, suggest integration
      if (typeof currentStep.outputData === typeof nextStep.inputData) {
        suggestions.push(`Consider direct integration between ${currentStep.toolId} and ${nextStep.toolId}`);
      }
    }

    return suggestions;
  }

  // Export/Import workflows
  public exportWorkflow(id: string): string {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    return JSON.stringify(workflow, null, 2);
  }

  public importWorkflow(workflowData: string): string {
    try {
      const workflow: Workflow = JSON.parse(workflowData);
      
      // Validate workflow structure
      if (!workflow.id || !workflow.steps || !Array.isArray(workflow.steps)) {
        throw new Error('Invalid workflow format');
      }

      // Generate new ID to avoid conflicts
      const newId = `workflow_${Date.now()}`;
      workflow.id = newId;
      workflow.createdAt = new Date(workflow.createdAt);
      workflow.lastUsed = new Date(workflow.lastUsed);
      workflow.steps.forEach(step => {
        step.timestamp = new Date(step.timestamp);
      });

      this.workflows.set(newId, workflow);
      this.saveWorkflows();

      return newId;
    } catch (error) {
      throw new Error(`Failed to import workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create singleton instance
export const workflowManager = new WorkflowManager();

// Convenience functions
export const startWorkflow = () => workflowManager.startWorkflow();
export const addWorkflowStep = (toolId: string, inputData: any, outputData: any, duration: number) => 
  workflowManager.addWorkflowStep(toolId, inputData, outputData, duration);
export const saveCurrentWorkflow = (name?: string) => workflowManager.saveCurrentWorkflow(name);
export const getWorkflow = (id: string) => workflowManager.getWorkflow(id);
export const getAllWorkflows = () => workflowManager.getAllWorkflows();
export const replayWorkflow = (id: string) => workflowManager.replayWorkflow(id);
export const createBatchOperation = (toolId: string, inputs: any[]) => 
  workflowManager.createBatchOperation(toolId, inputs);
export const processBatchOperation = (batchId: string, processor: (input: any) => Promise<any>, onProgress?: (progress: number) => void) =>
  workflowManager.processBatchOperation(batchId, processor, onProgress);