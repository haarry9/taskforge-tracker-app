
export type Task = {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: "Low" | "Medium" | "High";
  due_date?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  assignee_id?: string | null;
};

export type NewTask = {
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  due_date?: Date | null;
  board_id: string;
  column_id: string;
  position?: number;
  assignee_id?: string | null;
};
