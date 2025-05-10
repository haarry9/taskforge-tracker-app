
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task, NewTask } from '@/types/task-types';
import { DialogFooter } from '@/components/ui/dialog';

// Schema for form validation
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  due_date: z.date().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskDialogFormProps {
  onSubmit: (data: TaskFormValues) => void;
  onCancel: () => void;
  isEditing: boolean;
  task?: Task;
  isOpen: boolean;
  children?: React.ReactNode; // For dependency selector
}

export function TaskDialogForm({
  onSubmit,
  onCancel,
  isEditing,
  task,
  isOpen,
  children
}: TaskDialogFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      due_date: undefined,
    },
  });

  // Reset form when dialog opens/closes or task changes
  React.useEffect(() => {
    if (isOpen) {
      // When editing, populate form with task data
      if (isEditing && task) {
        form.reset({
          title: task.title || "",
          description: task.description || "",
          priority: task.priority || "Medium",
          due_date: task.due_date ? new Date(task.due_date) : undefined,
        });
      } else {
        // When creating new, reset to defaults
        form.reset({
          title: "",
          description: "",
          priority: "Medium",
          due_date: undefined,
        });
      }
    }
  }, [isOpen, isEditing, task, form]);

  const handleFormSubmit = (values: TaskFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
                value={field.value}
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

        {/* Dependencies selection - Child component will be rendered here */}
        {children}

        <DialogFooter className="pt-4 gap-2">
          <Button 
            variant="outline" 
            type="button" 
            onClick={onCancel}
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
  );
}
