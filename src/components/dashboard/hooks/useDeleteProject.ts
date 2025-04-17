import { useState, useCallback, useEffect } from "react";
import type { ProjectViewModel } from "../types";
import { ProjectClientService } from "@/lib/services/project.service";
import { useNotifications } from "@/components/ui/notification-provider";

interface UseDeleteProjectResult {
  isOpen: boolean;
  projectToDelete: ProjectViewModel | null;
  isDeleting: boolean;
  error: Error | null;
  openModal: (project: ProjectViewModel) => void;
  closeModal: () => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
}

export function useDeleteProject(
  onDelete?: (id: string) => Promise<void>
): UseDeleteProjectResult {
  // Modal open state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Project to delete
  const [projectToDelete, setProjectToDelete] = useState<ProjectViewModel | null>(null);
  
  // Deleting state
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Error state
  const [error, setError] = useState<Error | null>(null);
  
  // Get notifications context
  const { showNotification } = useNotifications();
  
  // Track if component is mounted
  const [isMounted, setIsMounted] = useState(true);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Open the modal with a specific project
  const openModal = useCallback((project: ProjectViewModel) => {
    setProjectToDelete(project);
    setError(null);
    setIsOpen(true);
  }, []);

  // Close the modal
  const closeModal = useCallback(() => {
    if (isDeleting) return; // Prevent closing while delete in progress
    
    setIsOpen(false);
    setError(null);
    
    // Clear the project after animation completes for smooth transitions
    setTimeout(() => {
      if (isMounted) {
        setProjectToDelete(null);
      }
    }, 300);
  }, [isDeleting, isMounted]);

  // Default delete handler using service if none provided
  const defaultDeleteHandler = useCallback(async (id: string) => {
    await ProjectClientService.deleteProject(id);
  }, []);

  // Use provided delete handler or default one
  const deleteHandler = onDelete || defaultDeleteHandler;

  // Confirm the deletion
  const confirmDelete = useCallback(async () => {
    if (!projectToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await deleteHandler(projectToDelete.id);
      
      if (isMounted) {
        // Show success notification when needed by the component using this hook
        // showNotification is already called in the parent component (useProjectsList)
        closeModal();
      }
    } catch (err) {
      if (isMounted) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Nieznany błąd podczas usuwania projektu.';
        
        setError(err instanceof Error ? err : new Error(errorMessage));
        showNotification(errorMessage, "error");
      }
    } finally {
      if (isMounted) {
        setIsDeleting(false);
      }
    }
  }, [projectToDelete, deleteHandler, closeModal, isMounted, showNotification]);

  // Cancel the deletion
  const cancelDelete = useCallback(() => {
    closeModal();
  }, [closeModal]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDeleting, closeModal]);

  return {
    isOpen,
    projectToDelete,
    isDeleting,
    error,
    openModal,
    closeModal,
    confirmDelete,
    cancelDelete
  };
}