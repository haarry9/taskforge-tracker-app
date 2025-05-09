
import React, { useEffect, useState, useRef } from 'react';
import { X, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';
import { TaskDependency } from '@/hooks/useDependencies';

interface DependencyOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  dependencies: TaskDependency[];
  tasks: Task[];
  onDeleteDependency: (dependencyId: string) => void;
}

interface ArrowPosition {
  id: string;
  dependencyId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  fromTaskId: string;
  toTaskId: string;
}

interface DependencyInfo {
  id: string;
  dependentTask: Task | undefined;
  dependencyTask: Task | undefined;
}

export default function DependencyOverlay({
  isVisible,
  onClose,
  dependencies,
  tasks,
  onDeleteDependency,
}: DependencyOverlayProps) {
  const [arrowPositions, setArrowPositions] = useState<ArrowPosition[]>([]);
  const [selectedDependency, setSelectedDependency] = useState<DependencyInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate arrow positions whenever dependencies change or when scrolling
  useEffect(() => {
    if (!isVisible) return;

    const calculateArrowPositions = () => {
      const newArrowPositions: ArrowPosition[] = [];

      dependencies.forEach((dep) => {
        const dependentTaskElement = document.querySelector(`[data-task-id="${dep.dependent_task_id}"]`);
        const dependencyTaskElement = document.querySelector(`[data-task-id="${dep.dependency_task_id}"]`);

        if (dependentTaskElement && dependencyTaskElement) {
          const dependentRect = dependentTaskElement.getBoundingClientRect();
          const dependencyRect = dependencyTaskElement.getBoundingClientRect();
          
          // Calculate coordinates relative to the SVG container
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (!containerRect) return;

          // Add arrow position (from dependent task to its dependency)
          newArrowPositions.push({
            id: `arrow-${dep.id}`,
            dependencyId: dep.id,
            startX: dependentRect.left - containerRect.left + dependentRect.width / 2,
            startY: dependentRect.top - containerRect.top + dependentRect.height / 2,
            endX: dependencyRect.left - containerRect.left + dependencyRect.width / 2,
            endY: dependencyRect.top - containerRect.top + dependencyRect.height / 2,
            fromTaskId: dep.dependent_task_id,
            toTaskId: dep.dependency_task_id,
          });
        }
      });

      setArrowPositions(newArrowPositions);
    };

    // Initial calculation
    calculateArrowPositions();

    // Re-calculate on scroll and resize
    const handleScroll = () => {
      requestAnimationFrame(calculateArrowPositions);
    };

    const handleResize = () => {
      requestAnimationFrame(calculateArrowPositions);
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, dependencies]);

  // Handle arrow click to show dependency details
  const handleArrowClick = (arrow: ArrowPosition) => {
    const dependency = dependencies.find(dep => dep.id === arrow.dependencyId);
    if (!dependency) return;

    const dependentTask = tasks.find(task => task.id === dependency.dependent_task_id);
    const dependencyTask = tasks.find(task => task.id === dependency.dependency_task_id);

    setSelectedDependency({
      id: dependency.id,
      dependentTask,
      dependencyTask,
    });
    setIsDialogOpen(true);
  };

  // Handle deletion of dependency
  const handleDeleteDependency = () => {
    if (selectedDependency) {
      onDeleteDependency(selectedDependency.id);
      setIsDialogOpen(false);
      setSelectedDependency(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      style={{ 
        overflow: 'hidden',
        height: containerRef.current ? `${containerRef.current.scrollHeight}px` : '100%',
      }}
    >
      <svg 
        ref={svgRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ 
          overflow: 'visible',
          pointerEvents: 'none',
          height: svgRef.current ? `${svgRef.current.scrollHeight}px` : '100%',
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
        </defs>
        {arrowPositions.map((arrow) => {
          // Calculate bezier curve control points
          const dx = arrow.endX - arrow.startX;
          const dy = arrow.endY - arrow.startY;
          const controlX = arrow.startX + dx / 2;
          const controlY = arrow.startY + dy / 2;
          
          // Path with bezier curve
          const path = `M ${arrow.startX} ${arrow.startY} Q ${controlX} ${arrow.startY}, ${controlX} ${controlY} T ${arrow.endX} ${arrow.endY}`;
          
          return (
            <g key={arrow.id} onClick={() => handleArrowClick(arrow)}>
              <path
                d={path}
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
                style={{ pointerEvents: 'stroke' }}
                className="cursor-pointer"
              />
              {/* Invisible wider path for easier clicking */}
              <path
                d={path}
                stroke="transparent"
                strokeWidth="10"
                fill="none"
                style={{ pointerEvents: 'stroke' }}
                className="cursor-pointer"
              />
            </g>
          );
        })}
      </svg>

      {/* Dependency details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg bg-white">
          <DialogHeader>
            <DialogTitle>Dependency Relationship</DialogTitle>
            <DialogDescription>
              Details about the dependency between tasks.
            </DialogDescription>
          </DialogHeader>

          {selectedDependency && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-700">Dependent Task (needs to be completed second):</h4>
                <p className="font-medium mt-1">{selectedDependency.dependentTask?.title}</p>
                {selectedDependency.dependentTask?.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedDependency.dependentTask.description}</p>
                )}
              </div>
              
              <div className="flex justify-center">
                <div className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                  depends on
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-700">Dependency Task (needs to be completed first):</h4>
                <p className="font-medium mt-1">{selectedDependency.dependencyTask?.title}</p>
                {selectedDependency.dependencyTask?.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedDependency.dependencyTask.description}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={handleDeleteDependency}
              className="mr-auto"
            >
              Remove Dependency
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close button for the overlay */}
      <div className="fixed top-4 right-4 pointer-events-auto">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onClose}
          className="flex items-center gap-1.5 shadow-md"
        >
          <X className="h-4 w-4" />
          <span>Hide Dependencies</span>
        </Button>
      </div>
    </div>
  );
}
