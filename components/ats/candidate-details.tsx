"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Candidate } from "@/lib/types/types";
import {
  MapPin,
  Clock,
  DollarSign,
  Globe,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CandidateDetailsProps {
  candidate: Candidate;
  onClose: () => void;
  open: boolean;
}

export function CandidateDetails({
  candidate,
  onClose,
  open,
}: CandidateDetailsProps) {
  return (
    <AnimatePresence>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col"
          >
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl font-medium">
                {candidate.full_name}
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className="flex-1 p-4 overflow-y-scroll">
              <div className="space-y-6">
                {/* Basic Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="font-medium mb-3 text-lg">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">Title</p>
                      <p className="font-medium">{candidate.title}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Location
                      </p>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>{candidate.location}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Experience
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span>{candidate.years_experience} years</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Desired Salary
                      </p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        <span className="font-semibold">
                          $
                          {Number.parseInt(
                            candidate.desired_salary_usd
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Skills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-medium mb-3 text-lg">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.split(";").map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + index * 0.05 }}
                      >
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300"
                        >
                          {skill.trim()}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Work Preferences */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-medium mb-3 text-lg">Work Preferences</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Work Preference
                      </p>
                      <Badge variant="outline" className="w-fit">
                        {candidate.work_preference}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Willing to Relocate
                      </p>
                      <Badge
                        variant={
                          candidate.willing_to_relocate === "Yes"
                            ? "default"
                            : "secondary"
                        }
                        className="w-fit"
                      >
                        {candidate.willing_to_relocate}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Notice Period
                      </p>
                      <p>{candidate.notice_period_weeks} weeks</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Open to Contract
                      </p>
                      <Badge
                        variant={
                          candidate.open_to_contract === "Yes"
                            ? "default"
                            : "secondary"
                        }
                        className="w-fit"
                      >
                        {candidate.open_to_contract}
                      </Badge>
                    </div>
                  </div>
                </motion.div>

                {/* Education & Background */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-medium mb-3 text-lg">
                    Education & Background
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Education Level
                      </p>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        <span>{candidate.education_level}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Degree Major
                      </p>
                      <p>{candidate.degree_major}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Languages
                      </p>
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4 text-indigo-500" />
                        <span>{candidate.languages}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Visa Status
                      </p>
                      <Badge variant="outline" className="w-fit">
                        {candidate.visa_status}
                      </Badge>
                    </div>
                  </div>
                </motion.div>

                {/* Summary */}
                {candidate.summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="font-medium mb-3 text-lg">Summary</h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                      <p className="text-sm leading-relaxed">
                        {candidate.summary}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Additional Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="font-medium mb-3 text-lg">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Remote Experience
                      </p>
                      <p>{candidate.remote_experience_years} years</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Availability
                      </p>
                      <p>{candidate.availability_weeks} weeks</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Citizenship
                      </p>
                      <p>{candidate.citizenships}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Last Active
                      </p>
                      <p>
                        {new Date(candidate.last_active).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* LinkedIn */}
                {candidate.linkedin_url && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 className="font-medium mb-3 text-lg">Links</h3>
                    <a
                      href={candidate.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      LinkedIn Profile
                    </a>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </SheetContent>
      </Sheet>
    </AnimatePresence>
  );
}
