
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';

interface AddColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

const columnFormSchema = z.object({
  title: z.string().min(1, "Column title is required"),
});

type ColumnFormValues = z.infer<typeof columnFormSchema>;

export function AddColumnDialog({
  isOpen,
  onClose,
  onSubmit,
}: AddColumnDialogProps) {
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      title: "",
    },
  });

  function handleSubmit(values: ColumnFormValues) {
    onSubmit(values.title);
    form.reset();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
          <DialogDescription>
            Enter a title for the new column.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Column title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Column
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
