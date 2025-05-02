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

// Schema walidacji formularza bloku
const functionalBlockFormSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(100, "Nazwa nie może przekraczać 100 znaków").trim(),
  description: z.string().min(1, "Opis jest wymagany").max(1000, "Opis nie może przekraczać 1000 znaków").trim(),
  category: z.string().min(1, "Kategoria jest wymagana"),
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
  // Domyślne wartości formularza
  const defaultValues: FunctionalBlockFormValues = {
    name: block?.name || "",
    description: block?.description || "",
    category: block?.category || "other",
    dependencies: block?.dependencies || [],
  };

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
  }, [block, reset]);

  // Obserwuj zmiany wartości
  const currentDependencies = watch("dependencies");

  // Walidacja zależności cyklicznych
  const validateDependencies = (values: FunctionalBlockFormValues): boolean => {
    // Sprawdzenie czy zależności nie tworzą cyklu
    if (block && values.dependencies.includes(block.id)) {
      return false;
    }

    return true;
  };

  // Obsługa zmiany kategorii
  const handleCategoryChange = (value: string) => {
    setValue("category", value, { shouldValidate: true, shouldDirty: true });
  };

  // Obsługa zmiany zależności
  const handleDependenciesChange = (values: string[]) => {
    setValue("dependencies", values, { shouldValidate: true, shouldDirty: true });
  };

  // Handler dla zapisywania formularza
  const onSubmit = (values: FunctionalBlockFormValues) => {
    if (!validateDependencies(values)) {
      return;
    }

    onSave(block?.id, values);
  };

  // Dostępne bloki do wyboru jako zależności (bez aktualnego bloku)
  const availableBlocks = allBlocks.filter((b) => !block || b.id !== block.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nazwa bloku */}
      <div className="space-y-2">
        <Label htmlFor="name" className="font-medium">
          Nazwa
        </Label>
        <Input
          id="name"
          placeholder="Wprowadź nazwę bloku funkcjonalnego"
          {...register("name")}
          className={errors.name ? "border-red-300 focus:border-red-500" : ""}
          autoFocus
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      {/* Opis */}
      <div className="space-y-2">
        <Label htmlFor="description" className="font-medium">
          Opis
        </Label>
        <Textarea
          id="description"
          placeholder="Opisz funkcjonalność tego bloku"
          rows={4}
          {...register("description")}
          className={errors.description ? "border-red-300 focus:border-red-500" : ""}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      {/* Kategoria */}
      <div className="space-y-2">
        <Label htmlFor="category" className="font-medium">
          Kategoria
        </Label>
        <BlockCategorySelect
          value={getValues("category")}
          onChange={handleCategoryChange}
          error={errors.category?.message}
        />
      </div>

      {/* Zależności */}
      <div className="space-y-2">
        <Label htmlFor="dependencies" className="font-medium">
          Zależności
        </Label>
        <BlockDependenciesSelect
          values={currentDependencies}
          onChange={handleDependenciesChange}
          availableBlocks={availableBlocks}
          currentBlockId={block?.id}
        />
        <p className="text-sm text-neutral-500">Wybierz bloki, od których ten blok jest zależny</p>
      </div>

      {/* Przyciski formularza */}
      <div className={`flex justify-end gap-3 ${inModal ? "" : "border-t pt-4 mt-6"}`}>
        <Button type="button" onClick={onCancel} variant="outline">
          Anuluj
        </Button>
        <Button type="submit" disabled={!isValid || !isDirty}>
          Zapisz
        </Button>
      </div>
    </form>
  );
}
