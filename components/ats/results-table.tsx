"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/lib/types/types";

import {
  MapPin,
  Clock,
  DollarSign,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ResultsTableProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  isLoading?: boolean;
  sortCriteria?: string;
  sortOrder?: "asc" | "desc";
}

export function ResultsTable({
  candidates,
  onSelectCandidate,
  isLoading = false,
  sortCriteria,
  sortOrder,
}: ResultsTableProps) {
  const [hoveredCandidate, setHoveredCandidate] = useState<string | null>(null);

  const getSortIcon = () => {
    if (!sortCriteria) return <ArrowUpDown className="h-3 w-3" />;
    return sortOrder === "desc" ? (
      <TrendingDown className="h-3 w-3" />
    ) : (
      <TrendingUp className="h-3 w-3" />
    );
  };

  const getSortLabel = () => {
    if (!sortCriteria) return "No sorting";
    const criteriaLabels = {
      experience: "Experience",
      salary: "Salary",
      availability: "Availability",
      skills_match: "Skills Match",
    };
    return `${criteriaLabels[sortCriteria as keyof typeof criteriaLabels]} (${
      sortOrder === "desc" ? "High to Low" : "Low to High"
    })`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Results</h2>
          {sortCriteria && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getSortIcon()}
              <span>{getSortLabel()}</span>
            </div>
          )}
        </div>
        <motion.p
          key={candidates.length}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          {isLoading
            ? "Searching..."
            : `${candidates.length} candidate${
                candidates.length !== 1 ? "s" : ""
              } found`}
        </motion.p>
      </div>

      {/* Scrollable results */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                      <div className="flex gap-2">
                        <div className="h-3 bg-muted rounded animate-pulse w-16" />
                        <div className="h-3 bg-muted rounded animate-pulse w-20" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : candidates.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  No candidates to display
                </p>
                <p className="text-xs text-muted-foreground">
                  Try searching for candidates with different criteria!
                </p>
              </motion.div>
            ) : (
              candidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  layout // parent layout animation
                  layoutId={candidate.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    layout: { duration: 0.3 },
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHoveredCandidate(candidate.id)}
                  onHoverEnd={() => setHoveredCandidate(null)}
                  onClick={() => {
                    onSelectCandidate(candidate);
                  }}
                  className="relative p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group hover:shadow-2xl"
                >
                  {/* Rank indicator */}
                  <div className="absolute -left-2 top-3 bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                    {index + 1}
                  </div>

                  <div className="space-y-2 ml-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-sm">
                            {candidate.full_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {candidate.title}
                          </p>
                        </div>
                        {hoveredCandidate === candidate.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: 0.2 }}
                            className="text-xs text-muted-foreground"
                          >
                            Click for details
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.15 }}
                      className="grid grid-cols-3 gap-2 text-xs text-muted-foreground"
                    >
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{candidate.years_experience}y exp</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>
                          $
                          {Math.round(
                            Number.parseInt(candidate.desired_salary_usd) / 1000
                          )}
                          k
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.3 }}
                      className="flex flex-wrap gap-1"
                    >
                      {candidate.skills
                        .split(";")
                        .slice(0, 3)
                        .map((skill, skillIndex) => (
                          <motion.div
                            key={skillIndex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: index * 0.05 + 0.35 + skillIndex * 0.05,
                            }}
                          >
                            <Badge
                              variant="secondary"
                              className="text-xs px-1 py-0"
                            >
                              {skill.trim()}
                            </Badge>
                          </motion.div>
                        ))}
                      {candidate.skills.split(";").length > 3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.5 }}
                        >
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            +{candidate.skills.split(";").length - 3}
                          </Badge>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Expanding section - stays mounted */}
                    <motion.div
                      layout
                      animate={{
                        height: hoveredCandidate === candidate.id ? "auto" : 0,
                        opacity: hoveredCandidate === candidate.id ? 1 : 0,
                      }}
                      className="overflow-hidden text-xs text-muted-foreground border-t pt-2 mt-2"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <span>Available: {candidate.availability_weeks}w</span>
                        <span>Notice: {candidate.notice_period_weeks}w</span>
                        <span>Relocate: {candidate.willing_to_relocate}</span>
                        <span>Work: {candidate.work_preference}</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {candidates.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing top {Math.min(candidates.length, 50)} results</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              Export Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
