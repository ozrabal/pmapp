import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDown, AlertCircle } from "lucide-react";
import type { ProjectScheduleViewModel } from "./types";

type ExportFormat = "json" | "pdf" | "csv";

interface ExportScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ProjectScheduleViewModel;
}

const ExportScheduleDialog: React.FC<ExportScheduleDialogProps> = ({ isOpen, onClose, schedule }) => {
  // Format selection state
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);

      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock export functionality by creating a temporary file
      const scheduleData = JSON.stringify(schedule, null, 2);
      const blob = new Blob([scheduleData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create temporary link element to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-schedule.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Wystąpił błąd podczas eksportowania harmonogramu. Spróbuj ponownie później.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isExporting && !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Eksport harmonogramu</DialogTitle>
          <DialogDescription>Wybierz format, w którym chcesz wyeksportować harmonogram projektu.</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <RadioGroup value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ExportFormat)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON</Label>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Zalecany</span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" disabled />
                <Label htmlFor="pdf" className="text-muted-foreground">
                  PDF (Wkrótce)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" disabled />
                <Label htmlFor="csv" className="text-muted-foreground">
                  CSV (Wkrótce)
                </Label>
              </div>
            </div>
          </RadioGroup>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <Separator className="my-2" />

        <DialogFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose} disabled={isExporting}>
            Anuluj
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            {isExporting ? "Eksportowanie..." : "Eksportuj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportScheduleDialog;
