import React, { useId } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import type { AssumptionsFormState } from "./types";

interface AssumptionsFormProps {
  formState: AssumptionsFormState;
  onUpdateField: (field: string, value: any) => void;
  onReset: () => void;
}

export function AssumptionsForm({
  formState,
  onUpdateField,
  onReset
}: AssumptionsFormProps) {
  // Generate unique IDs for form elements
  const idPrefix = useId();
  const projectGoalId = `${idPrefix}-project-goal`;
  const targetAudienceId = `${idPrefix}-target-audience`;
  
  const { values, errors, isSaving, savedSuccessfully } = formState;
  
  // Helper function to add item to an array field
  const addArrayItem = (field: 'functionalities' | 'constraints', defaultValue = '') => {
    const currentArray = [...values[field]];
    currentArray.push(defaultValue);
    onUpdateField(field, currentArray);
  };
  
  // Helper function to remove item from an array field
  const removeArrayItem = (field: 'functionalities' | 'constraints', index: number) => {
    const currentArray = [...values[field]];
    currentArray.splice(index, 1);
    onUpdateField(field, currentArray);
  };
  
  // Helper function to update an item in an array field
  const updateArrayItem = (field: 'functionalities' | 'constraints', index: number, value: string) => {
    const currentArray = [...values[field]];
    currentArray[index] = value;
    onUpdateField(field, currentArray);
  };
  
  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* Project Goal */}
      <div className="space-y-2">
        <Label 
          htmlFor={projectGoalId} 
          className="text-base font-medium"
        >
          Cel projektu
        </Label>
        <Textarea
          id={projectGoalId}
          name="projectGoal"
          value={values.projectGoal}
          onChange={(e) => onUpdateField('projectGoal', e.target.value)}
          placeholder="Opisz główny cel projektu. Co chcesz osiągnąć?"
          className="min-h-[100px] resize-y"
          aria-describedby={errors.projectGoal ? `${projectGoalId}-error` : undefined}
          aria-invalid={!!errors.projectGoal}
        />
        {errors.projectGoal && (
          <p id={`${projectGoalId}-error`} className="text-sm text-red-500 mt-1">
            {errors.projectGoal}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Maksymalnie 1000 znaków. Pozostało: {1000 - (values.projectGoal?.length || 0)} znaków.
        </p>
      </div>
      
      {/* Target Audience */}
      <div className="space-y-2">
        <Label 
          htmlFor={targetAudienceId}
          className="text-base font-medium"
        >
          Grupa docelowa
        </Label>
        <Textarea
          id={targetAudienceId}
          name="targetAudience"
          value={values.targetAudience}
          onChange={(e) => onUpdateField('targetAudience', e.target.value)}
          placeholder="Opisz grupę docelową Twojego projektu. Dla kogo jest przeznaczony?"
          className="min-h-[80px] resize-y"
          aria-describedby={errors.targetAudience ? `${targetAudienceId}-error` : undefined}
          aria-invalid={!!errors.targetAudience}
        />
        {errors.targetAudience && (
          <p id={`${targetAudienceId}-error`} className="text-sm text-red-500 mt-1">
            {errors.targetAudience}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Maksymalnie 500 znaków. Pozostało: {500 - (values.targetAudience?.length || 0)} znaków.
        </p>
      </div>
      
      {/* Functionalities */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Funkcjonalności</Label>
          <Button 
            type="button" 
            size="sm" 
            variant="outline"
            onClick={() => addArrayItem('functionalities')}
            disabled={values.functionalities.length >= 10}
          >
            <Plus className="h-4 w-4 mr-1" /> Dodaj
          </Button>
        </div>
        
        {values.functionalities.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Brak zdefiniowanych funkcjonalności. Dodaj pierwszą funkcjonalność, aby rozpocząć.
          </p>
        ) : (
          <div className="space-y-3">
            {values.functionalities.map((functionality, index) => (
              <div key={`functionality-${index}`} className="flex gap-2">
                <Input
                  name={`functionalities[${index}]`}
                  value={functionality}
                  onChange={(e) => updateArrayItem('functionalities', index, e.target.value)}
                  placeholder={`Funkcjonalność ${index + 1}`}
                  className="flex-grow"
                  maxLength={200}
                  aria-invalid={errors[`functionalities.${index}`] ? true : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem('functionalities', index)}
                  aria-label={`Usuń funkcjonalność ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {errors.functionalities && (
          <p className="text-sm text-red-500 mt-1">
            {errors.functionalities}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Maksymalnie 10 funkcjonalności. Każda maksymalnie 200 znaków.
        </p>
      </div>
      
      {/* Constraints */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Ograniczenia</Label>
          <Button 
            type="button" 
            size="sm" 
            variant="outline"
            onClick={() => addArrayItem('constraints')}
            disabled={values.constraints.length >= 5}
          >
            <Plus className="h-4 w-4 mr-1" /> Dodaj
          </Button>
        </div>
        
        {values.constraints.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Brak zdefiniowanych ograniczeń. Dodaj pierwsze ograniczenie, aby rozpocząć.
          </p>
        ) : (
          <div className="space-y-3">
            {values.constraints.map((constraint, index) => (
              <div key={`constraint-${index}`} className="flex gap-2">
                <Input
                  name={`constraints[${index}]`}
                  value={constraint}
                  onChange={(e) => updateArrayItem('constraints', index, e.target.value)}
                  placeholder={`Ograniczenie ${index + 1}`}
                  className="flex-grow"
                  maxLength={200}
                  aria-invalid={errors[`constraints.${index}`] ? true : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem('constraints', index)}
                  aria-label={`Usuń ograniczenie ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {errors.constraints && (
          <p className="text-sm text-red-500 mt-1">
            {errors.constraints}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Maksymalnie 5 ograniczeń. Każde maksymalnie 200 znaków.
        </p>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isSaving}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Przywróć
        </Button>
        
        <div className="flex items-center gap-4">
          {savedSuccessfully && (
            <p className="text-sm text-green-600">
              Zmiany zapisane
            </p>
          )}
          
          {isSaving && (
            <p className="text-sm text-muted-foreground">
              Zapisywanie...
            </p>
          )}
        </div>
      </div>
    </form>
  );
}