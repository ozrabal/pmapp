import React, { useEffect } from "react";
import { type FunctionalBlockDto } from "../../../types";
import { type FunctionalBlockFormValues } from "./types";
import { BlockCategorySelect } from "./BlockCategorySelect";
import { BlockDependenciesSelect } from "./BlockDependenciesSelect";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Block form validation schema
const functionalBlockFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters").trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description cannot exceed 1000 characters")
    .trim(),
  category: z.string().min(1, "Category is required"),
  dependencies: z.array(z.string()),
});

interface FunctionalBlockFormProps {
  block?: FunctionalBlockDto | null;
  allBlocks: FunctionalBlockDto[];
  onSave: (blockId: string | undefined, values: FunctionalBlockFormValues) => void;
  onCancel: () => void;
  inModal?: boolean;
}

export function FunctionalBlockForm({ block, allBlocks, onSave, onCancel, inModal = false }: FunctionalBlockFormProps) {
  // Default form values
  const defaultValues = React.useMemo<FunctionalBlockFormValues>(
    () => ({
      name: block?.name || "",
      description: block?.description || "",
      category: block?.category || "other",
      dependencies: block?.dependencies || [],
    }),
    [block?.name, block?.description, block?.category, block?.dependencies]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    getValues,
    watch,
    reset,
  } = useForm<FunctionalBlockFormValues>({
    defaultValues,
    resolver: zodResolver(functionalBlockFormSchema),
    mode: "onChange",
  });

  // Reset form when block changes
  useEffect(() => {
    if (block) {
      reset({
        name: block.name,
        description: block.description,
        category: block.category,
        dependencies: block.dependencies,
      });
    } else {
      reset(defaultValues);
    }
  }, [block, defaultValues, reset]);

  // Watch value changes
  const currentDependencies = watch("dependencies");

  // Validate cyclic dependencies
  const validateDependencies = (values: FunctionalBlockFormValues): boolean => {
    // Check if dependencies create a cycle
    if (block && values.dependencies.includes(block.id)) {
      return false;
    }

    return true;
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setValue("category", value, { shouldValidate: true, shouldDirty: true });
  };

  // Handle dependencies change
  const handleDependenciesChange = (values: string[]) => {
    setValue("dependencies", values, { shouldValidate: true, shouldDirty: true });
  };

  // Handler for saving the form
  const onSubmit = (values: FunctionalBlockFormValues) => {
    if (!validateDependencies(values)) {
      return;
    }

    onSave(block?.id, values);
  };

  // Available blocks to select as dependencies (excluding the current block)
  const availableBlocks = allBlocks.filter((b) => !block || b.id !== block.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Block name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="font-medium">
          Name
        </Label>
        <Input
          id="name"
          placeholder="Enter functional block name"
          {...register("name")}
          className={errors.name ? "border-red-300 focus:border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the functionality of this block"
          rows={4}
          {...register("description")}
          className={errors.description ? "border-red-300 focus:border-red-500" : ""}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="font-medium">
          Category
        </Label>
        <BlockCategorySelect
          value={getValues("category")}
          onChange={handleCategoryChange}
          error={errors.category?.message}
        />
      </div>

      {/* Dependencies */}
      <div className="space-y-2">
        <Label htmlFor="dependencies" className="font-medium">
          Dependencies
        </Label>
        <BlockDependenciesSelect
          values={currentDependencies}
          onChange={handleDependenciesChange}
          availableBlocks={availableBlocks}
          currentBlockId={block?.id}
        />
        <p className="text-sm text-neutral-500">Select blocks that this block depends on</p>
      </div>

      {/* Form buttons */}
      <div className={`flex justify-end gap-3 ${inModal ? "" : "border-t pt-4 mt-6"}`}>
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || !isDirty}>
          Save
        </Button>
      </div>
    </form>
  );
}
