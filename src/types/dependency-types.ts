
export type TaskDependency = {
  id: string;
  dependent_task_id: string;
  dependency_task_id: string;
  created_at: string;
  updated_at: string;
};

export type NewTaskDependency = {
  dependent_task_id: string;
  dependency_task_id: string;
};
