"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { title } from "process";

interface SuggestedActionsProps {
  onQuery: (query: string) => void;
}

export const SuggestedActions = ({ onQuery }: SuggestedActionsProps) => {
  const suggestedActions = [
    {
      title: "Backend engineers in Germany",
      label: "Backend engineers in Germany, most experience first ",
      action: "Backend engineers in Germany, most experience first",
    },
    {
      title: "Frontend developers willing to relocate",
      label: "Frontend developers willing to relocate, sorted by salary",
      action:
        "Find me 5 Frontend developers willing to relocate, sorted by salary",
    },

    {
      title: "Full-stack engineers  ",
      label: "Full-stack engineers available within 2 weeks willing to work on-site",
      action: "Find me 5 Full-stack engineers available within 2 weeks",
    },
    {
      title: "Remote React developers",
      label: "Remote React developers with 5+ years experience",
      action: "Find me 5 Remote React developers with 5+ years experience",
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2   gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block" : "block  "}
        >
          <Button
            variant="ghost"
            onClick={async () => onQuery(suggestedAction.action)}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col shadow-lg w-full h-auto justify-start items-start"
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
