
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ShoppingEvent } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Event name must be at least 2 characters."),
  baseCategory: z.enum(["Birthday", "Anniversary", "Other"]),
  customCategory: z.string().optional(),
  date: z.date({
    required_error: "A date is required.",
  }),
  notes: z.string().optional(),
}).refine(data => {
    if (data.baseCategory === "Other" && (!data.customCategory || data.customCategory.trim().length < 2)) {
        return false;
    }
    return true;
}, {
    message: "Custom category must be at least 2 characters.",
    path: ["customCategory"],
});


interface AddEventDialogProps {
  children?: React.ReactNode;
  onConfirm: (item: Omit<ShoppingEvent, 'id'> & { id?: string }) => void;
  eventToEdit?: ShoppingEvent;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddEventDialog({ onConfirm, eventToEdit, isOpen, onOpenChange }: AddEventDialogProps) {
  
  const getBaseCategory = (category: string | undefined) => {
    if (category === "Birthday" || category === "Anniversary") {
      return category;
    }
    return category ? "Other" : "Birthday";
  }
  
  const getCustomCategory = (category: string | undefined) => {
     if (category && category !== "Birthday" && category !== "Anniversary") {
      return category;
    }
    return "";
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      baseCategory: "Birthday",
      customCategory: "",
      notes: "",
    },
  });
  
  const selectedBaseCategory = form.watch("baseCategory");

  React.useEffect(() => {
    if (isOpen) {
      form.reset(eventToEdit ? {
        name: eventToEdit.name,
        baseCategory: getBaseCategory(eventToEdit.category),
        customCategory: getCustomCategory(eventToEdit.category),
        date: eventToEdit.date,
        notes: eventToEdit.notes,
      } : {
        name: "",
        baseCategory: "Birthday",
        customCategory: "",
        date: undefined,
        notes: "",
      });
    }
  }, [isOpen, eventToEdit, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalCategory = values.baseCategory === "Other" ? values.customCategory! : values.baseCategory;
    const eventData = {
        name: values.name,
        category: finalCategory,
        date: values.date,
        notes: values.notes,
    };
    onConfirm({ ...eventData, id: eventToEdit?.id });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{eventToEdit ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          <DialogDescription>
            {eventToEdit ? 'Update the details of this event.' : 'Add a new important date to track.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mom's Birthday" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="baseCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Birthday">Birthday</SelectItem>
                        <SelectItem value="Anniversary">Anniversary</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
             {selectedBaseCategory === "Other" && (
                <FormField
                    control={form.control}
                    name="customCategory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Custom Category Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Housewarming" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            {selectedBaseCategory === "Birthday" && (
                <p className="text-xs text-muted-foreground -mt-2">
                    For birthdays, just select the upcoming date this year.
                </p>
            )}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., She loves chocolate and books." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">{eventToEdit ? 'Save Changes' : 'Add Event'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
