
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, NewTask } from '@/hooks/useTasks';
import { useDependencies } from '@/hooks/useDependencies';
import DependencySelect from './DependencySelect';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTask, dependencyIds?: string[]) => void;
  boardId: string;
  columnId: string;
  isEditing?: boolean;
  task?: Task;
  title?: string;
  allTasks?: Task[];
}

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  due_date: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export function TaskDialog({
  isOpen,
  onClose,
  onSubmit,
  boardId,
  columnId,
  isEditing = false,
  task,
  title = "Add New Task",
  allTasks = []
}: TaskDialogProps) {
  const [selectedDependencyIds, setSelectedDependencyIds] = useState<string[]>([]);
  const { getTaskDependencies } = useDependencies(boardId);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "Medium",
      due_date: task?.due_date ? new Date(task.due_date) : undefined,
    },
  });

  // Load existing dependencies when editing
  useEffect(() => {
    const loadDependencies = async () => {
      if (isEditing && task) {
        try {
          const dependencies = await getTaskDependencies(task.id);
          const dependencyIds = dependencies.map(dep => dep.dependency_task_id);
          setSelectedDependencyIds(dependencyIds);
        } catch (error) {
          console.error("Error loading dependencies:", error);
        }
      }
    };
    
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen, isEditing, task, getTaskDependencies]);

  function handleSubmit(values: TaskFormValues) {
    const taskData: NewTask = {
      title: values.title,
      description: values.description,
      priority: values.priority,
      due_date: values.due_date,
      board_id: boardId,
      column_id: columnId,
    };
    
    onSubmit(taskData, selectedDependencyIds);
    form.reset();
    setSelectedDependencyIds([]);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg bg-white shadow-lg border-blue-100">
        <DialogHeader>
          <DialogTitle className="text-blue-800">{title}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit the task details below." : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" className="border-blue-200 focus-visible:ring-blue-500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add task description..."
                      className="min-h-[80px] border-blue-200 focus-visible:ring-blue-500"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700">Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-blue-700">Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal border-blue-200 hover:bg-blue-50",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a due date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dependencies selection */}
            <FormItem>
              <FormLabel className="text-blue-700">Dependencies</FormLabel>
              <DependencySelect
                boardId={boardId}
                columnId={columnId}
                availableTasks={allTasks}
                selectedTaskIds={selectedDependencyIds}
                currentTaskId={task?.id}
                onSelectDependencies={setSelectedDependencyIds}
              />
              <FormMessage />
            </FormItem>

            <DialogFooter className="pt-4 gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onClose}
                className="border-blue-200 hover:bg-blue-50 text-blue-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isEditing ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
