"use client";

import { useEffect, useRef } from "react";
import "gridstack/dist/gridstack.min.css";
import { GridStack, GridStackOptions } from "gridstack";

interface GridDashboardProps {
  children: React.ReactNode;
  options?: GridStackOptions;
}

export default function GridDashboard({ children, options = {} }: GridDashboardProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<GridStack | null>(null);

  useEffect(() => {
    if (gridRef.current && !stackRef.current) {
        // Initialize GridStack
        stackRef.current = GridStack.init({
            column: 12,
            cellHeight: "auto",
            margin: 12,
            float: true,
            removable: false,
            // Always allow dragging/resizing for this dashboard
            staticGrid: false,
            ...options
        }, gridRef.current);

        console.log("GridStack Initialized");
    }

    return () => {
        // We don't necessarily want to destroy it on every re-render if using React correctly,
        // but for a simple wrapper, we'll let it be.
        // Actually, GridStack managing React components is the hard part.
    };
  }, [options]);

  return (
    <div className="grid-stack" ref={gridRef}>
      {children}
    </div>
  );
}

export function GridItem({ 
    id, 
    x, y, w, h, minW, minH, 
    children,
    className 
}: { 
    id: string; 
    x?: number; y?: number; w?: number; h?: number; 
    minW?: number; minH?: number;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div 
            className={`grid-stack-item ${className || ""}`}
            gs-id={id}
            gs-x={x}
            gs-y={y}
            gs-w={w}
            gs-h={h}
            gs-min-w={minW}
            gs-min-h={minH}
        >
            <div className="grid-stack-item-content">
                {children}
            </div>
        </div>
    );
}
