"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, PlusCircle, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/data";
import type { GroceryItem, Currency } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters."),
  category: z.enum(["Pantry", "Produce", "Dairy", "Meat", "Bakery", "Frozen", "Cleaning", "Snacks", "Other"]),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  status: z.enum(["In Stock", "Need to Order", "Out of Stock", "Don't Need"]),
  lastOrdered: z.date().optional(),
  defaultGroup: z.string().optional(),
});

interface AddItemDialogProps {
  children: React.ReactNode;
  onConfirm: (item: Omit<GroceryItem, 'id' | 'orderHistory'> & { id?: string }) => void;
  itemToEdit?: GroceryItem;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currency: Currency;
}

export function AddItemDialog({ children, onConfirm, itemToEdit, isOpen, onOpenChange, currency }: AddItemDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: itemToEdit ? {
      ...itemToEdit,
      lastOrdered: itemToEdit.orderHistory.length > 0 ? itemToEdit.orderHistory[itemToEdit.orderHistory.length-1].date : undefined
    } : {
      name: "",
      quantity: 1,
      price: 0,
      status: "Need to Order",
      defaultGroup: "Personal"
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(itemToEdit ? {
        ...itemToEdit,
        lastOrdered: itemToEdit.orderHistory.length > 0 ? itemToEdit.orderHistory[itemToEdit.orderHistory.length-1].date : undefined
      } : {
        name: "",
        quantity: 1,
        price: 0,
        status: "Need to Order",
        defaultGroup: "Personal"
      });
    }
  }, [isOpen, itemToEdit, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { lastOrdered, ...rest } = values;
    onConfirm({ ...rest, id: itemToEdit?.id });
    toast({
      title: itemToEdit ? "Item Updated" : "Item Added",
      description: `${values.name} has been successfully ${itemToEdit ? 'updated' : 'added'}.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {itemToEdit ? 'Update the details of your grocery item.' : 'Add a new item to your grocery list.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Organic Bananas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ({currency.symbol})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
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
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.emoji} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Group</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Personal, Work, Family" {...field} />
                  </FormControl>
                   <FormDescription>The default spending group for this item.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Stock Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-x-4 gap-y-2"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Need to Order" />
                        </FormControl>
                        <FormLabel className="font-normal">Need to Order</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="In Stock" />
                        </FormControl>
                        <FormLabel className="font-normal">In Stock</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Out of Stock" />
                        </FormControl>
                        <FormLabel className="font-normal">Out of Stock</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Don't Need" />
                        </FormControl>
                        <FormLabel className="font-normal">Don't Need</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">{itemToEdit ? 'Save Changes' : 'Add Item'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
