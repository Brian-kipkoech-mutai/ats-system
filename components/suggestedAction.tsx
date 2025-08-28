"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
 

interface SuggestedActionsProps {
  onQuery: (query: string) => void;
}

export const SuggestedActions = ({ onQuery }: SuggestedActionsProps) => {
 const suggestedActions = [
   {
     title: "Exclusion Queries",
     label: "JavaScript developers available but not skilled in React",
     action: "JavaScript developers available but not skilled in React",
   },
   {
     title: "Complex Multi-Criteria Queries",
     label:
       "Frontend developers with TypeScript experience ready to join immediately, no visa sponsorship required",
     action:
       "Frontend developers with TypeScript experience ready to join immediately, no visa sponsorship required",
   },
   {
     title: "Role-Based Queries",
     label: "Data scientists with strong analytical and programming skills",
     action: "Data scientists with strong analytical and programming skills",
   },
   {
     title: "Work Preference & Relocation",
     label: "Remote frontend developers willing to relocate and work globally",
     action: "Remote frontend developers willing to relocate and work globally",
   },
 ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 items-stretch  gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block " : "block    "}
        >
          <Button
            variant="ghost"
            onClick={async () => onQuery(suggestedAction.action)}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col shadow-lg w-full h-full justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground text-wrap">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
};
