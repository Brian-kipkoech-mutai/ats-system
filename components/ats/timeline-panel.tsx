"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { TimelineStep } from "@/lib/types/types";
import {
  CheckCircle,
  Circle,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface TimelinePanelProps {
  steps: TimelineStep[];
}

export function TimelinePanel({ steps }: TimelinePanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleExpanded = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col h-full  pt-4 l  ">
      <div className=" ">
        <p className="text-sm text-muted-foreground">Watch the ATS think</p>
      </div>
      <ScrollArea className="flex-1 pt-4 space-y-4 overflow-y-auto  pr-2  ">
        <div className="space-y-4">
          {steps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground text-center py-8"
            >
              No activity yet. Start by asking a question!
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: index * 0.1 + 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      {step.status === "complete" && (
                        <CheckCircle className="h-4 w-4 text-green-700" />
                      )}
                      {step.status === "active" && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="h-4 w-4 text-blue-500" />
                        </motion.div>
                      )}
                      {step.status === "pending" && (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </motion.div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="flex items-center gap-2 mb-1"
                    >
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm font-medium">{step.title}</span>
                      {step.data && (
                        <button
                          onClick={() => toggleExpanded(step.id)}
                          className="ml-auto p-1 hover:bg-muted rounded transition-colors"
                        >
                          {expandedSteps.has(step.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </motion.div>

                    <AnimatePresence>
                      {step.data && expandedSteps.has(step.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(step.data, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="text-xs text-muted-foreground mt-1"
                    >
                      {step.timestamp.toLocaleTimeString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
